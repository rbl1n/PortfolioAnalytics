## Context

### 現狀

目前 MVP 是單頁式架構：

- **HTML**：`index.html`（118 行）— header + 篩選區 + 3 個圖表區 + 基金詳情區
- **JS**：`app.js`（395 行）— 單一檔案、全域狀態、4 個 Chart.js instance
- **CSS**：`styles.css`（186 行）— 長輩友善設計（大字、簡潔、漲紅跌綠）
- **資料**：`data.json`（20 檔基金 × 11 個月份），由 Python 從 Excel 解析產生

### 約束

- 維持 vanilla JS + Chart.js，不引入前端框架
- 靜態部署（GitHub Pages / Vercel）
- 單一使用者（長輩）
- 僅提供可視化，不提供投資建議
- RWD 響應式，字體大、操作直覺

---

## Goals / Non-Goals

**Goals:**

- 將單頁式改為 4 Tab 分頁架構
- 實作跨 Tab 上下文連貫（symbol context）
- 支援多維度 Tag 篩選 + 儲存 Watchlist
- 折線圖支援含息切換、多線比較、查價線
- 計算並顯示年化報酬
- 庫存分析（分佈、配息、損益排行）

**Non-Goals:**

- 不做 K 線圖（資料無 OHLC）
- 不做大盤/匯率疊加（資料來源不存在）
- 不填充基金靜態資料（Tab 3 僅空殼）
- 不做欄位自訂功能（長期目標，本次固定欄位）
- 不引入 build tool 或打包工具

---

## Decisions

### D1：Tab 切換機制 — CSS Class Toggle vs Hash Router

| 方案 | 說明 |
|------|------|
| **A. CSS Class Toggle ✅ 採用** | 所有 Tab 內容在同一 HTML 中，用 `.tab-active` class 控制顯示/隱藏 |
| B. Hash Router | 用 `window.location.hash` 驅動頁面切換 |

**決策理由**：CSS Toggle 最簡單，不需要處理瀏覽器歷史。長輩不會用瀏覽器上一頁，也不需要分享 URL。所有 Tab 的狀態共享同一個 JS scope，跨 Tab 連貫（symbol context）的實作最直覺。

### D2：JS 架構 — 模組化拆分

現有 `app.js` 是 395 行單檔。加上新功能後預估 800-1200 行，需要拆分。

```
src/
├── index.html
├── styles.css
├── js/
│   ├── main.js          — 入口、init、Tab 切換
│   ├── state.js         — 全域狀態管理（AppState 物件）
│   ├── watchlist.js     — Tab 1：Watchlist 渲染、Tag 篩選、儲存
│   ├── chart.js         — Tab 2：走勢分析、多線圖、查價線
│   ├── fund-info.js     — Tab 3：基金資料（空殼）
│   ├── analysis.js      — Tab 4：庫存分析、分佈圖、損益排行
│   └── utils.js         — 共用工具（幣別轉換、格式化、年化報酬計算）
```

**決策理由**：用 ES Module（`<script type="module">`）拆分，瀏覽器原生支援，不需要 bundler。每個 Tab 一個檔案，職責清晰。`state.js` 集中管理全域狀態，避免散落的全域變數。

### D3：全域狀態設計 — AppState 物件

```javascript
// state.js
export const AppState = {
    // 原始資料
    rawData: null,

    // 當前 Tab
    activeTab: 'watchlist',   // 'watchlist' | 'chart' | 'fund-info' | 'analysis'

    // Symbol Context（跨 Tab 連貫的核心）
    selectedCert: null,       // 當前選中的基金憑證號

    // 篩選器狀態
    filters: {
        bank: 'all',
        currency: 'all',
        dividendType: 'all',
        type: 'all',          // 單筆/月扣
    },

    // Watchlist 設定
    watchlists: [],           // [{ name: '配息基金', filters: {...} }, ...]
    activeWatchlistIndex: 0,

    // 走勢圖設定
    chartConfig: {
        selectedCerts: [],    // 多選：要比較的基金 cert 列表
        includeDiv: true,     // 含息/不含息
        aggregateMode: false, // 是否加總模式
    },

    // 篩選後的基金 Map
    filteredFunds: {},
};
```

**決策理由**：集中式狀態管理讓跨 Tab 連貫成為自然——切換 Tab 時只需讀取 `AppState.selectedCert`，不需要事件傳遞。Watchlist 設定存入 `localStorage` 做持久化。

### D4：跨 Tab 連貫（Symbol Context）

**核心機制**：

1. 在 Watchlist 點擊一行 → 設定 `AppState.selectedCert` → 自動切換到走勢分析 Tab
2. 切換到任何 Tab 時，該 Tab 會讀取 `AppState.selectedCert` 作為預設
3. 每個 Tab 有獨立的操作空間（如走勢分析可以再選更多基金做比較），但初始上下文來自 symbol context

```
Watchlist 點擊 row
    → AppState.selectedCert = cert
    → switchTab('chart')
    → chart.js 讀取 AppState.selectedCert
    → 渲染該基金走勢
```

### D5：Tag 篩選器 — 替代下拉選單

現有 MVP 用 `<select>` 下拉選單。改為 Tag 按鈕式篩選：

```html
<!-- 範例：幣別 Tag -->
<div class="tag-group" data-dimension="currency">
    <button class="tag active" data-value="all">全部</button>
    <button class="tag" data-value="USD">USD</button>
    <button class="tag" data-value="NTD">NTD</button>
    <button class="tag" data-value="CNY">CNY</button>
</div>
```

**決策理由**：Tag 按鈕比下拉選單更直覺——所有選項一目了然，不需要展開。長輩對「點按鈕」比「選下拉」更友善。active 狀態用顏色區分。

### D6：年化報酬計算

```javascript
// utils.js
function annualizedReturn(beginValue, endValue, months) {
    if (beginValue <= 0 || months <= 0) return null;
    const totalReturn = (endValue - beginValue) / beginValue;
    const years = months / 12;
    return Math.pow(1 + totalReturn, 1 / years) - 1;
}
```

兩種年化報酬：

1. **實際年化**（含息含成本）：`annualizedReturn(投入成本, 現值 + 累計配息, 持有月數)`
2. **基金表現年化**（含息不含成本）：用 `return_rate` 欄位的含息報酬率折算

**注意**：`data.json` 目前沒有「投入成本」欄位。最新月份的 `current_value - profit_loss` 可推算原始投入。

### D7：Watchlist 表格欄位（本次固定）

| 欄位 | 資料來源 | 備註 |
|------|----------|------|
| 基金名稱 | `fund.name` | 可點擊 → 連動走勢分析 |
| 銀行 | `fund.bank` | |
| 淨值/現值 | `history[latest].current_value` | 含幣別單位 |
| 實際年化報酬 | 計算：含息含成本 | 🟢正/🔴負 |
| 基金表現年化 | 計算：含息不含成本 | 🟢正/🔴負 |
| 月趨勢 | `history[latest].trend` | ▲/▼/— |

### D8：Chart.js 查價線（Crosshair）

Chart.js 內建的 tooltip 已支援 hover 顯示數值。加上 `interaction.mode: 'index'` 可同時顯示同一 x 軸上所有 dataset 的值，這就是「查價線」效果。不需要額外 plugin。

---

## Risks / Trade-offs

| 風險 | 嚴重度 | 緩解策略 |
|------|:------:|----------|
| ES Module 在舊瀏覽器不支援 | 低 | 長輩用 Chrome/Safari，皆已支援。若需要可加 `nomodule` fallback |
| localStorage 被清除導致 Watchlist 設定遺失 | 中 | 提供「匯出/匯入設定」按鈕（列為 nice-to-have） |
| 幣別轉換仍用硬編碼匯率（USD×32, CNY×4.5） | 中 | 本次維持不變，未來可從外部 API 取得。需在 UI 標明「約當值」 |
| 年化報酬計算依賴推算的「投入成本」 | 中 | 需驗證：`current_value - profit_loss` 是否確實等於原始投入 |
| 多線圖超過 5 條時可讀性差 | 低 | UI 限制最多同時比較 5 檔 |

---

## Open Questions

1. **投入成本的推算**：`current_value - profit_loss` 是否等於原始投入金額？需要跟 data-parser 的邏輯對照確認。
2. **月配息金額**：目前 `data.json` 只有 `cumulative_dividend`，要算「單月配息」需要相鄰月份相減。這個邏輯放在前端（JS）還是後端（Python）？建議放前端，避免改動 data-parser。

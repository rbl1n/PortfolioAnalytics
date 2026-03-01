## Why

目前 MVP 是一頁式報表，以「圖表」為中心。但長輩的實際需求是「帶著問題來查詢，用可視化結果自行判斷」。現有介面缺乏時間區間選擇、年化報酬、多維度組合篩選，且所有資訊無結構呈現，導致 21+ 檔基金同時顯示時資訊過載。

參考看盤軟體的 Tab 分頁架構，將介面改造為「以使用者意圖為導向」的決策儀表板，讓長輩能透過 Watchlist → 走勢分析 → 庫存分析的流程，高效查詢資產狀況。

## What Changes

- 將一頁式報表改為 **4 個 Tab 分頁**架構（部位總覽 / 走勢分析 / 基金資料 / 庫存分析）
- Tab 1（部位總覽）：實作 **Watchlist 機制**，含多維度 Tag 篩選與儲存清單功能
- Tab 2（走勢分析）：折線圖取代靜態圖表，支援含息/不含息切換、多線比較、查價線（Crosshair）、多檔加總走勢
- Tab 3（基金資料）：**本次只建空殼**，靜態資料來源尚未建立
- Tab 4（庫存分析）：配置分佈圓餅圖、配息收入走勢、損益排行
- 實作 **跨 Tab 上下文連貫**：在 Watchlist 點擊標的 → 自動切換至走勢分析頁顯示該標的
- 新增**年化報酬**計算指標（實際年化 vs 基金表現年化）
- Watchlist 欄位長期支援使用者自訂顯示/排序（本次先以固定欄位實作）

## 非目標

- ❌ 不提供買入/贖回建議 — 僅提供可視化，長輩自行判斷
- ❌ 不支援多用戶 — 僅一位長輩使用
- ❌ 不做大盤/匯率疊加對比（列為未來 scope）
- ❌ Tab 3 基金靜態資料內容（資料來源尚未建立）
- ❌ 不引入前端框架（維持 vanilla JS + Chart.js）

## Capabilities

### New Capabilities

- `tab-navigation`：Tab 分頁架構與跨 Tab 上下文連貫機制（symbol context）
- `watchlist`：部位總覽頁，含多維度 Tag 篩選、儲存自選清單、可點擊連動其他 Tab
- `chart-analysis`：走勢分析頁，折線圖支援含息切換、多線比較、查價線、多檔加總
- `position-analysis`：庫存分析頁，配置分佈、配息收入、損益排行
- `return-metrics`：年化報酬計算邏輯（實際年化含成本 / 基金表現年化不含成本）
- `fund-info-shell`：基金資料頁空殼（靜態頁面，無資料）

### Modified Capabilities

- `asset-overview`：首頁佈局從單頁全覽改為 Tab 架構下的部位總覽
- `dimension-filter`：篩選器從下拉選單改為 Tag 式，並整合進 Watchlist 頁
- `bank-cash-flow`：現金流分析整合至庫存分析 Tab 中
- `fund-detail`：個別基金詳情整合至走勢分析 Tab，加入年化報酬

## Impact

- **前端**：`src/index.html`、`src/app.js`、`src/styles.css` 需大幅重構
- **資料**：`data.json` 結構不需變動，現有欄位足以支撐所有新功能
- **data-parser**：不需修改（Python 解析邏輯不變）
- **部署**：仍為靜態網站，部署方式不變
- **儲存**：Watchlist 設定使用 `localStorage` 持久化

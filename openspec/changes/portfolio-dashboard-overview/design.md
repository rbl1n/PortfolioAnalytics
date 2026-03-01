## Context

長輩目前依賴 Excel 來追蹤橫跨多家銀行的 20+ 檔基金與保單部位。Excel 按月份分頁（0228~1231），雖然紀錄詳盡，但在手機上難以閱讀，且缺乏跨月、跨基金的視覺化走勢圖。

本專案將建立一個靜態 Web Dashboard，將這些 Excel 資料轉換為圖表，方便長輩掌握總資產、各銀行配息現金流，以及單一基金績效（含息/不含息）。

## Goals / Non-Goals

**Goals:**

- 建立一個 Python 腳本，將 Excel 歷史資料抽取並正規化為單一 JSON 結構。
- 實作單頁 Web 應用程式 (SPA)，讀取該 JSON 並透過 Chart.js 繪製圖表。
- 支援多維度篩選與含息/不含息切換。
- 確保 UI 適合長輩使用：高對比色、大字體、操作明確、RWD。

**Non-Goals:**

- 不涉及後端資料庫或即時 API 同步。
- 不處理編輯或寫入資料的需求（資料更新流程：長輩更新 Excel → 重新執行 parse 腳本 → push 更新 JSON）。

## Decisions

### 1. 資料架構：靜態 JSON 檔案 + 預先計算

**Rationale**: 考量到資料量小（每年約 300 筆紀錄），為保持部署與架構最簡化，採用 build-time pre-processing。由 Python 腳本先算好所有的 NTD 換算、累計損益等，產出一份 `data.json`。前端僅負責呈現與簡單的篩選過濾，不負責複雜的金融計算，避免前後端邏輯重複與瀏覽器效能問題。

### 2. 圖表套件：Chart.js

**Rationale**: 需求以折線圖（走勢）、圓餅圖（佔比）、長條圖（配息）為主。Chart.js 輕量、可用 CDN 引入，支援 RWD 與基本互動（Tooltip），完全吻合「盡量簡單」的技術選擇，不需引入 D3.js 或 ECharts 等過於龐大的庫。

### 3. CSS 設計：原生 CSS (Vanilla CSS) 與 CSS Variables

**Rationale**: 為達成「大字體、高對比」的長輩友善設計，且要易於維護，採用純 CSS 搭配預定的 CSS 變數（主題色、次要色、危險色—紅綠漲跌需符合台灣習慣 [紅漲綠跌]）。不使用 TailwindCSS 以避免初學者/接手者的學習成本，維持專案極簡。

### 4. 漲跌趨勢標示邏輯

**Rationale**: 為取代易錯的舊有 DU 欄位， Python 解析時，會自動比對同一憑證 (cert) 在 n 月與 n-1 月的 `現值` 數據。若 T > T-1 則標記 `direction: 'up'`，反之 `down`。前端依此 flag 決定以紅色（漲）或綠色（跌）渲染數值。

## Risks / Trade-offs

- **[Risk] Excel 格式異動**: 長輩可能會在未來月份新增不同格式的欄位或改變排版。
  - **Mitigation**: Python 解析腳本需設計得足夠強健（依賴標題名稱對應而非固定欄位 index），並在防呆時輸出警告而非直接 crash。
- **[Risk] 資料更新流程依賴開發者**: 目前需重新執行 Python 帶來更新。
  - **Mitigation**: 第一階段先求有（MVP），後續階段（未來計畫）可將資料源轉向 Google Sheets，並改用 Client-side fetch，達成去開發者介入的更新流程。

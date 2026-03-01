## 1. 基礎架構重構

- [ ] 1.1 引入 Pico CSS（CDN），調整 `index.html` 的 `<head>` 引用，確認基礎樣式正常渲染
- [ ] 1.2 建立 `src/js/` 目錄結構，建立 `state.js`（AppState 物件）和 `main.js`（入口 + init）
- [ ] 1.3 將 `index.html` 改為 Tab 分頁架構（4 個 Tab 按鈕 + 4 個 Tab 內容區域），驗證 Tab 切換功能正常
- [ ] 1.4 建立 `utils.js`：實作幣別轉換、數值格式化、年化報酬計算函數，撰寫簡易測試驗證公式正確

## 2. Tab 1 — 部位總覽（Watchlist）

- [ ] 2.1 建立 `watchlist.js`：實作 Tag 篩選器 UI（銀行/幣別/配息/投資型態），替換原有下拉選單
- [ ] 2.2 實作 Watchlist 表格渲染（名稱/銀行/現值/實際年化/基金年化/月趨勢），驗證資料正確顯示
- [ ] 2.3 實作表格排序功能（點擊欄位標題切換升降序）
- [ ] 2.4 實作儲存 Watchlist Preset 功能（新增/載入/刪除），驗證 localStorage 持久化正常
- [ ] 2.5 實作 Watchlist 行點擊 → 設定 symbol context → 自動切換到走勢分析 Tab

## 3. Tab 2 — 走勢分析（Chart）

- [ ] 3.1 建立 `chart.js`：實作單一基金折線圖，讀取 AppState.selectedCert，驗證從 Watchlist 連動正常
- [ ] 3.2 實作含息/不含息 toggle 切換（profit_loss vs profit_loss_ex_div）
- [ ] 3.3 實作基金選擇器（Chart Tab 內的 dropdown/search），可在 Chart 頁獨立切換基金
- [ ] 3.4 實作多線比較功能（加入額外基金至同一圖表，上限 5 條，各線不同顏色 + 圖例）
- [ ] 3.5 實作加總走勢模式（多檔選擇 → 一條合計線）
- [ ] 3.6 實作 Crosshair 查價線（Chart.js interaction.mode: 'index'），驗證 hover 時顯示所有線的數值
- [ ] 3.7 在圖表上方加入摘要卡片（基金名稱/現值/年化報酬/累計配息/趨勢）

## 4. Tab 3 — 基金資料（Fund Info Shell）

- [ ] 4.1 建立 `fund-info.js`：渲染空殼頁面，顯示 symbol context 基金名稱 + 「建置中」訊息

## 5. Tab 4 — 庫存分析（Position Analysis）

- [ ] 5.1 建立 `analysis.js`：實作資產分佈圓餅圖（依銀行/幣別/配息類型切換），從原有 renderDistributionChart 遷移
- [ ] 5.2 實作月配息收入柱狀圖（前端計算 cumDiv 差值），驗證第一個月的邊界情況處理
- [ ] 5.3 實作損益排行橫向長條圖（全部基金依 profit_loss 排序，正值紅色/負值綠色）
- [ ] 5.4 遷移銀行現金流堆疊柱狀圖至此 Tab，確認受 Watchlist 篩選影響
- [ ] 5.5 遷移總資產走勢圖至此 Tab，確認受 Watchlist 篩選影響

## 6. 跨 Tab 整合與 Responsiveness

- [ ] 6.1 驗證 symbol context 在所有 Tab 間正確傳遞（Watchlist → Chart → Fund Info → Analysis）
- [ ] 6.2 驗證篩選器狀態跨 Tab 持久化（在 Watchlist 設定篩選 → 切換到 Analysis → 圖表應反映篩選結果）
- [ ] 6.3 實作 RWD 響應式佈局（Tab bar 在 mobile 可用、表格水平滾動、圖表自適應寬度）
- [ ] 6.4 套用 Pico CSS 深色模式支援，驗證圖表顏色在深淺模式下皆可讀

## 7. 清理與驗證

- [ ] 7.1 移除舊的 `app.js` 單檔，確認所有功能由新的 JS 模組覆蓋
- [ ] 7.2 更新 `styles.css`：保留自訂樣式（漲跌色、Tag 按鈕、圖表容器），移除被 Pico 取代的部分
- [ ] 7.3 端對端驗證：開啟瀏覽器測試完整使用流程（篩選 → 點擊 → 走勢 → 切回 → 排序 → 儲存清單）
- [ ] 7.4 建立 `data-dictionary.md` 於 `openspec/specs/data-parser/` 下，記錄 data.json 各欄位定義

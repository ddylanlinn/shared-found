# 疑難排解指南

本指南整理了常見問題與解決方案。

## 📋 目錄

- [Google Sheets 相關問題](#google-sheets-相關問題)
- [Google Apps Script 相關問題](#google-apps-script-相關問題)
- [LINE Bot 相關問題](#line-bot-相關問題)
- [Web App 相關問題](#web-app-相關問題)
- [部署相關問題](#部署相關問題)

---

## Google Sheets 相關問題

### 問題 1：找不到 Sheet ID

**解決方式**：

1. 開啟你的 Google Sheet
2. 查看瀏覽器網址列：
   ```
   https://docs.google.com/spreadsheets/d/{這段就是 Sheet ID}/edit
   ```
3. 複製 `d/` 和 `/edit` 之間的那串文字

### 問題 2：Config Tab 的分類沒有被讀取

**可能原因**：
- 分類對照表的欄位位置錯誤（應該在 D-E 欄）
- 第一列沒有標題（應該是 `Category` 和 `Subcategory`）

**解決方式**：

1. 確認 D1 是 `Category`，E1 是 `Subcategory`
2. 確認資料從 D2:E2 開始填入
3. 確認每一列都有填入大分類和小分類

### 問題 3：PIN 碼無法登入

**可能原因**：
- Config Tab 的 PinCode 設定錯誤
- Web App 的 auth.js 中 pinCode 寫死為其他值

**解決方式**：

1. 確認 Config Tab 的 A4:B4 是 `PinCode | 8888`
2. 或修改 `src/stores/auth.js` 中的 `pinCode` 值

---

## Google Apps Script 相關問題

### 問題 1：執行時出現「SHEET_ID not found」錯誤

**可能原因**：
- 未設定 Script Properties
- SHEET_ID 拼錯

**解決方式**：

1. 在 Apps Script 編輯器，點擊「專案設定」
2. 捲動到「指令碼屬性」
3. 確認有 `SHEET_ID` 屬性，且值是正確的 Sheet ID
4. 注意：屬性名稱大小寫要一致

### 問題 2：部署時出現授權錯誤

**可能原因**：
- 未授權 Google 帳號存取權限

**解決方式**：

1. 部署時點擊「授權存取權」
2. 選擇你的 Google 帳號
3. 會顯示「此應用程式未經 Google 驗證」→ 點擊「進階」
4. 點擊「前往 FamilyFinance_DB（不安全）」
5. 點擊「允許」

### 問題 3：API 測試時回傳 undefined 或 null

**可能原因**：
- SheetService.gs 中的函式有語法錯誤
- Sheet 的分頁名稱不正確（應該是 `Data` 和 `Config`）

**解決方式**：

1. 在 Apps Script 編輯器，點擊「執行記錄」查看錯誤訊息
2. 確認 Data Tab 和 Config Tab 的名稱正確
3. 確認程式碼中沒有紅色波浪線（語法錯誤）

### 問題 4：LINE Webhook 驗證失敗

**可能原因**：
- Web App URL 錯誤
- 部署時選擇的執行身份或存取權限錯誤

**解決方式**：

1. 確認 Web App URL 完整（包含 `/exec`）
2. 重新部署，確認：
   - 執行身份：「我」
   - 存取權限：「所有人」
3. 部署後取得新的 URL，重新設定 LINE Webhook

---

## LINE Bot 相關問題

### 問題 1：Bot 沒有回覆

**可能原因 1**：Webhook 未啟用

**解決方式**：
1. LINE Developers Console → Messaging API
2. 確認「Use webhook」是 Enabled

**可能原因 2**：自動回覆訊息未關閉

**解決方式**：
1. LINE Official Account Manager → 回應設定
2. 關閉「自動回應訊息」
3. 開啟「Webhook」

**可能原因 3**：Google Apps Script 有錯誤

**解決方式**：
1. Apps Script 編輯器 → 執行記錄
2. 查看是否有錯誤訊息
3. 檢查 LineService.gs 的程式碼

### 問題 2：Bot 回覆「格式錯誤」

**可能原因**：
- 訊息格式不符合規則

**正確格式**：
```
項目 金額 [可選分類]
```

**範例**：
```
午餐 200          ← 正確
捷運 30 交通      ← 正確
咖啡80           ← 錯誤（缺少空格）
咖啡 八十        ← 錯誤（金額必須是數字）
```

### 問題 3：Bot 回覆「記帳失敗」

**可能原因**：
- Google Apps Script 無法寫入 Sheet
- SHEET_ID 錯誤
- Data Tab 的欄位結構錯誤

**解決方式**：

1. 檢查 Apps Script 執行記錄
2. 確認 SHEET_ID 正確
3. 確認 Data Tab 有 8 個欄位（Date, Amount, Category, Subcategory, Label, Method, Currency, Note）

---

## Web App 相關問題

### 問題 1：本地開發時無法連接 API

**可能原因**：
- `.env` 檔案未設定
- VITE_GAS_API_URL 錯誤

**解決方式**：

1. 確認專案根目錄有 `.env` 檔案
2. 確認內容：
   ```
   VITE_GAS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
3. 重新啟動開發伺服器：`npm run dev`

### 問題 2：PIN 登入後立刻又跳回登入畫面

**可能原因**：
- localStorage 被清除
- 瀏覽器隱私模式

**解決方式**：

1. 不要使用無痕模式
2. 檢查瀏覽器開發者工具 → Application → Local Storage
3. 確認有 `auth: "true"` 項目

### 問題 3：Dashboard 沒有資料

**可能原因**：
- API 呼叫失敗
- Google Sheet 沒有資料

**解決方式**：

1. 開啟瀏覽器開發者工具（F12）
2. 切換到 Console 分頁，查看錯誤訊息
3. 切換到 Network 分頁，查看 API 請求狀態
4. 確認 Google Sheet 的 Data Tab 有測試資料

### 問題 4：新增交易後沒有反應

**可能原因**：
- API 呼叫失敗
- 表單驗證錯誤

**解決方式**：

1. 開啟瀏覽器開發者工具 → Console
2. 查看錯誤訊息
3. 確認表單所有必填欄位都有填寫
4. 確認分類和小分類的選項正確

---

## 部署相關問題

### 問題 1：GitHub Pages 顯示 404

**可能原因**：
- `vite.config.js` 的 `base` 設定錯誤
- gh-pages 分支未正確建立

**解決方式**：

1. 確認 `base` 的值與 repo 名稱一致：
   ```javascript
   base: '/family-finance-web/',  // 要與 repo 名稱一致
   ```

2. 重新執行部署：
   ```bash
   npm run deploy
   ```

3. 確認 GitHub repo 有 `gh-pages` 分支

### 問題 2：部署後頁面空白

**可能原因 1**：路徑問題

**解決方式**：
1. 確認 `vite.config.js` 的 `base` 設定
2. 檢查瀏覽器 Console 是否有 404 錯誤

**可能原因 2**：環境變數未設定

**解決方式**：
1. 確認有 `.env.production` 檔案
2. 或確認 `.env` 有正確的 `VITE_GAS_API_URL`

### 問題 3：靜態資源載入失敗

**可能原因**：
- 相對路徑錯誤

**解決方式**：

1. 確認 `index.html` 中的路徑使用 `./` 或 `/` 開頭
2. 確認 `vite.config.js` 的 `base` 設定正確

### 問題 4：更新後看不到新版本

**可能原因**：
- 瀏覽器快取

**解決方式**：

1. 強制重新載入：`Ctrl+Shift+R`（Windows）或 `Cmd+Shift+R`（Mac）
2. 清除瀏覽器快取
3. 使用無痕模式測試

---

## CORS 錯誤

### 問題：瀏覽器 Console 顯示 CORS 錯誤

**錯誤訊息**：
```
Access to fetch at 'https://script.google.com/...' from origin 'https://your-username.github.io' has been blocked by CORS policy
```

**可能原因**：
- Google Apps Script 未設定為「所有人」存取

**解決方式**：

1. 在 Apps Script 編輯器，點擊「部署」→「管理部署作業」
2. 點擊目前的部署旁的鉛筆圖示（編輯）
3. 確認「誰可以存取」是「所有人」
4. 點擊「部署」

---

## 效能問題

### 問題：Dashboard 載入很慢

**可能原因**：
- 交易記錄太多（數千筆以上）

**解決方式**：

1. 在 `SheetService.gs` 的 `getTransactions` 中加入分頁功能
2. 只載入最近 3 個月的資料
3. 使用虛擬滾動（Virtual Scroll）顯示列表

### 問題：LINE Bot 回覆很慢

**可能原因**：
- Google Apps Script 冷啟動

**解決方式**：

這是正常現象，Google Apps Script 在閒置一段時間後會進入「冷啟動」狀態，第一次呼叫會比較慢（2-3 秒）。無法完全避免，但可以：

1. 經常使用 Bot，保持「熱狀態」
2. 或接受這個延遲（通常只有第一次慢）

---

## 資料問題

### 問題：分類統計不正確

**可能原因**：
- 交易記錄的 Category 欄位有空白或拼寫錯誤

**解決方式**：

1. 檢查 Google Sheet 的 Data Tab
2. 確認所有交易的 Category 欄位都有值
3. 確認拼寫一致（例如「食物」不要有時寫成「飲食」）

### 問題：本月支出統計不準確

**可能原因**：
- Date 欄位格式錯誤
- Date 欄位是文字而非日期

**解決方式**：

1. 確認 Data Tab 的 Date 欄位格式是「日期」
2. 確認日期格式統一（例如：2026/2/3）

---

## 其他問題

### 問題：如何備份資料？

**方式 1**：Google Sheet 內建備份

1. 檔案 → 建立副本
2. 定期手動備份

**方式 2**：匯出 CSV

1. 在 Data Tab，點擊 檔案 → 下載 → CSV
2. 儲存到本地

**方式 3**：使用 Google Drive 版本歷史記錄

1. 檔案 → 版本記錄 → 查看版本記錄
2. 可還原到任何時間點的版本

### 問題：如何新增分類？

**步驟**：

1. 開啟 Google Sheet 的 Config Tab
2. 在 D-E 欄（Category-Subcategory）新增一列
3. 填入新的大分類和小分類
4. 重新載入 Web App（會自動讀取新分類）

範例：
| D (Category) | E (Subcategory) |
|--------------|-----------------|
| 購物 | 服飾 |

### 問題：如何修改 PIN 碼？

**步驟**：

1. 開啟 Google Sheet 的 Config Tab
2. 找到 PinCode 那一列（通常是 A4:B4）
3. 修改 B4 的值（例如改成 1234）
4. 重新載入 Web App 即可

---

## 🆘 仍然無法解決？

如果以上方法都無法解決你的問題：

1. **檢查執行記錄**：
   - Google Apps Script 編輯器 → 執行記錄
   - 瀏覽器開發者工具 → Console

2. **重新部署**：
   - 有時重新部署 Google Apps Script 或 Web App 可以解決問題

3. **從頭再來**：
   - 如果問題複雜，可以考慮重新按照文件設定一次

4. **尋求協助**：
   - 在 GitHub repo 開 Issue
   - 附上錯誤訊息和截圖

---

## ✅ 檢查清單（出問題時使用）

### Google Sheets
- [ ] Sheet ID 正確
- [ ] Data Tab 有 8 個欄位
- [ ] Config Tab 有 4 個區塊
- [ ] 分類對照表在 D-E 欄

### Google Apps Script
- [ ] 4 個 .gs 檔案都有正確程式碼
- [ ] Script Properties 有 SHEET_ID 和 LINE_CHANNEL_ACCESS_TOKEN
- [ ] 已部署為 Web App
- [ ] 執行身份：我 / 存取權限：所有人
- [ ] 已授權 Google 帳號

### LINE Bot
- [ ] Webhook URL 正確
- [ ] Use webhook 已啟用
- [ ] 自動回覆訊息已關閉
- [ ] Channel Access Token 已填入 Script Properties

### Web App
- [ ] .env 檔案有正確的 VITE_GAS_API_URL
- [ ] vite.config.js 的 base 設定正確
- [ ] 已部署到 GitHub Pages
- [ ] GitHub Pages 已啟用（gh-pages 分支）

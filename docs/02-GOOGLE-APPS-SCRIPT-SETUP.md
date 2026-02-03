# Google Apps Script 設定指南

本指南將帶你設定後端 API（Google Apps Script），讓 LINE Bot 和 Web App 可以讀寫 Google Sheets。

## 📋 目錄

- [開啟 Apps Script 編輯器](#開啟-apps-script-編輯器)
- [建立程式檔案](#建立程式檔案)
- [設定環境變數（Script Properties）](#設定環境變數script-properties)
- [部署為 Web App](#部署為-web-app)
- [取得 Web App URL](#取得-web-app-url)
- [測試 API](#測試-api)

---

## 開啟 Apps Script 編輯器

### 步驟 1：從 Google Sheet 開啟

1. 開啟你的 `FamilyFinance_DB` 試算表
2. 點擊頂部選單：**擴充功能** → **Apps Script**
3. 會開啟新的瀏覽器分頁，這就是 **Apps Script 編輯器**

![Apps Script 編輯器示意圖]

### 步驟 2：了解編輯器介面

- **左側欄**：
  - 📄 **檔案**：顯示所有 .gs 程式檔
  - ⚙️ **專案設定**：環境變數、觸發條件等

- **中間區域**：程式碼編輯區

- **右上角**：
  - **儲存**：儲存程式碼
  - **執行**：測試執行函式
  - **部署**：發布為 Web App

---

## 建立程式檔案

我們需要建立 **4 個 .gs 檔案**：

### 步驟 1：重新命名預設檔案

1. 預設會有一個 `Code.gs` 檔案
2. 如果檔名不是 `Code.gs`，可以重新命名（點擊檔名旁的三個點 → 重新命名）

### 步驟 2：建立其他 3 個檔案

1. 點擊左側的「**+**」（新增檔案）
2. 選擇「**指令碼**」
3. 依序建立以下檔案：
   - `SheetService.gs`
   - `Parser.gs`
   - `LineService.gs`

完成後，左側應該會顯示 4 個檔案：

```
📄 Code.gs
📄 SheetService.gs
📄 Parser.gs
📄 LineService.gs
```

### 步驟 3：複製程式碼

前往 **[03-GOOGLE-APPS-SCRIPT-CODE.md](03-GOOGLE-APPS-SCRIPT-CODE.md)** 複製對應的程式碼，貼上到各檔案中。

**重要提醒：**
- 先不要執行或部署，等複製完所有程式碼後再進行
- 複製時注意不要漏掉任何一行

---

## 設定環境變數（Script Properties）

環境變數用來儲存機敏資訊（Sheet ID、LINE Token），避免寫死在程式碼中。

### 步驟 1：開啟專案設定

1. 點擊左側的「**⚙️ 專案設定**」（齒輪圖示）
2. 捲動到「**指令碼屬性**」區塊

### 步驟 2：新增 SHEET_ID

1. 點擊「**新增指令碼屬性**」
2. 填入：
   - **屬性**：`SHEET_ID`
   - **值**：你的 Sheet ID（從步驟一取得的）
3. 點擊「**儲存指令碼屬性**」

範例：
```
屬性：SHEET_ID
值：1a2b3c4d5e6f7g8h9i0jK1L2M3N4O5P6Q7R8S9T
```

### 步驟 3：新增 LINE_CHANNEL_ACCESS_TOKEN（稍後填入）

1. 再次點擊「**新增指令碼屬性**」
2. 填入：
   - **屬性**：`LINE_CHANNEL_ACCESS_TOKEN`
   - **值**：（先留空，等設定完 LINE Bot 後再回來填）
3. 點擊「**儲存指令碼屬性**」

完成後，應該會看到兩個屬性：

| 屬性 | 值 |
|------|-----|
| SHEET_ID | 1a2b3c4d... |
| LINE_CHANNEL_ACCESS_TOKEN | (待填入) |

---

## 部署為 Web App

### 步驟 1：點擊部署

1. 點擊右上角「**部署**」→「**新增部署作業**」
2. 點擊「**選取類型**」旁的齒輪圖示
3. 選擇「**網頁應用程式**」

### 步驟 2：設定部署選項

填入以下設定：

| 選項 | 值 | 說明 |
|------|-----|------|
| **說明** | Initial deployment | 部署描述（可自訂） |
| **執行身份** | **我** | ⚠️ 重要！選「我」才有權限存取你的 Sheet |
| **誰可以存取** | **所有人** | ⚠️ 重要！讓 LINE 和 Web App 可以呼叫 API |

### 步驟 3：授權存取權

第一次部署時，Google 會要求你授權：

1. 點擊「**部署**」
2. 會出現授權視窗，點擊「**審查權限**」
3. 選擇你的 Google 帳號
4. 會顯示「此應用程式未經 Google 驗證」，點擊「**進階**」
5. 點擊「**前往 FamilyFinance_DB（不安全）**」
6. 點擊「**允許**」

![授權流程示意圖]

### 步驟 4：完成部署

授權完成後，會顯示「**已部署**」畫面。

---

## 取得 Web App URL

部署完成後，會看到 **Web App URL**，格式如下：

```
https://script.google.com/macros/s/AKfycby.../exec
```

### 步驟：複製並保存 URL

1. 點擊「**複製**」按鈕
2. **務必保存這個 URL**，稍後會用在：
   - LINE Bot Webhook 設定
   - Web App 環境變數（`.env` 檔案）

範例：
```
https://script.google.com/macros/s/AKfycbyXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
```

---

## 測試 API

部署完成後，可以先測試 API 是否正常運作。

### 方法 1：瀏覽器測試（getConfig API）

1. 在瀏覽器開啟以下網址（替換成你的 Web App URL）：
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=getConfig
   ```

2. 如果設定正確，應該會看到類似以下的 JSON 回應：
   ```json
   {
     "MonthlyBudget": 30000,
     "DefaultCurrency": "TWD",
     "PinCode": "8888",
     "categories": {
       "食物": ["早餐", "午餐", "晚餐", "飲料", "零食"],
       "交通": ["捷運", "公車", "油資", "停車費"]
     },
     "labels": ["必要", "想要", "共同"],
     "methods": ["現金", "信用卡", "行動支付", "悠遊卡"]
   }
   ```

### 方法 2：Apps Script 編輯器測試

1. 在 Apps Script 編輯器中，點擊 `SheetService.gs`
2. 在編輯器上方的函式下拉選單中，選擇 `getConfig`
3. 點擊「**執行**」
4. 查看下方的「**執行記錄**」，應該會顯示設定資料

### 測試失敗？

如果測試失敗，請檢查：

- ✅ SHEET_ID 是否正確填入 Script Properties
- ✅ `SheetService.gs` 中的程式碼是否正確（參考步驟三）
- ✅ Config Tab 的資料結構是否正確（參考步驟一）

---

## ✅ 完成檢查清單

- [ ] 已開啟 Apps Script 編輯器
- [ ] 已建立 4 個 .gs 檔案（Code, SheetService, Parser, LineService）
- [ ] 已從步驟三複製所有程式碼
- [ ] 已設定 Script Properties：
  - [ ] SHEET_ID（已填入）
  - [ ] LINE_CHANNEL_ACCESS_TOKEN（待填入）
- [ ] 已部署為 Web App（執行身份：我 / 存取權限：所有人）
- [ ] 已授權 Google 帳號
- [ ] 已取得並保存 Web App URL
- [ ] 已測試 getConfig API（瀏覽器測試）

---

## 🎉 下一步

完成 Google Apps Script 設定後，前往：

👉 **[04-LINE-BOT-SETUP.md](04-LINE-BOT-SETUP.md)** 設定 LINE Bot

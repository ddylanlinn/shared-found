# LINE Bot 設定指南

本指南將帶你設定 LINE Bot，讓你可以透過 LINE 快速記帳。

## 📋 目錄

- [建立 LINE Developers 帳號](#建立-line-developers-帳號)
- [建立 Messaging API Channel](#建立-messaging-api-channel)
- [取得 Channel Access Token](#取得-channel-access-token)
- [設定 Webhook URL](#設定-webhook-url)
- [關閉自動回覆訊息](#關閉自動回覆訊息)
- [加 Bot 為好友並測試](#加-bot-為好友並測試)
- [測試記帳功能](#測試記帳功能)

---

## 建立 LINE Developers 帳號

### 步驟 1：前往 LINE Developers Console

1. 開啟 [LINE Developers Console](https://developers.line.biz/)
2. 使用你的 LINE 帳號登入（手機會收到登入通知）

### 步驟 2：建立 Provider

Provider 是一個容器，可以放多個 LINE Bot Channel。

1. 點擊「**Create a new provider**」
2. 填入 Provider 名稱：
   - 範例：`MyFamily`（可自訂，建議用英文）
3. 點擊「**Create**」

---

## 建立 Messaging API Channel

### 步驟 1：建立 Channel

1. 進入你剛建立的 Provider
2. 點擊「**Create a Messaging API channel**」

### 步驟 2：填寫 Channel 資訊

填入以下資訊：

| 欄位 | 值 | 說明 |
|------|-----|------|
| **Channel type** | Messaging API | （自動選擇） |
| **Provider** | MyFamily | （自動帶入） |
| **Channel name** | 家庭記帳 Bot | 使用者看到的 Bot 名稱 |
| **Channel description** | 家庭記帳系統 | Bot 描述 |
| **Category** | Finance | 或選擇「Personal」 |
| **Subcategory** | 依需求選擇 | 例如「Personal finance」 |
| **Email address** | your@email.com | 你的聯絡信箱 |

### 步驟 3：同意條款

1. 勾選所有同意選項：
   - ✅ LINE Official Account Terms of Use
   - ✅ LINE Official Account API Terms of Use
2. 點擊「**Create**」

![Channel 建立成功示意圖]

---

## 取得 Channel Access Token

### 步驟 1：進入 Messaging API 設定

1. 建立完成後，會自動進入 Channel 設定頁面
2. 切換到「**Messaging API**」分頁

### 步驟 2：發行 Token

1. 捲動到「**Channel access token**」區塊
2. 點擊「**Issue**」按鈕

![發行 Token 示意圖]

### 步驟 3：複製 Token

1. Token 發行成功後，會顯示一長串文字：
   ```
   abc123def456ghi789jkl012mno345pqr678stu901vwx234yz...
   ```

2. 點擊「**Copy**」按鈕複製 Token

3. **保存這個 Token**（稍後會用到）

### 步驟 4：填入 Google Apps Script

1. 回到 Google Apps Script 編輯器
2. 點擊左側「**專案設定**」（齒輪圖示）
3. 捲動到「**指令碼屬性**」
4. 找到 `LINE_CHANNEL_ACCESS_TOKEN` 屬性
5. 點擊「**編輯**」，貼上剛複製的 Token
6. 點擊「**儲存指令碼屬性**」

---

## 設定 Webhook URL

### 步驟 1：編輯 Webhook URL

1. 在「**Messaging API**」分頁，找到「**Webhook settings**」區塊
2. 點擊「**Edit**」按鈕

### 步驟 2：貼上 Google Apps Script Web App URL

1. 將你的 **Google Apps Script Web App URL** 貼上：
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

2. 點擊「**Update**」

### 步驟 3：啟用 Webhook

1. 開啟「**Use webhook**」開關（切換為 Enabled）

### 步驟 4：驗證 Webhook

1. 點擊「**Verify**」按鈕
2. 如果設定正確，會顯示「**Success**」

![Webhook 驗證成功示意圖]

**驗證失敗？**

如果顯示錯誤，請檢查：

- ✅ Google Apps Script 已正確部署為 Web App
- ✅ Web App URL 完整無誤（包含 `/exec`）
- ✅ 部署設定：執行身份「我」/ 存取權限「所有人」

---

## 關閉自動回覆訊息

LINE Official Account 預設會有自動回覆功能，必須關閉，否則會跟你的 Bot 衝突。

### 步驟 1：前往 LINE Official Account Manager

1. 在「**Messaging API**」分頁，找到「**LINE Official Account features**」區塊
2. 點擊「**Edit**」按鈕
3. 會跳轉到 **LINE Official Account Manager**（新分頁）

### 步驟 2：關閉自動回覆

1. 在左側選單中，找到「**回應設定**」或「**Response settings**」
2. 設定以下選項：

| 設定項目 | 狀態 |
|---------|------|
| **自動回應訊息** (Auto-reply messages) | ❌ 關閉 |
| **Webhook** | ✅ 開啟 |

3. 點擊「**儲存**」

![回應設定示意圖]

---

## 加 Bot 為好友並測試

### 步驟 1：掃描 QR Code

1. 回到 LINE Developers Console 的「**Messaging API**」分頁
2. 找到「**QR code**」區塊
3. 使用手機 LINE 掃描 QR code

### 步驟 2：加為好友

1. 點擊「**加入好友**」
2. Bot 會出現在你的好友列表中

![加好友示意圖]

---

## 測試記帳功能

### 測試 1：基本記帳（自動分類）

傳送訊息：
```
午餐 200
```

預期回覆：
```
✅ 記帳成功！
金額：200 TWD
分類：食物 > 午餐
備註：午餐
```

### 測試 2：指定大分類

傳送訊息：
```
捷運 30 交通
```

預期回覆：
```
✅ 記帳成功！
金額：30 TWD
分類：交通 > 捷運
備註：捷運
```

### 測試 3：指定小分類

傳送訊息：
```
咖啡 80 飲料
```

預期回覆：
```
✅ 記帳成功！
金額：80 TWD
分類：食物 > 飲料
備註：咖啡
```

### 驗證資料已寫入 Google Sheet

1. 開啟你的 `FamilyFinance_DB` 試算表
2. 查看 `Data` Tab
3. 應該會看到剛剛記帳的 3 筆記錄

| Date | Amount | Category | Subcategory | ... |
|------|--------|----------|-------------|-----|
| 2026/2/3 | 200 | 食物 | 午餐 | ... |
| 2026/2/3 | 30 | 交通 | 捷運 | ... |
| 2026/2/3 | 80 | 食物 | 飲料 | ... |

---

## 🎯 測試失敗？常見問題

### 問題 1：Bot 沒有回覆

**可能原因**：

- Webhook URL 設定錯誤
- Webhook 未啟用（Use webhook 未開啟）
- 自動回覆訊息未關閉

**解決方式**：

1. 檢查 Webhook URL 是否正確
2. 點擊「Verify」重新驗證
3. 確認自動回覆訊息已關閉

### 問題 2：Bot 回覆「記帳失敗」

**可能原因**：

- Google Apps Script 程式碼有錯誤
- SHEET_ID 設定錯誤
- Google Sheet 的 Data Tab 欄位結構不正確

**解決方式**：

1. 回到 Google Apps Script 編輯器
2. 點擊「執行」→「執行記錄」，查看錯誤訊息
3. 檢查 Data Tab 的欄位名稱是否正確（Date, Amount, Category...）

### 問題 3：格式錯誤訊息

如果傳送的訊息格式不正確，Bot 會回覆：
```
格式錯誤，請使用：項目 金額 [分類]
例如：午餐 200 或 捷運 30 交通
```

**正確格式**：
- `項目名稱` + `空格` + `金額` + `（可選）空格` + `分類`
- 金額必須是數字

---

## ✅ 完成檢查清單

- [ ] 已建立 LINE Developers 帳號
- [ ] 已建立 Provider
- [ ] 已建立 Messaging API Channel
- [ ] 已取得 Channel Access Token
- [ ] 已將 Token 填入 Google Apps Script Script Properties
- [ ] 已設定 Webhook URL
- [ ] Webhook 驗證成功（顯示 Success）
- [ ] 已關閉自動回覆訊息
- [ ] 已啟用 Webhook
- [ ] 已加 Bot 為好友
- [ ] 測試記帳功能成功（3 種格式都測試過）
- [ ] Google Sheet 的 Data Tab 有新增記錄

---

## 🎉 下一步

完成 LINE Bot 設定後，前往：

👉 **[05-WEB-APP-DEVELOPMENT.md](05-WEB-APP-DEVELOPMENT.md)** 開發 Web Dashboard

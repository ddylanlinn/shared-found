# 第三方平台設定指南

> 更新日期：2026-02-05

本文件說明如何設定專案所需的所有第三方服務。

## 📋 設定順序

1. [Google Cloud Platform](#1-google-cloud-platform)
2. [Google Sheets](#2-google-sheets)
3. [LINE Developers](#3-line-developers)
4. [Vercel](#4-vercel-部署後設定)
5. [LINE Rich Menu](#5-line-rich-menu-設定)

---

## 1. Google Cloud Platform

### 1.1 建立專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 登入 Google 帳號
3. 點擊上方「選取專案」→「新增專案」
4. 輸入專案名稱：`family-finance`
5. 點擊「建立」
6. 等待專案建立完成

### 1.2 啟用 Google Sheets API

1. 確認已選取 `family-finance` 專案
2. 在左側選單選擇「API 和服務」→「程式庫」
3. 搜尋欄輸入「Google Sheets API」
4. 點擊「Google Sheets API」進入
5. 點擊「啟用」按鈕
6. 等待啟用完成

### 1.3 建立 Service Account

1. 在左側選單選擇「API 和服務」→「憑證」
2. 點擊上方「建立憑證」→「服務帳戶」
3. 填寫服務帳戶資訊：
   - **服務帳戶名稱**：`family-finance-bot`
   - **服務帳戶 ID**：`family-finance-bot`（自動產生）
   - **描述**：`Expense Tracker 後端服務`
4. 點擊「建立並繼續」
5. 選擇角色：
   - 點擊「選取角色」下拉選單
   - 選擇「基本」→「編輯者」
6. 點擊「繼續」
7. 「授予使用者此服務帳戶的存取權」可略過
8. 點擊「完成」

### 1.4 產生金鑰（JSON）

1. 在「憑證」頁面，找到「服務帳戶」區塊
2. 點擊剛建立的服務帳戶 Email：`family-finance-bot@xxx.iam.gserviceaccount.com`
3. 進入詳細資料頁面，點擊上方「金鑰」分頁
4. 點擊「新增金鑰」→「建立新的金鑰」
5. 選擇「JSON」格式
6. 點擊「建立」
7. JSON 金鑰檔案會自動下載到電腦

### 1.5 記錄重要資訊

**從下載的 JSON 檔案中記錄以下資訊**：

```json
{
  "type": "service_account",
  "project_id": "family-finance-xxxxx",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...",  // ← 需要這個
  "client_email": "family-finance-bot@xxx.iam.gserviceaccount.com", // ← 需要這個
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

**記錄以下兩項**（稍後會用到）：
- ✅ **Service Account Email**：`client_email` 欄位
- ✅ **Private Key**：`private_key` 欄位（完整內容，包含 `-----BEGIN PRIVATE KEY-----`）

---

## 2. Google Sheets

### 2.1 建立試算表

1. 前往 [Google Sheets](https://sheets.google.com/)
2. 點擊左上角「空白」建立新試算表
3. 將試算表重新命名為「家庭記帳資料庫」

### 2.2 建立 Data Tab

1. 將預設的「工作表1」重新命名為 `Data`
2. 在第一列（標題列）輸入以下內容：

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Date | Amount | Category | Subcategory | Label | Method | Currency | Note |

3. （選用）輸入範例資料：

| Date | Amount | Category | Subcategory | Label | Method | Currency | Note |
|------|--------|----------|-------------|-------|--------|----------|------|
| 2026/2/3 | 200 | 食物 | 午餐 | 必要 | 信用卡 | TWD | 便利商店 |
| 2026/2/4 | 30 | 交通 | 捷運 | 必要 | 悠遊卡 | TWD | |

### 2.3 建立 Config Tab

1. 點擊試算表下方「+」新增工作表
2. 將新工作表命名為 `Config`
3. 輸入以下設定內容：

| A | B |
|---|---|
| MonthlyBudget | 30000 |
| PinCode | 8888 |
| DefaultCurrency | TWD |
| | |
| **Categories** | |
| 食物 | 早餐,午餐,晚餐,飲料,零食 |
| 交通 | 捷運,公車,計程車,油錢 |
| 娛樂 | 電影,遊戲,訂閱 |
| 生活 | 日用品,水電,房租 |
| | |
| **Labels** | |
| Labels | 必要,想要,共同 |
| | |
| **Methods** | |
| Methods | 現金,信用卡,行動支付,悠遊卡 |

### 2.4 分享給 Service Account

1. 點擊試算表右上角「共用」按鈕
2. 在「新增使用者和群組」欄位輸入 **Service Account Email**
   - 例如：`family-finance-bot@xxx.iam.gserviceaccount.com`
3. 權限選擇「編輯者」
4. **取消勾選**「通知使用者」（Service Account 不需要通知）
5. 點擊「共用」或「傳送」

### 2.5 記錄 Spreadsheet ID

從試算表網址取得 Spreadsheet ID：

```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
```

例如：
```
https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t/edit
```

記錄 ID：`1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t`

---

## 3. LINE Developers

### 3.1 建立 Provider

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 使用 LINE 帳號登入
3. 點擊「Create」或「建立」按鈕
4. 輸入 Provider 名稱：`Family Finance`
5. 點擊「Create」

### 3.2 建立 Messaging API Channel

1. 在 Provider 頁面點擊「Create a new channel」
2. 選擇「Messaging API」
3. 填寫 Channel 資訊：
   - **Channel type**：Messaging API
   - **Provider**：Family Finance
   - **Channel name**：`家庭記帳 Bot`
   - **Channel description**：`家庭記帳 LINE Bot`
   - **Category**：選擇「Productivity」
   - **Subcategory**：選擇「Finance」
4. 閱讀並勾選同意條款
5. 點擊「Create」

### 3.3 取得 Channel Secret

1. 進入剛建立的 Channel
2. 點擊「Basic settings」分頁
3. 找到「Channel secret」
4. 點擊「Show」顯示 secret
5. **記錄下來**（稍後會用到）

### 3.4 發行 Channel Access Token

1. 點擊「Messaging API」分頁
2. 往下滾動到「Channel access token (long-lived)」區塊
3. 點擊「Issue」按鈕
4. **記錄顯示的 token**（稍後會用到）
5. ⚠️ 這個 token 只會顯示一次，請妥善保存

### 3.5 停用自動回應功能

1. 在「Messaging API」分頁往下滾動
2. 找到「LINE Official Account features」區塊
3. 點擊「Edit」進入 LINE Official Account Manager
4. 在左側選單選擇「回應設定」
5. 進行以下設定：
   - **加入好友的歡迎訊息**：關閉
   - **自動回應訊息**：關閉
   - **Webhook**：開啟
6. 儲存設定

### 3.6 加 Bot 為好友

1. 回到 LINE Developers Console 的「Messaging API」分頁
2. 找到「Bot information」區塊
3. 用 LINE 掃描 QR code
4. 加入好友

**注意**：此時 Webhook URL 尚未設定，部署到 Vercel 後再回來設定。

---

## 4. Vercel（部署後設定）

> 這個步驟在程式碼完成並推送到 GitHub 後進行

### 4.1 註冊 Vercel

1. 前往 [Vercel](https://vercel.com/)
2. 點擊「Sign Up」
3. 選擇「Continue with GitHub」
4. 授權 Vercel 存取 GitHub

### 4.2 匯入專案

1. 在 Vercel Dashboard 點擊「Add New」→「Project」
2. 選擇 GitHub repository：`shared-found`
3. 點擊「Import」

### 4.3 設定環境變數

在「Configure Project」頁面，展開「Environment Variables」區塊，新增以下變數：

#### Google Sheets 相關

| Name | Value | 說明 |
|------|-------|------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `family-finance-bot@xxx.iam.gserviceaccount.com` | 從步驟 1.5 取得 |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | `-----BEGIN PRIVATE KEY-----\nMII...` | 從步驟 1.5 取得（完整內容） |
| `GOOGLE_SHEET_ID` | `1a2b3c4d5e6f7g8h9i0j...` | 從步驟 2.5 取得 |

#### LINE Bot 相關

| Name | Value | 說明 |
|------|-------|------|
| `LINE_CHANNEL_SECRET` | `xxx` | 從步驟 3.3 取得 |
| `LINE_CHANNEL_ACCESS_TOKEN` | `xxx` | 從步驟 3.4 取得 |

#### 驗證相關

| Name | Value | 說明 |
|------|-------|------|
| `PIN_CODE` | `8888` | Dashboard PIN 碼（可自訂） |
| `JWT_SECRET` | `your-random-secret-key` | JWT 簽名金鑰（隨機字串，至少 32 字元） |

**產生 JWT_SECRET 的方法**：

```bash
# 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 或使用 OpenSSL
openssl rand -hex 32
```

### 4.4 部署

1. 確認環境變數都已設定
2. 點擊「Deploy」按鈕
3. 等待部署完成（約 2-3 分鐘）
4. 部署成功後，記錄 Vercel 網址：
   - 例如：`https://shared-found-abc123.vercel.app`

### 4.5 測試部署

1. 開啟瀏覽器，前往 `https://your-app.vercel.app/dashboard`
2. 輸入 PIN 碼測試登入
3. 確認可以正常顯示

### 4.6 設定 LINE Webhook URL

1. 回到 [LINE Developers Console](https://developers.line.biz/console/)
2. 進入 Channel 的「Messaging API」分頁
3. 找到「Webhook settings」區塊
4. 在「Webhook URL」欄位輸入：
   ```
   https://your-app.vercel.app/api/webhook
   ```
5. 點擊「Update」
6. 點擊「Verify」按鈕測試連線
7. 如果顯示「Success」表示設定成功

---

## 5. LINE Rich Menu 設定

### 5.1 設計 Rich Menu

**範例設計（2x3 grid）**：

```
┌─────────┬─────────┬─────────┐
│  早餐    │  午餐    │  晚餐    │
│  $50    │  $100   │  $150   │
├─────────┼─────────┼─────────┤
│  捷運    │  公車    │  計程車   │
│  $30    │  $20    │  $100   │
└─────────┴─────────┴─────────┘
```

### 5.2 製作 Rich Menu 圖片

1. 使用設計軟體（Figma、Canva、Photoshop 等）
2. 尺寸：**2500 x 1686 pixels**
3. 格式：PNG 或 JPEG
4. 設計 6 個按鈕區域（2 列 x 3 欄）
5. 儲存為 `richmenu.png`

### 5.3 使用 curl 建立 Rich Menu

#### 步驟 1：建立 Rich Menu 結構

```bash
curl -X POST https://api.line.me/v2/bot/richmenu \
-H "Authorization: Bearer {YOUR_CHANNEL_ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "size": {
    "width": 2500,
    "height": 1686
  },
  "selected": true,
  "name": "快速記帳選單",
  "chatBarText": "快速記帳",
  "areas": [
    {
      "bounds": { "x": 0, "y": 0, "width": 833, "height": 843 },
      "action": {
        "type": "postback",
        "data": "action=add&category=食物&subcategory=早餐&amount=50",
        "displayText": "✅ 記帳：早餐 $50"
      }
    },
    {
      "bounds": { "x": 834, "y": 0, "width": 833, "height": 843 },
      "action": {
        "type": "postback",
        "data": "action=add&category=食物&subcategory=午餐&amount=100",
        "displayText": "✅ 記帳：午餐 $100"
      }
    },
    {
      "bounds": { "x": 1667, "y": 0, "width": 833, "height": 843 },
      "action": {
        "type": "postback",
        "data": "action=add&category=食物&subcategory=晚餐&amount=150",
        "displayText": "✅ 記帳：晚餐 $150"
      }
    },
    {
      "bounds": { "x": 0, "y": 843, "width": 833, "height": 843 },
      "action": {
        "type": "postback",
        "data": "action=add&category=交通&subcategory=捷運&amount=30",
        "displayText": "✅ 記帳：捷運 $30"
      }
    },
    {
      "bounds": { "x": 834, "y": 843, "width": 833, "height": 843 },
      "action": {
        "type": "postback",
        "data": "action=add&category=交通&subcategory=公車&amount=20",
        "displayText": "✅ 記帳：公車 $20"
      }
    },
    {
      "bounds": { "x": 1667, "y": 843, "width": 833, "height": 843 },
      "action": {
        "type": "postback",
        "data": "action=add&category=交通&subcategory=計程車&amount=100",
        "displayText": "✅ 記帳：計程車 $100"
      }
    }
  ]
}'
```

**回應範例**：
```json
{
  "richMenuId": "richmenu-1234567890abcdef"
}
```

**記錄 `richMenuId`**，稍後會用到。

#### 步驟 2：上傳 Rich Menu 圖片

```bash
curl -X POST https://api-data.line.me/v2/bot/richmenu/{richMenuId}/content \
-H "Authorization: Bearer {YOUR_CHANNEL_ACCESS_TOKEN}" \
-H "Content-Type: image/png" \
--data-binary @richmenu.png
```

將 `{richMenuId}` 替換為步驟 1 取得的 ID。

#### 步驟 3：設定為預設 Rich Menu

```bash
curl -X POST https://api.line.me/v2/bot/user/all/richmenu/{richMenuId} \
-H "Authorization: Bearer {YOUR_CHANNEL_ACCESS_TOKEN}"
```

### 5.4 測試 Rich Menu

1. 打開 LINE，進入 Bot 聊天室
2. 點擊輸入框旁的選單按鈕
3. 應該會顯示 Rich Menu
4. 點擊任一按鈕測試記帳功能

---

## ✅ 設定完成檢查清單

- [ ] Google Cloud Platform
  - [ ] 建立專案 `family-finance`
  - [ ] 啟用 Google Sheets API
  - [ ] 建立 Service Account
  - [ ] 下載 JSON 金鑰檔案
  - [ ] 記錄 Service Account Email 和 Private Key
- [ ] Google Sheets
  - [ ] 建立「家庭記帳資料庫」試算表
  - [ ] 建立 Data Tab（含標題列）
  - [ ] 建立 Config Tab（含設定資料）
  - [ ] 分享給 Service Account（編輯者權限）
  - [ ] 記錄 Spreadsheet ID
- [ ] LINE Developers
  - [ ] 建立 Provider `Family Finance`
  - [ ] 建立 Messaging API Channel
  - [ ] 記錄 Channel Secret
  - [ ] 發行 Channel Access Token
  - [ ] 關閉自動回應功能
  - [ ] 加 Bot 為好友
- [ ] Vercel
  - [ ] 註冊帳號（連結 GitHub）
  - [ ] 匯入 GitHub repository
  - [ ] 設定所有環境變數
  - [ ] 部署成功
  - [ ] 測試 Dashboard 可開啟
  - [ ] 設定 LINE Webhook URL
  - [ ] 驗證 Webhook 連線成功
- [ ] LINE Rich Menu
  - [ ] 設計並製作 Rich Menu 圖片
  - [ ] 使用 API 建立 Rich Menu
  - [ ] 上傳圖片
  - [ ] 設定為預設選單
  - [ ] 測試按鈕功能

---

## 🔒 安全性注意事項

1. **JSON 金鑰檔案**：
   - ❌ 不要上傳到 GitHub
   - ❌ 不要分享給他人
   - ✅ 存放在安全的地方

2. **LINE Channel Secret 和 Access Token**：
   - ❌ 不要公開在程式碼中
   - ✅ 只存在 Vercel 環境變數

3. **Vercel 環境變數**：
   - ✅ Vercel 會加密儲存
   - ✅ 只有專案擁有者可以查看

4. **Google Sheets**：
   - ✅ 只分享給 Service Account
   - ✅ 不要設定為「任何人都可以查看」

---

## 🆘 疑難排解

### Google Sheets 錯誤：403 Forbidden

**原因**：Service Account 沒有試算表存取權限

**解決**：
1. 確認試算表已分享給 Service Account Email
2. 權限設定為「編輯者」
3. 檢查 Service Account Email 是否正確

### LINE Webhook 驗證失敗

**原因**：Webhook URL 不正確或無法連線

**解決**：
1. 確認 Vercel 部署成功
2. 確認 URL 格式：`https://your-app.vercel.app/api/webhook`
3. 檢查 Vercel Logs 是否有錯誤

### Vercel 部署失敗

**原因**：環境變數設定錯誤

**解決**：
1. 檢查所有環境變數都已設定
2. `GOOGLE_SERVICE_ACCOUNT_KEY` 的換行符號要用 `\n`
3. 查看 Vercel 部署 log 的詳細錯誤訊息

---

## 下一步

設定完成後，請參閱：
- [開發實作指南](./development-guide.md)
- [測試指南](./testing-guide.md)

# 部署指南

> 更新日期：2026-02-05

本文件說明如何將專案部署到 Vercel。

## 📋 部署前檢查

### 1. 確認本地測試通過

- [ ] Dashboard 可以正常登入
- [ ] Google Sheets 連線正常
- [ ] LINE Webhook 測試通過（使用 ngrok）

### 2. 確認環境變數已準備

準備以下環境變數的值：

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account Email | `xxx@xxx.iam.gserviceaccount.com` |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Service Account 私鑰 | `-----BEGIN PRIVATE KEY-----\n...` |
| `GOOGLE_SHEET_ID` | Google Sheets ID | `1a2b3c4d...` |
| `LINE_CHANNEL_SECRET` | LINE Channel Secret | `xxx` |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Channel Access Token | `xxx` |
| `PIN_CODE` | Dashboard PIN 碼 | `8888` |
| `JWT_SECRET` | JWT 簽名金鑰 | 32+ 字元隨機字串 |

---

## 🚀 部署到 Vercel

### 步驟 1：推送程式碼到 GitHub

```bash
# 確認在專案根目錄
cd /Users/D/Projects/shared-found/web

# 初始化 Git（如果還沒有）
git init

# 加入檔案
git add .

# 建立初始 commit
git commit -m "Initial commit: Next.js architecture"

# 連結到 GitHub repository
git remote add origin https://github.com/your-username/shared-found.git

# 推送到 GitHub
git push -u origin main
```

### 步驟 2：連結 Vercel

1. 前往 [Vercel](https://vercel.com/)
2. 登入（使用 GitHub 帳號）
3. 點擊「Add New」→「Project」
4. 選擇 GitHub repository：`shared-found`
5. 點擊「Import」

### 步驟 3：設定專案

在 Configure Project 頁面：

#### Framework Preset
- 自動偵測：**Next.js**

#### Root Directory
- 如果 Next.js 專案在 `web` 資料夾，設定為 `web`
- 如果在根目錄，保持預設

#### Build and Output Settings
- **Build Command**：`npm run build`（預設）
- **Output Directory**：`.next`（預設）
- **Install Command**：`npm install`（預設）

### 步驟 4：設定環境變數

展開「Environment Variables」區塊，逐一新增：

#### 1. GOOGLE_SERVICE_ACCOUNT_EMAIL
```
GOOGLE_SERVICE_ACCOUNT_EMAIL
```
值：`family-finance-bot@xxx.iam.gserviceaccount.com`

#### 2. GOOGLE_SERVICE_ACCOUNT_KEY
```
GOOGLE_SERVICE_ACCOUNT_KEY
```
值：`-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...`

**注意**：
- 必須包含完整的 key（包含 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）
- 換行符號要保留為 `\n`

#### 3. GOOGLE_SHEET_ID
```
GOOGLE_SHEET_ID
```
值：`1a2b3c4d5e6f7g8h9i0j...`

#### 4. LINE_CHANNEL_SECRET
```
LINE_CHANNEL_SECRET
```
值：從 LINE Developers Console 取得

#### 5. LINE_CHANNEL_ACCESS_TOKEN
```
LINE_CHANNEL_ACCESS_TOKEN
```
值：從 LINE Developers Console 取得

#### 6. PIN_CODE
```
PIN_CODE
```
值：`8888`（或自訂）

#### 7. JWT_SECRET
```
JWT_SECRET
```
值：隨機 32+ 字元字串

**產生方法**：
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

### 步驟 5：部署

1. 確認所有環境變數都已設定
2. 點擊「Deploy」按鈕
3. 等待部署完成（約 2-3 分鐘）

### 步驟 6：取得部署網址

部署成功後，Vercel 會顯示網址：
```
https://shared-found-abc123.vercel.app
```

或使用自訂網域（如果有設定）。

---

## 🔗 設定 LINE Webhook URL

### 步驟 1：更新 Webhook URL

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇你的 Channel
3. 進入「Messaging API」分頁
4. 找到「Webhook settings」
5. 在「Webhook URL」輸入：
   ```
   https://your-app.vercel.app/api/webhook
   ```
6. 點擊「Update」

### 步驟 2：驗證 Webhook

1. 點擊「Verify」按鈕
2. 應顯示「Success」
3. 如果失敗，檢查：
   - Vercel 部署是否成功
   - URL 是否正確
   - 環境變數是否設定正確

### 步驟 3：啟用 Webhook

1. 確認「Use webhook」是**開啟**狀態

---

## ✅ 部署後測試

### 1. 測試 Dashboard

1. 開啟 `https://your-app.vercel.app/dashboard`
2. 輸入 PIN 碼（預設 `8888`）
3. 確認可以登入並看到記帳列表

### 2. 測試 LINE Bot

1. 打開 LINE，進入 Bot 聊天室
2. 點擊 Rich Menu 按鈕（如果已設定）
3. 確認可以記帳並收到回覆
4. 檢查 Google Sheets 是否有新增記錄

### 3. 檢查 Vercel Logs

1. 在 Vercel Dashboard 進入專案
2. 點擊「Logs」分頁
3. 查看是否有錯誤訊息

---

## 🔄 更新部署

### 自動部署（推薦）

Vercel 預設會自動部署：
- 推送到 `main` 分支 → 自動部署到 Production
- 推送到其他分支 → 自動部署到 Preview

```bash
# 修改程式碼後
git add .
git commit -m "Update feature"
git push

# Vercel 會自動偵測並部署
```

### 手動部署

1. 在 Vercel Dashboard 進入專案
2. 點擊「Deployments」分頁
3. 點擊「Redeploy」按鈕

---

## 🌍 自訂網域（選用）

### 步驟 1：新增網域

1. 在 Vercel 專案設定中，點擊「Domains」
2. 輸入你的網域（例如 `finance.example.com`）
3. 點擊「Add」

### 步驟 2：設定 DNS

Vercel 會提供 DNS 設定指示，通常是：

**A Record**:
```
Type: A
Name: finance (或 @)
Value: 76.76.21.21
```

或 **CNAME Record**:
```
Type: CNAME
Name: finance
Value: cname.vercel-dns.com
```

### 步驟 3：等待 DNS 生效

- DNS 更新通常需要 5 分鐘到 48 小時
- Vercel 會自動配置 SSL 憑證

### 步驟 4：更新 LINE Webhook URL

1. 回到 LINE Developers Console
2. 更新 Webhook URL 為新網域：
   ```
   https://finance.example.com/api/webhook
   ```

---

## 🔒 環境變數管理

### 查看環境變數

1. Vercel Dashboard → 專案 → Settings → Environment Variables

### 更新環境變數

1. 點擊變數旁的「...」→「Edit」
2. 修改值
3. 點擊「Save」
4. **重要**：需要重新部署才會生效

### 新增環境變數

1. 點擊「Add New」
2. 輸入 Name 和 Value
3. 選擇環境：Production、Preview、Development
4. 點擊「Save」

---

## 📊 監控與除錯

### Vercel Analytics（選用）

1. 在專案設定中啟用 Analytics
2. 可以查看：
   - 頁面訪問量
   - 回應時間
   - 錯誤率

### Real-time Logs

1. Vercel Dashboard → 專案 → Logs
2. 可以即時查看：
   - API 請求
   - 錯誤訊息
   - Console 輸出

### 除錯技巧

#### 查看特定 Function 的 Logs

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 查看 logs
vercel logs
```

#### 檢查環境變數是否正確

在 API Route 中暫時輸出（**部署後記得移除**）：

```typescript
console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID);
console.log('LINE_CHANNEL_SECRET:', process.env.LINE_CHANNEL_SECRET ? 'SET' : 'NOT SET');
```

---

## ⚠️ 常見問題

### 1. 部署失敗：Build Error

**原因**：程式碼有錯誤或依賴套件問題

**解決**：
```bash
# 本地測試 build
npm run build

# 修正錯誤後重新推送
git add .
git commit -m "Fix build error"
git push
```

### 2. LINE Webhook 驗證失敗

**原因**：
- Webhook URL 錯誤
- API Route 沒有正確實作
- 環境變數設定錯誤

**解決**：
1. 確認 URL：`https://your-app.vercel.app/api/webhook`
2. 檢查 Vercel Logs 是否有錯誤
3. 檢查 `LINE_CHANNEL_SECRET` 是否設定正確

### 3. Google Sheets 403 Forbidden

**原因**：Service Account 沒有試算表權限

**解決**：
1. 確認試算表已分享給 Service Account Email
2. 權限設定為「編輯者」
3. 檢查 `GOOGLE_SERVICE_ACCOUNT_EMAIL` 和 `GOOGLE_SERVICE_ACCOUNT_KEY` 是否正確

### 4. Dashboard 無法登入

**原因**：PIN 碼錯誤或 JWT_SECRET 未設定

**解決**：
1. 確認 Vercel 環境變數 `PIN_CODE` 已設定
2. 確認 `JWT_SECRET` 已設定
3. 檢查瀏覽器 Console 錯誤訊息

### 5. CORS 錯誤

**原因**：跨域請求被阻擋

**解決**：
- 如果 Dashboard 和 API 在同一網域，應該不會有 CORS 問題
- 如果有其他前端需要呼叫 API，在 API Route 加入 CORS headers：

```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: '...' });
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

---

## 🎯 效能優化（Phase 2）

### 1. 啟用 Edge Runtime

在 API Routes 中加入：

```typescript
export const runtime = 'edge';
```

### 2. 快取 Google Sheets 資料

使用 Vercel KV 或 Redis 快取：

```typescript
import { kv } from '@vercel/kv';

async function getCachedExpenses(month: number, year: number) {
  const cacheKey = `expenses:${year}:${month}`;
  const cached = await kv.get(cacheKey);

  if (cached) return cached;

  const expenses = await sheets.getExpenses(month, year);
  await kv.set(cacheKey, expenses, { ex: 300 }); // 5 分鐘過期

  return expenses;
}
```

### 3. 設定 Region

在 `vercel.json` 中指定最近的 Region：

```json
{
  "regions": ["hnd1"]
}
```

- `hnd1`：東京（推薦給台灣使用者）
- `sin1`：新加坡
- `hkg1`：香港

---

## 📝 部署檢查清單

- [ ] 本地測試通過
  - [ ] Dashboard 登入測試
  - [ ] Google Sheets 連線測試
  - [ ] LINE Webhook 測試（ngrok）
- [ ] 推送程式碼到 GitHub
- [ ] Vercel 設定
  - [ ] 匯入專案
  - [ ] 設定 Root Directory（如需要）
  - [ ] 設定所有環境變數
- [ ] 部署
  - [ ] 首次部署成功
  - [ ] 記錄部署網址
- [ ] LINE Webhook 設定
  - [ ] 更新 Webhook URL
  - [ ] 驗證連線成功
  - [ ] 啟用 Webhook
- [ ] 部署後測試
  - [ ] Dashboard 可以登入
  - [ ] LINE Bot 可以記帳
  - [ ] Google Sheets 有新增記錄
  - [ ] 檢查 Vercel Logs 無錯誤

---

## 下一步

部署完成後，請參閱：
- [測試指南](./testing-guide.md)
- [第三方平台設定指南](./third-party-setup-guide.md)（設定 Rich Menu）

# 測試指南

> 更新日期：2026-02-05

本文件說明如何測試系統的各項功能。

## 📋 測試概覽

### 測試環境

| 環境 | 說明 | 網址 |
|------|------|------|
| **本地開發** | 使用 ngrok 測試 LINE Bot | `http://localhost:3000` |
| **Vercel Preview** | 測試分支部署 | `https://shared-found-xxx.vercel.app` |
| **Production** | 正式環境 | `https://your-app.vercel.app` |

### 測試範圍

- ✅ Google Sheets 整合
- ✅ LINE Bot Webhook
- ✅ Dashboard UI
- ✅ API Routes
- ✅ 驗證機制

---

## 🧪 本地測試

### 1. Google Sheets 連線測試

建立測試腳本 `scripts/test-sheets.js`：

```javascript
// scripts/test-sheets.js
require('dotenv').config({ path: '.env.local' });
const { GoogleSheetsService } = require('../lib/google-sheets');

async function test() {
  console.log('🔍 測試 Google Sheets 連線...\n');

  const service = new GoogleSheetsService();

  try {
    // 測試 1：讀取設定
    console.log('1️⃣ 測試讀取 Config...');
    const config = await service.getConfig();
    console.log('✅ Config:', Object.keys(config).length, '項設定');

    // 測試 2：新增記帳
    console.log('\n2️⃣ 測試新增記帳...');
    await service.addExpense({
      date: new Date().toISOString().split('T')[0],
      amount: 100,
      category: '測試',
      subcategory: '測試項目',
      label: '測試',
      method: '現金',
      currency: 'TWD',
      note: '自動測試',
    });
    console.log('✅ 新增成功');

    // 測試 3：查詢記帳
    console.log('\n3️⃣ 測試查詢記帳...');
    const expenses = await service.getExpenses();
    console.log('✅ 查詢成功:', expenses.length, '筆記錄');

    console.log('\n✅ 所有測試通過！');
  } catch (error) {
    console.error('\n❌ 測試失敗:', error.message);
    process.exit(1);
  }
}

test();
```

執行測試：
```bash
node scripts/test-sheets.js
```

**預期輸出**：
```
🔍 測試 Google Sheets 連線...

1️⃣ 測試讀取 Config...
✅ Config: 8 項設定

2️⃣ 測試新增記帳...
✅ 新增成功

3️⃣ 測試查詢記帳...
✅ 查詢成功: 10 筆記錄

✅ 所有測試通過！
```

---

### 2. Dashboard 本地測試

#### 啟動開發伺服器

```bash
npm run dev
```

#### 測試項目

| 測試項目 | 步驟 | 預期結果 |
|---------|------|----------|
| **PIN 登入** | 1. 開啟 `http://localhost:3000/dashboard`<br>2. 輸入 PIN 碼 `8888` | 成功登入，顯示 Dashboard |
| **查詢記帳** | 1. 登入後查看記帳列表 | 顯示 Google Sheets 的記帳記錄 |
| **月份切換** | 1. 切換不同月份 | 正確顯示該月份的記錄 |
| **統計摘要** | 1. 查看統計摘要 | 顯示總支出和分類統計 |
| **刪除記帳** | 1. 點擊「刪除」按鈕<br>2. 確認刪除 | 記錄被刪除，列表更新 |
| **登出** | 1. 點擊「登出」按鈕 | 返回登入頁面 |

---

### 3. LINE Webhook 本地測試

#### 使用 ngrok

```bash
# 安裝 ngrok
npm install -g ngrok

# 啟動 Next.js
npm run dev

# 另一個終端啟動 ngrok
ngrok http 3000
```

ngrok 會顯示：
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

#### 設定 LINE Webhook URL

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 進入 Channel → Messaging API
3. 設定 Webhook URL：`https://abc123.ngrok.io/api/webhook`
4. 點擊「Verify」測試連線

#### 測試 LINE Bot

| 測試項目 | 步驟 | 預期結果 |
|---------|------|----------|
| **Rich Menu（Postback）** | 1. 打開 LINE Bot 聊天室<br>2. 點擊 Rich Menu 按鈕 | 收到「✅ 已記帳」訊息<br>Google Sheets 新增記錄 |
| **自然語言（Phase 1）** | 1. 傳送「午餐 200」 | 收到「🚧 請使用下方選單記帳」 |

#### 檢查 Logs

在終端查看 Next.js 輸出：
```
POST /api/webhook 200 in 1234ms
```

---

## 🚀 部署後測試

### 1. Vercel 部署測試

#### 檢查部署狀態

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 進入專案
3. 查看最新部署狀態是否為「Ready」

#### 測試環境變數

建立測試 API Route `app/api/test-env/route.ts`：

```typescript
// app/api/test-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasGoogleSheetId: !!process.env.GOOGLE_SHEET_ID,
    hasLineSecret: !!process.env.LINE_CHANNEL_SECRET,
    hasLineToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
    hasPinCode: !!process.env.PIN_CODE,
    hasJwtSecret: !!process.env.JWT_SECRET,
  });
}
```

訪問 `https://your-app.vercel.app/api/test-env`，應該看到：
```json
{
  "hasGoogleSheetId": true,
  "hasLineSecret": true,
  "hasLineToken": true,
  "hasPinCode": true,
  "hasJwtSecret": true
}
```

**部署後記得刪除這個測試 API**。

---

### 2. Dashboard 功能測試

#### 基本功能測試

| 測試項目 | 步驟 | 預期結果 |
|---------|------|----------|
| **訪問首頁** | 開啟 `https://your-app.vercel.app` | 自動導向 `/dashboard` |
| **PIN 登入** | 1. 輸入正確 PIN 碼 | 成功登入 |
| **PIN 錯誤** | 1. 輸入錯誤 PIN 碼 | 顯示「PIN 碼錯誤」 |
| **Token 持久化** | 1. 登入後重新整理頁面 | 保持登入狀態 |
| **查詢記帳** | 1. 查看當月記帳列表 | 正確顯示 Google Sheets 資料 |
| **刪除記帳** | 1. 刪除一筆記帳<br>2. 檢查 Google Sheets | Sheet 中的記錄被刪除 |

#### 跨裝置測試

| 裝置 | 瀏覽器 | 測試項目 |
|------|--------|----------|
| 桌面 | Chrome | 所有功能 |
| 桌面 | Safari | 所有功能 |
| 手機 | Safari (iOS) | RWD、登入、查詢 |
| 手機 | Chrome (Android) | RWD、登入、查詢 |

---

### 3. LINE Bot 整合測試

#### LINE Webhook 驗證

1. 前往 LINE Developers Console
2. Messaging API → Webhook settings
3. 點擊「Verify」按鈕
4. 應顯示「Success」

#### 功能測試

| 測試項目 | 操作 | 預期結果 | 驗證方式 |
|---------|------|----------|----------|
| **Rich Menu 記帳** | 點擊「午餐」按鈕 | 收到「✅ 已記帳：午餐 $100」 | 1. 檢查 LINE 回覆<br>2. 檢查 Google Sheets<br>3. 檢查 Dashboard |
| **多次記帳** | 連續點擊 3 次按鈕 | 每次都成功記帳 | Google Sheets 應有 3 筆新記錄 |
| **自然語言（Phase 1）** | 傳送「午餐 200」 | 收到「🚧 請使用下方選單記帳」 | LINE 回覆訊息 |

#### 檢查 Vercel Logs

1. Vercel Dashboard → 專案 → Logs
2. 在 LINE 傳送訊息後查看 Logs
3. 應該看到：
   ```
   POST /api/webhook 200 OK
   ```

---

## 🔍 API 端點測試

### 使用 curl 測試

#### 1. 測試 PIN 驗證

```bash
curl -X POST https://your-app.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"pin":"8888"}'
```

**預期回應**：
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. 測試查詢記帳（需要 token）

```bash
# 先取得 token（從上一步）
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 查詢本月記帳
curl https://your-app.vercel.app/api/expenses?month=2&year=2026 \
  -H "Authorization: Bearer $TOKEN"
```

**預期回應**：
```json
{
  "expenses": [...],
  "summary": {
    "total": 5230,
    "byCategory": {...}
  }
}
```

#### 3. 測試新增記帳

```bash
curl -X POST https://your-app.vercel.app/api/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-05",
    "amount": 150,
    "category": "食物",
    "subcategory": "晚餐",
    "label": "必要",
    "method": "現金",
    "currency": "TWD",
    "note": "API 測試"
  }'
```

**預期回應**：
```json
{
  "success": true
}
```

#### 4. 測試刪除記帳

```bash
# 假設要刪除第 5 列
curl -X DELETE https://your-app.vercel.app/api/expenses/5 \
  -H "Authorization: Bearer $TOKEN"
```

**預期回應**：
```json
{
  "success": true
}
```

---

### 使用 Postman 測試

#### 建立 Collection

1. 開啟 Postman
2. 建立新 Collection：`Family Finance API`
3. 建立 Environment：`Production`
   - `base_url`: `https://your-app.vercel.app`
   - `token`: `{{token}}`（會自動填入）

#### 測試流程

1. **POST /api/auth**
   - Body: `{"pin":"8888"}`
   - 在 Tests 中加入：
     ```javascript
     pm.environment.set("token", pm.response.json().token);
     ```

2. **GET /api/expenses**
   - Authorization: Bearer Token `{{token}}`
   - Query Params: `month=2&year=2026`

3. **POST /api/expenses**
   - Authorization: Bearer Token `{{token}}`
   - Body: 記帳 JSON

4. **DELETE /api/expenses/:id**
   - Authorization: Bearer Token `{{token}}`

---

## 📊 效能測試

### 1. 回應時間測試

使用 curl 測量：
```bash
curl -w "@curl-format.txt" -o /dev/null -s \
  https://your-app.vercel.app/api/expenses?month=2 \
  -H "Authorization: Bearer $TOKEN"
```

`curl-format.txt` 內容：
```
time_namelookup:  %{time_namelookup}s\n
time_connect:     %{time_connect}s\n
time_appconnect:  %{time_appconnect}s\n
time_starttransfer: %{time_starttransfer}s\n
time_total:       %{time_total}s\n
```

**預期結果**：
- `time_total` < 2s（正常）
- `time_total` > 5s（需優化）

### 2. 壓力測試（選用）

使用 Apache Bench：
```bash
# 安裝 ab
brew install apache-bench  # macOS

# 測試 100 個請求，同時 10 個
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  https://your-app.vercel.app/api/expenses?month=2
```

---

## ✅ 完整測試檢查清單

### 本地測試
- [ ] Google Sheets 連線測試通過
- [ ] Dashboard PIN 登入成功
- [ ] Dashboard 查詢記帳正常
- [ ] Dashboard 刪除記帳正常
- [ ] LINE Webhook 測試通過（ngrok）
- [ ] Rich Menu Postback 測試通過

### 部署測試
- [ ] Vercel 部署成功
- [ ] 環境變數設定正確
- [ ] Dashboard 可以訪問
- [ ] Dashboard 所有功能正常
- [ ] LINE Webhook 驗證成功
- [ ] LINE Bot 記帳功能正常
- [ ] Google Sheets 正確寫入資料

### API 測試
- [ ] POST /api/auth 正常
- [ ] GET /api/expenses 正常
- [ ] POST /api/expenses 正常
- [ ] DELETE /api/expenses/:id 正常
- [ ] JWT token 驗證正常
- [ ] 錯誤處理正常（401、404 等）

### 跨裝置測試
- [ ] 桌面 Chrome 測試通過
- [ ] 桌面 Safari 測試通過
- [ ] 手機 Safari (iOS) 測試通過
- [ ] 手機 Chrome (Android) 測試通過

### 整合測試
- [ ] LINE Bot → Google Sheets 資料一致
- [ ] Dashboard → Google Sheets 資料一致
- [ ] LINE Bot 記帳後，Dashboard 立即顯示

---

## 🐛 常見問題除錯

### Dashboard 無法登入

**檢查項目**：
1. Vercel 環境變數 `PIN_CODE` 是否設定
2. Vercel 環境變數 `JWT_SECRET` 是否設定
3. 瀏覽器 Console 是否有錯誤
4. Network tab 查看 `/api/auth` 回應

### LINE Bot 沒有回應

**檢查項目**：
1. LINE Webhook URL 是否正確
2. LINE Webhook Verify 是否成功
3. Vercel Logs 是否有錯誤
4. `LINE_CHANNEL_SECRET` 和 `LINE_CHANNEL_ACCESS_TOKEN` 是否正確

### Google Sheets 寫入失敗

**檢查項目**：
1. Service Account 是否有試算表權限
2. `GOOGLE_SHEET_ID` 是否正確
3. `GOOGLE_SERVICE_ACCOUNT_KEY` 是否正確
4. Vercel Logs 查看詳細錯誤訊息

### API 回傳 401 Unauthorized

**檢查項目**：
1. Token 是否有帶在 Header
2. Token 格式：`Authorization: Bearer <token>`
3. Token 是否過期（預設 7 天）
4. `JWT_SECRET` 是否一致

---

## 📝 測試報告範本

```markdown
## 測試報告

**測試日期**：2026-02-05
**測試環境**：Production (https://your-app.vercel.app)
**測試人員**：Your Name

### 測試結果總覽

| 類別 | 通過 | 失敗 | 狀態 |
|------|------|------|------|
| Google Sheets | 3/3 | 0 | ✅ |
| Dashboard | 6/6 | 0 | ✅ |
| LINE Bot | 2/2 | 0 | ✅ |
| API | 4/4 | 0 | ✅ |

### 詳細測試結果

#### 1. Google Sheets 測試
- ✅ 連線成功
- ✅ 讀取資料正常
- ✅ 寫入資料正常

#### 2. Dashboard 測試
- ✅ PIN 登入成功
- ✅ 查詢記帳正常
- ✅ 刪除記帳正常
- ✅ 統計摘要正確
- ✅ 月份切換正常
- ✅ 登出功能正常

#### 3. LINE Bot 測試
- ✅ Rich Menu 記帳成功
- ✅ 回覆訊息正確

#### 4. API 測試
- ✅ /api/auth 正常
- ✅ /api/expenses GET 正常
- ✅ /api/expenses POST 正常
- ✅ /api/expenses/:id DELETE 正常

### 發現的問題

無

### 建議改進

1. 加入載入動畫（Dashboard）
2. 優化手機版 UI
3. 加入錯誤提示訊息

### 結論

所有核心功能測試通過，系統可以正式上線。
```

---

## 下一步

測試完成後：
- ✅ 系統正式上線
- 📝 撰寫使用者文件
- 🚀 開始 Phase 2 開發（OpenClaw 整合）

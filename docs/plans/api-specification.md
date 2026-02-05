# API 規格文件

> 版本：1.0.0
> 更新日期：2026-02-05

## 概覽

所有 API 端點部署在 Vercel：`https://your-app.vercel.app`

---

## 認證方式

### LINE Webhook
- **驗證方式**：LINE signature (`X-Line-Signature` header)
- **演算法**：HMAC-SHA256
- **密鑰**：LINE Channel Secret

### Dashboard API
- **驗證方式**：JWT Bearer Token
- **Header**：`Authorization: Bearer <token>`
- **Token 有效期**：7 天

---

## API 端點

### 1. LINE Webhook

```
POST /api/webhook
```

#### 功能
接收 LINE Bot 的 Webhook events

#### 認證
LINE signature (`X-Line-Signature` header)

#### 請求格式

```json
{
  "destination": "U1234567890abcdef",
  "events": [
    {
      "type": "postback",
      "timestamp": 1234567890123,
      "source": {
        "type": "user",
        "userId": "U1234567890abcdef"
      },
      "replyToken": "xxx",
      "postback": {
        "data": "action=add&category=食物&subcategory=午餐&amount=100"
      }
    }
  ]
}
```

#### 處理邏輯

**Postback Event（Rich Menu）**：
```typescript
if (event.type === 'postback') {
  const params = new URLSearchParams(event.postback.data);

  if (params.get('action') === 'add') {
    // 解析參數
    const expense = {
      date: new Date().toISOString(),
      amount: parseInt(params.get('amount')),
      category: params.get('category'),
      subcategory: params.get('subcategory'),
      method: params.get('method') || '現金',
      label: params.get('label') || '必要',
      currency: 'TWD',
    };

    // 寫入 Google Sheets
    await sheets.addExpense(expense);

    // 回覆使用者
    await replyMessage(event.replyToken, `✅ 已記帳：${expense.subcategory} $${expense.amount}`);
  }
}
```

**Message Event（自然語言，Phase 2）**：
```typescript
if (event.type === 'message' && event.message.type === 'text') {
  try {
    // Phase 2: 呼叫 OpenClaw
    const parsed = await openclaw.parseExpense(event.message.text);
    await sheets.addExpense(parsed);
    await replyMessage(event.replyToken, `✅ 已記帳：${parsed.subcategory} $${parsed.amount}`);
  } catch (error) {
    // Phase 1: 回覆使用 Rich Menu
    await replyMessage(event.replyToken, '🚧 請使用下方選單記帳');
  }
}
```

#### 回應格式

```json
{
  "success": true
}
```

#### 錯誤回應

```json
{
  "error": "Invalid signature"
}
```
Status: `401 Unauthorized`

---

### 2. PIN 碼驗證

```
POST /api/auth
```

#### 功能
驗證 PIN 碼，回傳 JWT token

#### 認證
無需認證

#### 請求格式

```json
{
  "pin": "8888"
}
```

#### 回應格式（成功）

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 回應格式（失敗）

```json
{
  "success": false,
  "error": "Invalid PIN"
}
```
Status: `401 Unauthorized`

#### Token Payload

```json
{
  "authenticated": true,
  "iat": 1234567890,
  "exp": 1235172690
}
```

---

### 3. 查詢記帳記錄

```
GET /api/expenses?month=2&year=2026
```

#### 功能
查詢指定月份的記帳記錄

#### 認證
JWT Bearer Token

#### Query Parameters

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `month` | number | 否 | 月份 (1-12)，預設當月 |
| `year` | number | 否 | 年份，預設當年 |

#### 回應格式

```json
{
  "expenses": [
    {
      "id": "2",
      "date": "2026-02-03",
      "amount": 200,
      "category": "食物",
      "subcategory": "午餐",
      "label": "必要",
      "method": "信用卡",
      "currency": "TWD",
      "note": "便利商店"
    },
    {
      "id": "3",
      "date": "2026-02-04",
      "amount": 30,
      "category": "交通",
      "subcategory": "捷運",
      "label": "必要",
      "method": "悠遊卡",
      "currency": "TWD",
      "note": ""
    }
  ],
  "summary": {
    "total": 5230,
    "byCategory": {
      "食物": 2000,
      "交通": 1030,
      "娛樂": 2200
    }
  }
}
```

#### 錯誤回應

```json
{
  "error": "Unauthorized"
}
```
Status: `401 Unauthorized`

---

### 4. 新增記帳記錄

```
POST /api/expenses
```

#### 功能
新增一筆記帳記錄（Dashboard 手動新增）

#### 認證
JWT Bearer Token

#### 請求格式

```json
{
  "date": "2026-02-05",
  "amount": 150,
  "category": "食物",
  "subcategory": "晚餐",
  "label": "必要",
  "method": "現金",
  "currency": "TWD",
  "note": "超商便當"
}
```

#### 欄位說明

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `date` | string | 是 | 日期 (YYYY-MM-DD) |
| `amount` | number | 是 | 金額 |
| `category` | string | 是 | 大分類 |
| `subcategory` | string | 是 | 小分類 |
| `label` | string | 是 | 標籤（必要/想要/共同） |
| `method` | string | 是 | 付款方式 |
| `currency` | string | 是 | 幣別（TWD） |
| `note` | string | 否 | 備註 |

#### 回應格式

```json
{
  "success": true,
  "id": "10"
}
```

#### 錯誤回應

```json
{
  "error": "Missing required fields"
}
```
Status: `400 Bad Request`

---

### 5. 編輯記帳記錄

```
PUT /api/expenses/[id]
```

#### 功能
編輯指定記帳記錄

#### 認證
JWT Bearer Token

#### URL Parameters

| 參數 | 類型 | 說明 |
|------|------|------|
| `id` | string | Google Sheets 的列號（例如 "5"） |

#### 請求格式

與新增記帳記錄相同

```json
{
  "date": "2026-02-05",
  "amount": 180,
  "category": "食物",
  "subcategory": "晚餐",
  "label": "想要",
  "method": "信用卡",
  "currency": "TWD",
  "note": "義大利餐廳"
}
```

#### 回應格式

```json
{
  "success": true
}
```

#### 錯誤回應

```json
{
  "error": "Expense not found"
}
```
Status: `404 Not Found`

---

### 6. 刪除記帳記錄

```
DELETE /api/expenses/[id]
```

#### 功能
刪除指定記帳記錄

#### 認證
JWT Bearer Token

#### URL Parameters

| 參數 | 類型 | 說明 |
|------|------|------|
| `id` | string | Google Sheets 的列號 |

#### 回應格式

```json
{
  "success": true
}
```

#### 錯誤回應

```json
{
  "error": "Expense not found"
}
```
Status: `404 Not Found`

---

## 錯誤代碼

| HTTP Status | 說明 | 處理方式 |
|-------------|------|----------|
| `400` | 請求格式錯誤 | 檢查請求參數 |
| `401` | 未授權 | 重新登入取得 token |
| `404` | 資源不存在 | 確認 ID 是否正確 |
| `500` | 伺服器錯誤 | 檢查 Vercel logs |

---

## Rate Limiting（Phase 2）

Phase 1 暫不實作，Phase 2 可考慮加入：
- LINE Webhook：無限制（LINE 自己有限制）
- Dashboard API：每 IP 每分鐘 60 次請求

---

## CORS 設定

- Dashboard UI 與 API 在同一網域，無 CORS 問題
- 如需外部呼叫，可在 API Routes 加入 CORS headers

---

## 測試範例

### 使用 curl 測試

```bash
# 1. PIN 驗證
curl -X POST https://your-app.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"pin":"8888"}'

# 回應：{"success":true,"token":"xxx"}

# 2. 查詢記帳記錄
curl https://your-app.vercel.app/api/expenses?month=2&year=2026 \
  -H "Authorization: Bearer xxx"

# 3. 新增記帳記錄
curl -X POST https://your-app.vercel.app/api/expenses \
  -H "Authorization: Bearer xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-05",
    "amount": 100,
    "category": "食物",
    "subcategory": "午餐",
    "label": "必要",
    "method": "現金",
    "currency": "TWD"
  }'

# 4. 編輯記帳記錄
curl -X PUT https://your-app.vercel.app/api/expenses/5 \
  -H "Authorization: Bearer xxx" \
  -H "Content-Type: application/json" \
  -d '{"amount":150,...}'

# 5. 刪除記帳記錄
curl -X DELETE https://your-app.vercel.app/api/expenses/5 \
  -H "Authorization: Bearer xxx"
```

### 使用 Postman 測試

1. 建立 Environment：`family-finance-dev`
2. 設定變數：
   - `base_url`: `https://your-app.vercel.app`
   - `token`: （PIN 驗證後取得）
3. 建立 Collection，依照上述端點建立請求
4. 在 Collection 設定 Authorization: Bearer Token `{{token}}`

---

## 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| 1.0.0 | 2026-02-05 | 初版 API 規格 |

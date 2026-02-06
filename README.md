# Expense Tracker  - Web 應用程式

這是一個基於 Next.js 的Expense Tracker ，整合了 Google Sheets、LINE Bot 和 OCR 發票辨識功能。

## 功能特色

- ✅ PIN 碼登入保護
- ✅ Google Sheets 雲端儲存
- ✅ LINE Bot 即時記帳
- ✅ 月度統計與分析
- ✅ 類別分類與圖表
- ✅ OCR 發票辨識（選用）
- ✅ 響應式設計

## 技術架構

- **前端框架**: Next.js 15 (App Router)
- **樣式**: Tailwind CSS
- **語言**: TypeScript
- **雲端儲存**: Google Sheets API
- **訊息平台**: LINE Bot SDK
- **身份驗證**: JWT + bcrypt
- **OCR 服務**: OpenClaw API（選用）

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數設定

複製 `.env.local` 並填入實際的設定值：

```bash
# Google Sheets API
GOOGLE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID=your-spreadsheet-id

# LINE Bot
LINE_CHANNEL_ACCESS_TOKEN=your-channel-access-token
LINE_CHANNEL_SECRET=your-channel-secret

# JWT
JWT_SECRET=your-super-secret-jwt-key

# PIN Code (使用 bcrypt hash)
PIN_CODE_HASH=your-hashed-pin-code

# OpenClaw API (Optional)
OPENCLAW_API_KEY=your-openclaw-api-key
```

### 3. 產生 PIN Code Hash

```bash
node scripts/generate-pin-hash.js 1234
```

將產生的 hash 填入 `.env.local` 的 `PIN_CODE_HASH`。

### 4. 設定 Google Sheets

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google Sheets API
4. 建立服務帳號並下載金鑰（JSON 格式）
5. 在 Google Sheets 中建立新試算表，命名工作表為 "Expenses"
6. 將服務帳號的 email 加入試算表的共用權限（編輯者）
7. 複製試算表 ID（URL 中的一串字元）

### 5. 設定 LINE Bot

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 建立 Provider 和 Messaging API Channel
3. 取得 Channel Access Token 和 Channel Secret
4. 設定 Webhook URL: `https://your-domain.com/api/webhook`
5. 啟用 Webhook

### 6. 初始化 Google Sheets

第一次使用前，需要初始化 Google Sheets 的標題列。可以透過以下方式：

在程式碼中呼叫：
```typescript
import { googleSheetsService } from '@/lib/services/googleSheets';
await googleSheetsService.initialize();
```

或手動在 Google Sheets 的 "Expenses" 工作表第一列加入：
```
ID | 日期 | 類別 | 金額 | 描述 | 付款人 | 付款方式 | 時間戳記
```

### 7. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 8. 建置正式環境

```bash
npm run build
npm start
```

## 使用說明

### Web 介面

1. 開啟網頁並輸入 PIN 碼登入
2. 在儀表板可以：
   - 查看本月統計
   - 新增支出記錄
   - 查看支出列表
   - 刪除支出記錄

### LINE Bot

1. 將 LINE Bot 加入好友
2. 傳送訊息進行操作：

**新增支出**（格式：日期|類別|金額|描述|付款人|付款方式）
```
2024/01/15|食物|250|午餐|老公|現金
```

**查詢指令**
- `統計` - 查看本月統計
- `列表` - 查看最近記錄
- `幫助` - 顯示使用說明

**OCR 辨識**
- 直接傳送發票照片，系統會自動辨識並提示確認

## API 端點

### 身份驗證
- `POST /api/auth/login` - 登入
- `POST /api/auth/logout` - 登出
- `GET /api/auth/verify` - 驗證狀態

### 支出記錄
- `GET /api/expenses` - 取得支出列表
- `POST /api/expenses` - 新增支出
- `DELETE /api/expenses/:id` - 刪除支出
- `GET /api/expenses/summary` - 取得月度統計

### LINE Webhook
- `POST /api/webhook` - LINE Bot Webhook

## 專案結構

```
web/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/         # 身份驗證 API
│   │   ├── expenses/     # 支出記錄 API
│   │   └── webhook/      # LINE Webhook
│   ├── dashboard/        # 儀表板頁面
│   └── page.tsx          # 登入頁面
├── components/            # React 元件
│   ├── PinLogin.tsx      # PIN 登入元件
│   ├── Dashboard.tsx     # 儀表板元件
│   ├── ExpenseList.tsx   # 支出列表元件
│   ├── MonthlySummaryCard.tsx  # 月度統計卡片
│   └── AddExpenseForm.tsx      # 新增支出表單
├── lib/                   # 核心邏輯
│   ├── services/         # 服務層
│   │   ├── googleSheets.ts    # Google Sheets 服務
│   │   ├── line.ts            # LINE 服務
│   │   └── openclaw.ts        # OpenClaw OCR 服務
│   └── utils/            # 工具函數
│       ├── jwt.ts        # JWT 工具
│       └── pin.ts        # PIN 驗證工具
├── types/                # TypeScript 類型定義
│   └── index.ts
├── scripts/              # 輔助腳本
│   └── generate-pin-hash.js   # 產生 PIN Hash
└── .env.local           # 環境變數（不要上傳到 Git）
```

## 安全性注意事項

1. **環境變數**: 確保 `.env.local` 不要上傳到版控系統
2. **PIN 碼**: 使用強度足夠的 PIN 碼（建議 6 位數字）
3. **JWT Secret**: 使用長且隨機的字串
4. **HTTPS**: 正式環境務必使用 HTTPS
5. **Google Sheets**: 只給服務帳號最小權限
6. **LINE Webhook**: 驗證簽章以防止偽造請求

## 部署

### Vercel 部署

1. 將程式碼推送到 GitHub
2. 在 Vercel 匯入專案
3. 設定環境變數
4. 部署完成後，更新 LINE Bot 的 Webhook URL

### 其他平台

可部署到任何支援 Next.js 的平台：
- Netlify
- Railway
- AWS Amplify
- Google Cloud Run
- 自架伺服器（使用 PM2）

## 故障排除

### Google Sheets 連線失敗

1. 檢查服務帳號金鑰是否正確
2. 確認 Google Sheets API 已啟用
3. 確認服務帳號有試算表的編輯權限
4. 檢查試算表 ID 是否正確

### LINE Bot 無回應

1. 檢查 Webhook URL 是否正確
2. 確認 Channel Access Token 和 Secret 是否正確
3. 檢查伺服器是否可從外部訪問
4. 查看 LINE Developers Console 的錯誤日誌

### PIN 碼登入失敗

1. 確認 PIN_CODE_HASH 是否正確設定
2. 重新產生 PIN Hash 並更新環境變數
3. 清除瀏覽器 Cookie

## 授權

MIT License

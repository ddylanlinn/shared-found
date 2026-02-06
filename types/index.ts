// 支出記錄類型（對應 Google Sheets Data 工作表）
export interface Expense {
  id: string;           // 自動生成的行號（I 欄或 J 欄）
  date: string;         // A 欄：日期
  category: string;     // B 欄：類別
  subcategory: string;  // C 欄：子類別
  amount: number;       // D 欄：金額
  project?: string;     // E 欄：專案
  method: string;       // F 欄：付款方式
  label?: string;       // G 欄：標籤
  currency?: string;    // H 欄：幣別
  note?: string;        // I 欄：備註
}

// 類別統計類型
export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

// 月度統計類型
export interface MonthlySummary {
  month: string;
  total: number;
  budget: number;       // 月度預算
  categories: CategorySummary[];
  topExpenses: Expense[];
}

// LINE Webhook 事件類型
export interface LineWebhookEvent {
  type: string;
  message?: {
    type: string;
    text?: string;
    id?: string;
  };
  replyToken: string;
  source: {
    userId: string;
    type: string;
  };
}

// LINE 訊息類型
export interface LineMessage {
  type: 'text' | 'flex';
  text?: string;
  altText?: string;
  contents?: any;
}

// JWT Payload 類型
export interface JWTPayload {
  authenticated: boolean;
  iat?: number;
  exp?: number;
}

// API Response 類型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// OpenClaw OCR 回應類型
export interface OcrResult {
  success: boolean;
  data?: {
    merchant?: string;
    date?: string;
    amount?: number;
    items?: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
  };
  error?: string;
}

// Google Sheets 行資料類型
export type SheetRow = (string | number)[];

// 環境變數類型
export interface EnvConfig {
  googleClientEmail: string;
  googlePrivateKey: string;
  spreadsheetId: string;
  lineChannelAccessToken: string;
  lineChannelSecret: string;
  jwtSecret: string;
  pinCodeHash: string;
  openclawApiKey?: string;
}

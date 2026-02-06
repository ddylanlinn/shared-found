/**
 * 應用程式常數定義
 */

// ===== 認證相關 =====
export const AUTH = {
  /** JWT Token 有效期限（天） */
  JWT_EXPIRES_IN_DAYS: 7,
  /** Session Cookie 有效期限（秒） */
  SESSION_DURATION_SECONDS: 7 * 24 * 60 * 60, // 7 天
  /** PIN 碼最小長度 */
  PIN_MIN_LENGTH: 4,
  /** PIN 碼最大長度 */
  PIN_MAX_LENGTH: 6,
} as const;

// ===== 資料查詢相關 =====
export const DATA = {
  /** 預設列表項目數量上限 */
  DEFAULT_LIST_LIMIT: 20,
  /** LINE Bot 顯示的最大項目數 */
  MAX_LIST_ITEMS: 10,
  /** 月度統計顯示的最大支出項目數 */
  TOP_EXPENSES_COUNT: 5,
} as const;

// ===== Google Sheets 相關 =====
export const SHEETS = {
  /** Data 工作表範圍（含 ID 欄） */
  DATA_RANGE: 'Data!A:I',
  /** Data 工作表標題列範圍 */
  HEADER_RANGE: 'Data!A1:I1',
  /** Config 工作表類別範圍 */
  CONFIG_CATEGORY_RANGE: 'Config!E:F',
  /** Config 工作表付款方式範圍 */
  CONFIG_PAYMENT_RANGE: 'Config!K:K',
  /** Config 工作表設定範圍 */
  CONFIG_SETTINGS_RANGE: 'Config!A:B',
} as const;

// ===== 日期格式 =====
export const DATE_FORMAT = {
  /** 標準日期格式 */
  STANDARD: 'yyyy/MM/dd',
  /** ISO 日期格式 */
  ISO: 'yyyy-MM-dd',
} as const;

// ===== 預設值 =====
export const DEFAULTS = {
  /** 預設幣別 */
  CURRENCY: 'TWD',
  /** 預設預算（0 表示未設定） */
  BUDGET: 0,
} as const;

// ===== Storage Keys =====
export const STORAGE_KEYS = {
  /** Category 快取 key */
  EXPENSE_CATEGORIES: 'expense_categories',
  /** Auth Token key */
  AUTH_TOKEN: 'auth-token',
  /** Auth Status key */
  AUTH_STATUS: 'auth_status',
  /** Dashboard 資料快取 key */
  DASHBOARD_DATA: 'dashboard_data',
} as const;

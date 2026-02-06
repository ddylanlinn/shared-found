/**
 * 統一的錯誤碼系統
 */

export enum ErrorCode {
  // ===== 認證相關 =====
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_PIN = 'INVALID_PIN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // ===== 輸入驗證相關 =====
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_JSON = 'INVALID_JSON',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  INVALID_AMOUNT = 'INVALID_AMOUNT',

  // ===== 資源相關 =====
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // ===== 速率限制 =====
  RATE_LIMITED = 'RATE_LIMITED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // ===== 外部服務相關 =====
  GOOGLE_SHEETS_ERROR = 'GOOGLE_SHEETS_ERROR',
  LINE_API_ERROR = 'LINE_API_ERROR',
  OCR_ERROR = 'OCR_ERROR',

  // ===== 一般錯誤 =====
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * 錯誤訊息對應
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // 認證相關
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCode.INVALID_PIN]: 'Invalid PIN code',
  [ErrorCode.INVALID_TOKEN]: 'Invalid authentication token',
  [ErrorCode.SESSION_EXPIRED]: 'Session has expired',

  // 輸入驗證相關
  [ErrorCode.INVALID_INPUT]: 'Invalid input data',
  [ErrorCode.INVALID_JSON]: 'Invalid JSON format',
  [ErrorCode.MISSING_REQUIRED_FIELDS]: 'Missing required fields',
  [ErrorCode.INVALID_DATE_FORMAT]: 'Invalid date format',
  [ErrorCode.INVALID_AMOUNT]: 'Invalid amount',

  // 資源相關
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.ALREADY_EXISTS]: 'Resource already exists',

  // 速率限制
  [ErrorCode.RATE_LIMITED]: 'Rate limit exceeded',
  [ErrorCode.TOO_MANY_REQUESTS]: 'Too many requests',

  // 外部服務相關
  [ErrorCode.GOOGLE_SHEETS_ERROR]: 'Google Sheets service error',
  [ErrorCode.LINE_API_ERROR]: 'LINE API error',
  [ErrorCode.OCR_ERROR]: 'OCR recognition error',

  // 一般錯誤
  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
};

/**
 * HTTP 狀態碼對應
 */
export const ErrorStatusCodes: Record<ErrorCode, number> = {
  // 認證相關
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_PIN]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.SESSION_EXPIRED]: 401,

  // 輸入驗證相關
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.INVALID_JSON]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELDS]: 400,
  [ErrorCode.INVALID_DATE_FORMAT]: 400,
  [ErrorCode.INVALID_AMOUNT]: 400,

  // 資源相關
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,

  // 速率限制
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,

  // 外部服務相關
  [ErrorCode.GOOGLE_SHEETS_ERROR]: 502,
  [ErrorCode.LINE_API_ERROR]: 502,
  [ErrorCode.OCR_ERROR]: 502,

  // 一般錯誤
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
};

/**
 * 建立標準化的錯誤回應
 */
export function createErrorResponse(code: ErrorCode, customMessage?: string) {
  return {
    success: false,
    error: customMessage || ErrorMessages[code],
    errorCode: code,
  };
}

/**
 * 取得錯誤的 HTTP 狀態碼
 */
export function getErrorStatusCode(code: ErrorCode): number {
  return ErrorStatusCodes[code];
}

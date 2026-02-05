/**
 * 處理 HTTP GET 請求（給 Web Dashboard 使用）
 *
 * 支援的 action：
 * - getTransactions: 取得所有交易記錄
 * - getConfig: 取得系統設定
 * - getStats: 取得統計資料
 */
function doGet(e) {
  const action = e.parameter.action;

  try {
    let result;

    switch(action) {
      case 'getTransactions':
        result = SheetService.getTransactions(e.parameter);
        break;

      case 'getConfig':
        result = SheetService.getConfig();
        break;

      case 'getStats':
        result = SheetService.getStats(e.parameter);
        break;

      default:
        result = { error: 'Invalid action' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    Logger.log('doGet Error: ' + error.toString());

    return ContentService
      .createTextOutput(JSON.stringify({
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * 處理 HTTP POST 請求（LINE Bot Webhook + Web App 寫入）
 *
 * 判斷來源：
 * - 有 events 欄位 → LINE Webhook
 * - 無 events 欄位 → Web App 請求
 */
/**
 * 處理 HTTP POST 請求（LINE Bot Webhook + Web App 寫入）
 */
function doPost(e) {
  try {
    // 安全檢查：確保 e.postData 存在
    if (!e.postData || !e.postData.contents) {
      return createJsonResponse({ error: 'No post data received' });
    }

    const postData = JSON.parse(e.postData.contents);

    // --- 1. 處理 LINE Webhook ---
    if (postData.events) {
      // 核心修正：如果 events 是空的（LINE Verify 測試），直接回傳成功
      if (postData.events.length === 0) {
        return createJsonResponse({ status: 'ok', message: 'Verification successful' });
      }

      // 呼叫你的 LineService 處理邏輯
      // 建議確保 LineService.handleWebhook(postData) 內部不要執行太久
      LineService.handleWebhook(postData);

      // 統一回傳 200 OK 給 LINE，避免 Timeout
      return createJsonResponse({ status: 'success' });
    }

    // --- 2. 處理 Web App 請求 ---
    const action = postData.action;
    let result;

    switch(action) {
      case 'addTransaction':
        result = SheetService.addTransaction(postData.data);
        break;
      case 'updateTransaction':
        result = SheetService.updateTransaction(postData.data);
        break;
      case 'deleteTransaction':
        result = SheetService.deleteTransaction(postData.id);
        break;
      case 'updateConfig':
        result = SheetService.updateConfig(postData.data);
        break;
      default:
        result = { error: 'Invalid action' };
    }

    return createJsonResponse(result);

  } catch(error) {
    // 發生錯誤時記錄下來，並回傳 JSON 格式的錯誤訊息
    console.error('doPost Error: ' + error.toString());
    return createJsonResponse({
      error: 'Internal Server Error',
      message: error.toString()
    });
  }
}

/**
 * 輔助函式：統一建立 JSON 回傳格式
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
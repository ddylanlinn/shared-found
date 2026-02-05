/**
 * LineService - LINE Bot Webhook 處理服務
 */
const LineService = {

  /**
   * 取得 LINE Channel Access Token
   * @returns {string} Access Token
   */
  get channelAccessToken() {
    const token = PropertiesService.getScriptProperties()
      .getProperty('LINE_CHANNEL_ACCESS_TOKEN');

    if (!token) {
      throw new Error('LINE_CHANNEL_ACCESS_TOKEN not found in Script Properties');
    }

    return token;
  },


  /**
   * 處理 LINE Webhook
   * @param {Object} data - LINE 傳來的 Webhook 資料
   * @returns {ContentService} HTTP 回應
   */
  handleWebhook(data) {
    const events = data.events || [];

    events.forEach(event => {
      if (event.type === 'message' && event.message.type === 'text') {
        this.handleTextMessage(event);
      }
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  },


  /**
   * 處理文字訊息
   * @param {Object} event - LINE 訊息事件
   */
  handleTextMessage(event) {
    const userMessage = event.message.text;
    const replyToken = event.replyToken;

    // 解析訊息
    const parsed = Parser.parse(userMessage);

    if (parsed.error) {
      this.replyMessage(replyToken, parsed.error);
      return;
    }

    // 寫入 Sheet
    try {
      SheetService.addTransaction({
        date: new Date(),
        amount: parsed.amount,
        category: parsed.category,
        subcategory: parsed.subcategory,
        label: '',
        method: '',
        currency: parsed.currency
      });

      const confirmMsg = `✅ 記帳成功！\n` +
        `金額：${parsed.amount} ${parsed.currency}\n` +
        `分類：${parsed.category} > ${parsed.subcategory}`;

      this.replyMessage(replyToken, confirmMsg);

    } catch(error) {
      Logger.log('Add transaction error: ' + error.toString());
      this.replyMessage(replyToken, '❌ 記帳失敗：' + error.toString());
    }
  },


  /**
   * 回覆 LINE 訊息
   * @param {string} replyToken - LINE Reply Token
   * @param {string} text - 回覆文字
   */
  replyMessage(replyToken, text) {
    const url = 'https://api.line.me/v2/bot/message/reply';

    const payload = {
      replyToken: replyToken,
      messages: [{
        type: 'text',
        text: text
      }]
    };

    try {
      UrlFetchApp.fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.channelAccessToken
        },
        payload: JSON.stringify(payload)
      });
    } catch(error) {
      Logger.log('Reply message error: ' + error.toString());
    }
  }
};
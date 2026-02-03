# Google Apps Script 完整程式碼

本文件包含所有 Google Apps Script 檔案的完整程式碼。請依序複製貼上到對應的 .gs 檔案中。

## 📋 檔案清單

1. [Code.gs](#codegs---主入口) - 主入口（處理 HTTP 請求）
2. [SheetService.gs](#sheetservicegs---資料庫操作) - 資料庫操作（讀寫 Google Sheets）
3. [Parser.gs](#parsergs---自然語言解析) - 自然語言解析（正則表達式）
4. [LineService.gs](#lineservicegs---line-bot-處理) - LINE Bot 處理（Webhook）

---

## Code.gs - 主入口

這是 API 的主入口，處理所有 HTTP GET/POST 請求。

```javascript
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
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);

    // 判斷是 LINE Webhook 還是 Web request
    if (postData.events) {
      // LINE Webhook
      return LineService.handleWebhook(postData);

    } else {
      // Web request
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

      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch(error) {
    Logger.log('doPost Error: ' + error.toString());

    return ContentService
      .createTextOutput(JSON.stringify({
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## SheetService.gs - 資料庫操作

負責所有 Google Sheets 的讀寫操作。

```javascript
/**
 * SheetService - Google Sheets 資料庫操作服務
 */
const SheetService = {

  /**
   * 取得指定分頁的 Sheet 物件
   * @param {string} tabName - 分頁名稱（'Data' 或 'Config'）
   * @returns {Sheet} Sheet 物件
   */
  getSheet(tabName) {
    const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');

    if (!sheetId) {
      throw new Error('SHEET_ID not found in Script Properties');
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName(tabName);

    if (!sheet) {
      throw new Error(`Sheet "${tabName}" not found`);
    }

    return sheet;
  },


  /**
   * 取得所有交易記錄
   * @param {Object} params - 查詢參數（未來可擴充篩選功能）
   * @returns {Array} 交易記錄陣列
   */
  getTransactions(params) {
    const sheet = this.getSheet('Data');
    const data = sheet.getDataRange().getValues();

    if (data.length === 0) {
      return [];
    }

    const headers = data[0];

    // 轉換為物件陣列
    const transactions = data.slice(1).map((row, index) => {
      let obj = { id: index + 2 }; // row number (1-based, skip header)

      headers.forEach((header, i) => {
        obj[header] = row[i];
      });

      return obj;
    }).filter(t => t.Date); // 過濾空行

    // 依日期排序（最新在前）
    return transactions.sort((a, b) => {
      return new Date(b.Date) - new Date(a.Date);
    });
  },


  /**
   * 取得系統設定
   * @returns {Object} 設定物件（包含分類、標籤、付款方式等）
   */
  getConfig() {
    const sheet = this.getSheet('Config');
    const config = {};

    // 讀取基本設定（A:B 欄）
    const basicData = sheet.getRange('A1:B10').getValues();
    basicData.forEach(row => {
      if (row[0] && row[0] !== 'Key') {
        config[row[0]] = row[1];
      }
    });

    // 讀取分類對照表（D:E 欄）
    const categoryData = sheet.getRange('D2:E100').getValues();
    const categories = {};

    categoryData.forEach(row => {
      const category = row[0];
      const subcategory = row[1];

      if (category && subcategory) {
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(subcategory);
      }
    });

    config.categories = categories;

    // 讀取 Label 選項（G 欄）
    const labelData = sheet.getRange('G2:G10').getValues();
    config.labels = labelData
      .map(r => r[0])
      .filter(v => v);

    // 讀取 Method 選項（I 欄）
    const methodData = sheet.getRange('I2:I10').getValues();
    config.methods = methodData
      .map(r => r[0])
      .filter(v => v);

    return config;
  },


  /**
   * 取得統計資料
   * @param {Object} params - 查詢參數（未來可擴充）
   * @returns {Object} 統計資料（本月/本週支出、分類統計等）
   */
  getStats(params) {
    const transactions = this.getTransactions();
    const now = new Date();

    // 本月交易
    const thisMonth = transactions.filter(t => {
      const d = new Date(t.Date);
      return d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear();
    });

    // 本週交易（過去 7 天）
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = transactions.filter(t => {
      return new Date(t.Date) >= weekAgo;
    });

    // 分類統計（本月）
    const categoryStats = {};
    thisMonth.forEach(t => {
      const cat = t.Category || '未分類';
      categoryStats[cat] = (categoryStats[cat] || 0) + Number(t.Amount);
    });

    return {
      monthlyTotal: thisMonth.reduce((sum, t) => sum + Number(t.Amount), 0),
      weeklyTotal: thisWeek.reduce((sum, t) => sum + Number(t.Amount), 0),
      categoryStats,
      recentTransactions: transactions.slice(0, 10)
    };
  },


  /**
   * 新增交易記錄
   * @param {Object} data - 交易資料
   * @returns {Object} 成功訊息
   */
  addTransaction(data) {
    const sheet = this.getSheet('Data');

    const row = [
      new Date(data.date || new Date()),
      data.amount,
      data.category || '',
      data.subcategory || '',
      data.label || '',
      data.method || '',
      data.currency || 'TWD',
      data.note || ''
    ];

    sheet.appendRow(row);

    return {
      success: true,
      message: '交易記錄已新增'
    };
  },


  /**
   * 更新交易記錄
   * @param {Object} data - 交易資料（必須包含 id）
   * @returns {Object} 成功訊息
   */
  updateTransaction(data) {
    const sheet = this.getSheet('Data');

    if (!data.id) {
      throw new Error('Missing transaction ID');
    }

    const row = [
      new Date(data.date),
      data.amount,
      data.category || '',
      data.subcategory || '',
      data.label || '',
      data.method || '',
      data.currency || 'TWD',
      data.note || ''
    ];

    sheet.getRange(data.id, 1, 1, 8).setValues([row]);

    return {
      success: true,
      message: '交易記錄已更新'
    };
  },


  /**
   * 刪除交易記錄
   * @param {number} id - 列號（row number）
   * @returns {Object} 成功訊息
   */
  deleteTransaction(id) {
    const sheet = this.getSheet('Data');

    if (!id || id < 2) {
      throw new Error('Invalid transaction ID');
    }

    sheet.deleteRow(id);

    return {
      success: true,
      message: '交易記錄已刪除'
    };
  }
};
```

---

## Parser.gs - 自然語言解析

負責解析使用者輸入的自然語言記帳訊息。

```javascript
/**
 * Parser - 自然語言記帳訊息解析服務
 *
 * 支援格式：
 * - "午餐 200" → 自動猜測分類
 * - "咖啡 80 飲料" → 指定小分類
 * - "捷運 30 交通" → 指定大分類
 */
const Parser = {

  /**
   * 解析記帳訊息
   * @param {string} text - 使用者輸入的文字
   * @returns {Object} 解析結果（包含金額、分類、備註等）
   */
  parse(text) {
    // 移除多餘空白
    text = text.trim();

    // 正則表達式：[項目名稱] [金額] [可選分類]
    const pattern = /^(.+?)\s+(\d+)(?:\s+(.+))?$/;
    const match = text.match(pattern);

    if (!match) {
      return {
        error: '格式錯誤，請使用：項目 金額 [分類]\n例如：午餐 200 或 捷運 30 交通'
      };
    }

    const [, itemName, amount, categoryHint] = match;

    // 取得配置（分類對照表）
    const config = SheetService.getConfig();

    // 智能分類匹配
    let category = '其他';
    let subcategory = itemName;

    if (categoryHint) {
      // 使用者提供了分類提示
      const matched = this.matchCategory(categoryHint, config.categories);

      if (matched) {
        category = matched.category;
        subcategory = matched.subcategory || itemName;
      }
    } else {
      // 根據項目名稱猜測分類
      const guessed = this.guessCategory(itemName, config.categories);

      if (guessed) {
        category = guessed.category;
        subcategory = guessed.subcategory || itemName;
      }
    }

    return {
      amount: parseInt(amount),
      category,
      subcategory,
      note: itemName,
      currency: 'TWD'
    };
  },


  /**
   * 匹配分類（精確比對）
   * @param {string} hint - 分類提示
   * @param {Object} categories - 分類對照表
   * @returns {Object|null} 匹配結果
   */
  matchCategory(hint, categories) {
    // 完全匹配大分類
    if (categories[hint]) {
      return {
        category: hint,
        subcategory: null
      };
    }

    // 匹配小分類
    for (const [cat, subs] of Object.entries(categories)) {
      if (subs.includes(hint)) {
        return {
          category: cat,
          subcategory: hint
        };
      }
    }

    return null;
  },


  /**
   * 猜測分類（關鍵字比對）
   * @param {string} itemName - 項目名稱
   * @param {Object} categories - 分類對照表
   * @returns {Object|null} 猜測結果
   */
  guessCategory(itemName, categories) {
    // 關鍵字對照表（可自行擴充）
    const keywords = {
      '食物': ['餐', '飯', '麵', '麵包', '咖啡', '茶', '飲料', '便當', '小吃', '早餐', '午餐', '晚餐'],
      '交通': ['捷運', '公車', '油', '停車', '計程車', 'Uber', '高鐵', '台鐵'],
      '娛樂': ['電影', '遊戲', 'KTV', '唱歌'],
      '生活': ['日用品', '清潔', '水電', '房租'],
      '醫療': ['診', '藥', '醫院', '看病']
    };

    for (const [cat, words] of Object.entries(keywords)) {
      // 檢查是否包含關鍵字
      if (words.some(w => itemName.includes(w))) {
        // 找到匹配的大分類，嘗試匹配小分類
        const subs = categories[cat] || [];
        const matchedSub = subs.find(s => itemName.includes(s));

        return {
          category: cat,
          subcategory: matchedSub || null
        };
      }
    }

    return null;
  }
};
```

---

## LineService.gs - LINE Bot 處理

負責處理 LINE Bot Webhook 請求。

```javascript
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
        currency: parsed.currency,
        note: parsed.note
      });

      const confirmMsg = `✅ 記帳成功！\n` +
        `金額：${parsed.amount} ${parsed.currency}\n` +
        `分類：${parsed.category} > ${parsed.subcategory}\n` +
        `備註：${parsed.note}`;

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
```

---

## 🎯 重要提醒

### 1. 修改 SHEET_ID 位置

在 `SheetService.gs` 中，程式會從 Script Properties 讀取 SHEET_ID：

```javascript
const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
```

**確保你已經在 Script Properties 設定 `SHEET_ID`**（參考步驟二）。

### 2. 修改 LINE_CHANNEL_ACCESS_TOKEN 位置

在 `LineService.gs` 中，程式會從 Script Properties 讀取 Token：

```javascript
const token = PropertiesService.getScriptProperties()
  .getProperty('LINE_CHANNEL_ACCESS_TOKEN');
```

**確保你已經在 Script Properties 設定 `LINE_CHANNEL_ACCESS_TOKEN`**（等設定完 LINE Bot 後填入）。

### 3. 儲存所有檔案

複製完所有程式碼後，記得：

1. 點擊「**儲存**」（或 Ctrl+S / Cmd+S）
2. 確認沒有語法錯誤（編輯器會顯示紅色波浪線）

### 4. 測試執行

可以先測試 `SheetService.getConfig()` 函式：

1. 在編輯器上方的函式下拉選單中，選擇 `getConfig`
2. 點擊「**執行**」
3. 查看「**執行記錄**」，應該會顯示你的設定資料

---

## 🎉 下一步

完成程式碼複製後，回到：

👉 **[02-GOOGLE-APPS-SCRIPT-SETUP.md](02-GOOGLE-APPS-SCRIPT-SETUP.md)** 繼續部署步驟

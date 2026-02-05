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

    // 讀取分類對照表（E:F 欄，水平格式）
    const categoryData = sheet.getRange('E2:F50').getValues();
    const categories = {};

    categoryData.forEach(row => {
      const category = row[0]; // E 欄：Category
      const subcategoriesStr = row[1]; // F 欄：Subcategories（逗號分隔）

      if (category && subcategoriesStr) {
        // 將逗號分隔的字串拆成陣列，並去除前後空白
        categories[category] = subcategoriesStr
          .split(',')
          .map(s => s.trim())
          .filter(s => s); // 過濾空字串
      }
    });

    config.categories = categories;

    // 讀取 Label 選項（H 欄）
    const labelData = sheet.getRange('H2:H10').getValues();
    config.labels = labelData
      .map(r => r[0])
      .filter(v => v);

    // 讀取 Method 選項（K 欄）
    const methodData = sheet.getRange('K2:K10').getValues();
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
   * 格式化日期為 YYYY-MM-DD
   * @param {Date} date - 日期物件
   * @returns {string} 格式化後的日期字串
   */
  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 新增交易記錄
   * @param {Object} data - 交易資料
   * @returns {Object} 成功訊息
   */
  addTransaction(data) {
    const sheet = this.getSheet('Data');

    const row = [
      this.formatDate(data.date || new Date()),
      data.category || '',
      data.subcategory || '',
      data.amount,
      data.label || '',
      data.method || '',
      data.currency || 'TWD',
      '' // Note 欄位留空
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
      this.formatDate(data.date),
      data.category || '',
      data.subcategory || '',
      data.amount,
      data.label || '',
      data.method || '',
      data.currency || 'TWD',
      '' // Note 欄位留空
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
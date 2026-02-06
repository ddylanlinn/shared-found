import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { parse, compareDesc } from 'date-fns';
import { getMonthDateRange, formatDateToISO } from '@/lib/utils/date';
import type { Expense, SheetRow } from '@/types';

export class GoogleSheetsService {
  private sheets;
  private spreadsheetId: string;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = process.env.SPREADSHEET_ID!;
  }

  /**
   * 新增支出記錄到 Google Sheets
   */
  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    // 生成 UUID
    const id = uuidv4();
    
    const row: SheetRow = [
      expense.date,
      expense.category,
      expense.subcategory || '',
      expense.amount,
      expense.project || '', // E 欄：Project
      expense.method || '',  // F 欄：Method
      expense.label || '',   // G 欄：Label
      expense.currency || '',// H 欄：Currency
      expense.note || '',    // I 欄：Note
      id,                    // J 欄：ID
    ];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Data!A:J',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    return { id, ...expense };
  }

  /**
   * 取得所有支出記錄
   */
  async getExpenses(limit?: number): Promise<Expense[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Data!A:J',
    });

    const rows = response.data.values || [];

    // 跳過標題列
    const dataRows = rows.slice(1);

    // 轉換為 Expense 物件，過濾掉空行
    let expenses = dataRows
      .filter((row: SheetRow) => row[0]) // 確保 Date 欄位有值
      .map((row: SheetRow) => ({
        id: String(row[9] || uuidv4()), // J 欄：ID，若無則生成新的
        date: String(row[0] || ''),
        category: String(row[1] || ''),
        subcategory: String(row[2] || ''),
        amount: this.parseAmount(row[3]),
        project: String(row[4] || ''),   // E 欄：Project
        method: String(row[5] || ''),    // F 欄：Method
        label: String(row[6] || ''),     // G 欄：Label
        currency: String(row[7] || ''),  // H 欄：Currency
        note: String(row[8] || ''),      // I 欄：Note
      }));

    // 按日期排序（最新的在最上面）- 使用更穩全的 getTime() 比較方式
    expenses.sort((a, b) => {
      const timeA = new Date(a.date.replace(/-/g, '/')).getTime();
      const timeB = new Date(b.date.replace(/-/g, '/')).getTime();
      
      // 處理無效日期的情況，將無效日期排在最後
      if (isNaN(timeA)) return 1;
      if (isNaN(timeB)) return -1;
      
      return timeB - timeA; // 倒序：大到小
    });

    // 如果有限制數量，則只回傳前 N 筆
    if (limit) {
      expenses = expenses.slice(0, limit);
    }

    return expenses;
  }

  /**
   * 解析金額（移除貨幣符號和逗號）
   */
  private parseAmount(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // 移除 $, 逗號和其他非數字字符
      const cleaned = value.replace(/[$,\s]/g, '');
      return Number(cleaned) || 0;
    }
    return 0;
  }

  /**
   * 根據日期範圍取得支出記錄
   */
  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const allExpenses = await this.getExpenses();

    const startTime = new Date(startDate.replace(/-/g, '/')).getTime();
    const endTime = new Date(endDate.replace(/-/g, '/')).getTime();

    return allExpenses.filter(expense => {
      const expenseTime = new Date(expense.date.replace(/-/g, '/')).getTime();
      
      if (isNaN(expenseTime)) return false;
      
      return expenseTime >= startTime && expenseTime <= endTime;
    });
  }

  /**
   * 根據類別取得支出記錄
   */
  async getExpensesByCategory(category: string): Promise<Expense[]> {
    const allExpenses = await this.getExpenses();

    return allExpenses.filter(expense =>
      expense.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * 取得本月支出總額
   */
  async getMonthlyTotal(year: number, month: number): Promise<number> {
    const { startDate, endDate } = getMonthDateRange(year, month);

    const expenses = await this.getExpensesByDateRange(
      formatDateToISO(startDate),
      formatDateToISO(endDate)
    );

    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  /**
   * 刪除支出記錄
   */
  async deleteExpense(id: string): Promise<boolean> {
    // 先取得所有資料以找到對應的行號
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Data!A:J',
    });

    const rows = response.data.values || [];
    
    // 找到對應 ID 的行號（跳過標題列，從第 2 行開始）
    const rowIndex = rows.findIndex((row, index) => 
      index > 0 && String(row[9]) === id
    );

    if (rowIndex === -1) {
      return false;
    }

    // 獲取 Data 工作表的 sheetId
    const sheetMetadata = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });

    const dataSheet = sheetMetadata.data.sheets?.find(
      (sheet) => sheet.properties?.title === 'Data'
    );

    if (!dataSheet?.properties?.sheetId) {
      throw new Error('找不到 Data 工作表');
    }

    // 刪除該行（rowIndex 已經是 0-based）
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: dataSheet.properties.sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });

    return true;
  }


  /**
   * 取得類別配置（從 Config 工作表）
   */
  async getCategoryConfig(): Promise<{ category: string; subcategories: string[] }[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Config!D:E', // 讀取整個 D 和 E 欄 (改為 DE)
    });

    const rows = response.data.values || [];

    // 跳過標題列（第一行）
    const dataRows = rows.slice(1);

    const result = dataRows
      .filter((row: SheetRow) => row[0]) // 確保有 Category
      .map((row: SheetRow) => ({
        category: String(row[0] || ''),
        subcategories: row[1]
          ? String(row[1]).split(',').map(s => s.trim()).filter(s => s)
          : [],
      }));

    return result;
  }

  /**
   * 取得付款方式列表（從 Config 工作表 H 欄）
   * G 欄：Project, H 欄：Method
   */
  async getPaymentMethods(): Promise<string[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Config!H:H', // H 欄：Method
    });

    const rows = response.data.values || [];

    // 跳過標題列，取得所有付款方式
    const methods = rows
      .slice(1)
      .map((row: SheetRow) => String(row[0] || '').trim())
      .filter((method) => method); // 過濾掉空值

    // 去除重複值
    return [...new Set(methods)];
  }

  /**
   * 取得專案列表（從 Config 工作表 G 欄）
   * G 欄：Project, H 欄：Method
   */
  async getProjects(): Promise<string[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Config!G:G', // G 欄：Project
    });

    const rows = response.data.values || [];

    const projects = rows
      .slice(1)
      .map((row: SheetRow) => String(row[0] || '').trim())
      .filter((project) => project);

    return [...new Set(projects)];
  }

  /**
   * 取得標籤列表（從 Config 工作表 I 欄）
   */
  async getLabels(): Promise<string[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Config!I:I', // I 欄：Label
    });

    const rows = response.data.values || [];

    const labels = rows
      .slice(1)
      .map((row: SheetRow) => String(row[0] || '').trim())
      .filter((label) => label);

    return [...new Set(labels)];
  }

  /**
   * 取得配置值（從 Config 工作表 A:B 欄）
   */
  async getConfigValue(key: string): Promise<string | null> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Config!A:B',
    });

    const rows = response.data.values || [];
    const foundRow = rows.find(row => row[0] === key);
    return foundRow ? String(foundRow[1]) : null;
  }

  /**
   * 取得預算值
   */
  async getBudget(): Promise<number> {
    const budgetStr = await this.getConfigValue('monthly_budget');
    return budgetStr ? this.parseAmount(budgetStr) : 0;
  }

  /**
   * 取得預設專案
   */
  async getDefaultProject(): Promise<string> {
    const project = await this.getConfigValue('default_project');
    return project || '';
  }

  /**
   * 取得預設幣別
   */
  async getDefaultCurrency(): Promise<string> {
    const currency = await this.getConfigValue('default_currency');
    return currency || 'TWD';
  }

  /**
   * 初始化 Google Sheets（建立標題列）
   */
  async initialize(): Promise<void> {
    const headers = [
      'Date',
      'Category',
      'Subcategory',
      'Amount',
      'Label',
      'Method',
      'Currency',
      'Note',
      'ID',
    ];

    try {
      // 檢查是否已有標題列
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Data!A1:J1',
      });

      if (!response.data.values || response.data.values.length === 0) {
        // 新增標題列
        // 9 欄: Date, Category, Subcategory, Amount, Project, Method, Label, Currency, Note, ID
        const headers = [
          'Date',
          'Category',
          'Subcategory',
          'Amount',
          'Project',
          'Method',
          'Label',
          'Currency',
          'Note',
          'ID',
        ];

        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Data!A1:J1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });
      }
    } catch (error) {
      console.error('初始化 Google Sheets 失敗:', error);
      throw error;
    }
  }
}

// 匯出單例實例
export const googleSheetsService = new GoogleSheetsService();

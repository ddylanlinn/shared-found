import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/services/googleSheets';
import { getTokenFromCookie, isAuthenticated } from '@/lib/utils/jwt';
import type { ApiResponse, Expense } from '@/types';

/**
 * GET /api/expenses - 取得支出列表
 * Query params:
 *   - limit: 數量限制
 *   - startDate: 開始日期 (YYYY-MM-DD)
 *   - endDate: 結束日期 (YYYY-MM-DD)
 *   - category: 類別篩選
 */
export async function GET(request: NextRequest) {
  try {
    // Middleware 已檢查 token 存在性，這裡驗證 token 有效性
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);

    if (!isAuthenticated(token)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid or expired token',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');

    let expenses: Expense[];

    // 根據參數取得支出記錄
    if (startDate && endDate) {
      expenses = await googleSheetsService.getExpensesByDateRange(
        startDate,
        endDate
      );
    } else if (category) {
      expenses = await googleSheetsService.getExpensesByCategory(category);
    } else {
      expenses = await googleSheetsService.getExpenses(
        limit ? parseInt(limit) : undefined
      );
    }

    return NextResponse.json<ApiResponse<Expense[]>>({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error('取得支出列表失敗:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expenses - 新增支出記錄
 */
export async function POST(request: NextRequest) {
  try {
    // Middleware 已檢查 token 存在性，這裡驗證 token 有效性
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);

    if (!isAuthenticated(token)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid or expired token',
        },
        { status: 401 }
      );
    }
    
    // 解析 JSON body，處理無效 JSON 的情況
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid JSON body',
        },
        { status: 400 }
      );
    }

    const { date, category, subcategory, amount, project, label, method, currency, note } = body;

    // 驗證必填欄位
    if (!date || !category || !amount) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required fields (date, category, amount)',
        },
        { status: 400 }
      );
    }

    // 驗證金額
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Amount must be a positive number',
        },
        { status: 400 }
      );
    }

    // 新增支出記錄
    const expense = await googleSheetsService.addExpense({
      date,
      category,
      subcategory: subcategory || '',
      amount,
      project: project || '',
      label: label || '',
      method: method || '',
      currency: currency || 'TWD',
      note: note || '',
    });

    return NextResponse.json<ApiResponse<Expense>>({
      success: true,
      data: expense,
      message: 'Expense record added',
    });
  } catch (error) {
    console.error('新增支出記錄失敗:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

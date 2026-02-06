import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/services/googleSheets';
import { getTokenFromCookie, isAuthenticated } from '@/lib/utils/jwt';
import type { ApiResponse, MonthlySummary, CategorySummary } from '@/types';

/**
 * GET /api/expenses/summary - 取得月度統計
 * Query params:
 *   - year: 年份 (預設當年)
 *   - month: 月份 (預設當月)
 */
export async function GET(request: NextRequest) {
  try {
    // 驗證身份
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);

    if (!isAuthenticated(token)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const year = parseInt(searchParams.get('year') || String(now.getFullYear()));
    const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1));

    // 取得月度支出
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const expenses = await googleSheetsService.getExpensesByDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    // 計算總金額
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // 計算類別統計
    const categoryMap = new Map<string, { total: number; count: number }>();

    expenses.forEach((expense) => {
      const current = categoryMap.get(expense.category) || { total: 0, count: 0 };
      categoryMap.set(expense.category, {
        total: current.total + expense.amount,
        count: current.count + 1,
      });
    });

    const categories: CategorySummary[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: total > 0 ? (data.total / total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // 取得前 5 筆最大支出
    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 取得預算
    const budget = await googleSheetsService.getBudget();
    console.log('Fetching budget:', budget);

    const summary: MonthlySummary = {
      month: `${year}/${month}`,
      total,
      budget,
      categories,
      topExpenses,
    };

    return NextResponse.json<ApiResponse<MonthlySummary>>({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('取得月度統計失敗:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/services/googleSheets';
import { getTokenFromCookie, isAuthenticated } from '@/lib/utils/jwt';
import type { ApiResponse } from '@/types';

/**
 * DELETE /api/expenses/[id] - 刪除支出記錄
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // 刪除支出記錄
    const deleted = await googleSheetsService.deleteExpense(id);

    if (!deleted) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Expense record not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Expense record deleted',
    });
  } catch (error) {
    console.error('刪除支出記錄失敗:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

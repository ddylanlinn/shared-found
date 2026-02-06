import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/services/googleSheets';
import { getTokenFromCookie, isAuthenticated } from '@/lib/utils/jwt';
import type { ApiResponse } from '@/types';

/**
 * GET /api/categories - 取得類別配置
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

    const categories = await googleSheetsService.getCategoryConfig();
    const paymentMethods = await googleSheetsService.getPaymentMethods();
    const projects = await googleSheetsService.getProjects();
    const labels = await googleSheetsService.getLabels();
    const defaultProject = await googleSheetsService.getDefaultProject();
    const defaultCurrency = await googleSheetsService.getDefaultCurrency();

    console.log('Categories loaded:', categories);
    console.log('Payment methods loaded:', paymentMethods);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        categories,
        paymentMethods,
        projects,
        labels,
        defaultProject,
        defaultCurrency,
      },
    });
  } catch (error) {
    console.error('取得類別配置失敗:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

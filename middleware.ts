import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware - 統一處理認證檢查
 * 注意：Middleware 運行在 Edge Runtime，無法使用某些 Node.js 模組
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 需要認證的路徑
  const protectedPaths = [
    '/api/expenses',
    '/api/categories',
    '/dashboard',
    '/add-expense',
  ];

  // 檢查是否為受保護的路徑
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    // 從 cookie 取得 token
    const token = request.cookies.get('auth-token');

    // 檢查 token 是否存在
    if (!token || !token.value) {
      // API 路由返回 JSON 錯誤
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // 頁面路由重定向到登入頁
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * 配置 middleware 匹配的路徑
 */
export const config = {
  matcher: [
    '/api/expenses/:path*',
    '/api/categories/:path*',
    '/dashboard',
    '/add-expense',
  ],
};

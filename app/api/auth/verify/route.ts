import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookie, isAuthenticated } from '@/lib/utils/jwt';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = getTokenFromCookie(cookieHeader);

  const authenticated = isAuthenticated(token);

  return NextResponse.json<ApiResponse>({
    success: true,
    data: { authenticated },
  });
}

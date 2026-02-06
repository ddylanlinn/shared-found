import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export async function POST() {
  const response = NextResponse.json<ApiResponse>({
    success: true,
    message: 'Logout successful',
  });

  // 清除 Cookie
  response.cookies.delete('auth-token');

  return response;
}

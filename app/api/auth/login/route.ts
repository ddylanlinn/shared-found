import { NextRequest, NextResponse } from 'next/server';
import { verifyPin, isValidPinFormat } from '@/lib/utils/pin';
import { generateToken } from '@/lib/utils/jwt';
import type { ApiResponse, JWTPayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
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

    const { pin } = body;

    // 驗證 PIN 格式
    if (!pin || !isValidPinFormat(pin)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid PIN format (requires 4-6 digits)',
        },
        { status: 400 }
      );
    }

    // 驗證 PIN
    const isValid = await verifyPin(pin);

    if (!isValid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Incorrect PIN',
        },
        { status: 401 }
      );
    }

    // 產生 JWT Token
    const payload: JWTPayload = {
      authenticated: true,
    };

    const token = generateToken(payload);

    // 設定 Cookie
    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Login successful',
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 天
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('登入失敗:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

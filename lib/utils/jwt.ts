import jwt from 'jsonwebtoken';
import type { JWTPayload } from '@/types';
import { AUTH } from '@/lib/constants';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_EXPIRES_IN = '7d'; // 使用字串常數以符合 jwt.sign 的類型要求

/**
 * 產生 JWT Token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * 驗證 JWT Token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    return decoded as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * 從 Cookie 中取得 Token
 */
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies['auth-token'] || null;
}

/**
 * 檢查是否已驗證
 */
export function isAuthenticated(token: string | null): boolean {
  if (!token) {
    return false;
  }

  const payload = verifyToken(token);
  return payload !== null && payload.authenticated === true;
}

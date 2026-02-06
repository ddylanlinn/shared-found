import { STORAGE_KEYS } from '@/lib/constants';

interface AuthData {
  authenticated: boolean;
  timestamp: number;
}

const STORAGE_KEY = STORAGE_KEYS.AUTH_STATUS;

export const authStorage = {
  /**
   * 從 localStorage 取得認證狀態
   */
  get(): AuthData | null {
    // SSR 環境檢查
    if (typeof window === 'undefined') return null;

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get auth status from localStorage:', error);
      return null;
    }
  },

  /**
   * 將認證狀態存入 localStorage
   */
  set(authenticated: boolean): void {
    // SSR 環境檢查
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          authenticated,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Failed to save auth status to localStorage:', error);
    }
  },

  /**
   * 清除 localStorage 中的認證狀態
   */
  clear(): void {
    // SSR 環境檢查
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth status from localStorage:', error);
    }
  },
};

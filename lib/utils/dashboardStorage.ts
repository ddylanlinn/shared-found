import { STORAGE_KEYS } from '@/lib/constants';
import type { MonthlySummary, Expense } from '@/types';

interface DashboardData {
  summary: MonthlySummary | null;
  expenses: Expense[];
  timestamp: number;
}

const STORAGE_KEY = STORAGE_KEYS.DASHBOARD_DATA;
// Cache 有效期限：5 分鐘（兩人共用時，給另一人的變更一點時間同步）
const CACHE_TTL_MS = 5 * 60 * 1000;

export const dashboardStorage = {
  /**
   * 從 localStorage 取得 dashboard 資料
   * @returns 快取資料，若過期或不存在則回傳 null
   */
  get(): DashboardData | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      
      const parsed: DashboardData = JSON.parse(data);
      
      // 檢查是否過期
      if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to get dashboard data from localStorage:', error);
      return null;
    }
  },

  /**
   * 將 dashboard 資料存入 localStorage
   */
  set(summary: MonthlySummary | null, expenses: Expense[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data: DashboardData = {
        summary,
        expenses,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save dashboard data to localStorage:', error);
    }
  },

  /**
   * 清除 localStorage 中的 dashboard 資料（新增/刪除後呼叫）
   */
  invalidate(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to invalidate dashboard cache:', error);
    }
  },
};

import { STORAGE_KEYS } from '@/lib/constants';

interface CategoryConfig {
  category: string;
  subcategories: string[];
}

interface CategoryData {
  categories: CategoryConfig[];
  paymentMethods: string[];
  projects: string[];
  labels: string[];
  defaultProject?: string;
  defaultCurrency?: string;
}

const STORAGE_KEY = STORAGE_KEYS.EXPENSE_CATEGORIES;

export const categoryStorage = {
  /**
   * 從 localStorage 取得 categories 資料
   */
  get(): CategoryData | null {
    // SSR 環境檢查
    if (typeof window === 'undefined') return null;
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get categories from localStorage:', error);
      return null;
    }
  },

  /**
   * 將 categories 資料存入 localStorage
   */
  set(
    categories: CategoryConfig[],
    paymentMethods: string[],
    projects: string[] = [],
    labels: string[] = [],
    defaultProject: string = '',
    defaultCurrency: string = 'TWD'
  ): void {
    // SSR 環境檢查
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          categories,
          paymentMethods,
          projects,
          labels,
          defaultProject,
          defaultCurrency,
        })
      );
    } catch (error) {
      console.error('Failed to save categories to localStorage:', error);
    }
  },

  /**
   * 清除 localStorage 中的 categories 資料
   */
  clear(): void {
    // SSR 環境檢查
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear categories from localStorage:', error);
    }
  },
};

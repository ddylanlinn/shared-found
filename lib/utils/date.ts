import { DATE_FORMAT } from '@/lib/constants';

/**
 * 取得指定年月的日期範圍
 */
export function getMonthDateRange(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return { startDate, endDate };
}

/**
 * 取得當前月份的日期範圍
 */
export function getCurrentMonthDateRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return getMonthDateRange(year, month);
}

/**
 * 格式化日期為 ISO 格式 (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 取得當前月份的 ISO 格式日期範圍
 */
export function getCurrentMonthISORange() {
  const { startDate, endDate } = getCurrentMonthDateRange();
  return {
    startDate: formatDateToISO(startDate),
    endDate: formatDateToISO(endDate),
  };
}

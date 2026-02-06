'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { MonthlySummary, Expense } from '@/types';
import ExpenseList from './ExpenseList';
import ExpenseListSkeleton from './ExpenseListSkeleton';
import MonthlySummaryCard from './MonthlySummaryCard';
import MonthlySummaryCardSkeleton from './MonthlySummaryCardSkeleton';
import BottomNav from './BottomNav';
import LoadingBar from './LoadingBar';
import { categoryStorage } from '@/lib/utils/categoryStorage';
import { authStorage } from '@/lib/utils/authStorage';
import { dashboardStorage } from '@/lib/utils/dashboardStorage';

export default function Dashboard() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    // 先檢查 localStorage 緩存
    const cached = authStorage.get();
    if (cached?.authenticated) {
      return; // 有緩存且已認證，直接返回
    }

    // 無緩存或未認證，才發送請求
    try {
      const response = await fetch('/api/auth/verify');
      const data = await response.json();

      const isAuthenticated = data.data?.authenticated || false;
      authStorage.set(isAuthenticated);

      if (!isAuthenticated) {
        router.push('/');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      authStorage.set(false);
      router.push('/');
    }
  };

  const loadData = async (isInitialLoad = true) => {
    // 1. 先嘗試從 cache 載入（瞬間顯示）
    if (isInitialLoad) {
      const cached = dashboardStorage.get();
      if (cached) {
        setSummary(cached.summary);
        setExpenses(cached.expenses);
        setLoading(false);
        // 繼續背景更新
      } else {
        setLoading(true);
      }
    }

    setIsRefreshing(true);

    try {
      // 檢查 localStorage 是否已有 categories 緩存
      const cachedCategories = categoryStorage.get();

      if (!cachedCategories) {
        // 只在沒有緩存時才 fetch categories
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();

        if (categoriesData.success) {
          categoryStorage.set(
            categoriesData.data.categories || [],
            categoriesData.data.paymentMethods || [],
            categoriesData.data.projects || [],
            categoriesData.data.labels || [],
            categoriesData.data.defaultProject || '',
            categoriesData.data.defaultCurrency || 'TWD'
          );
        }
      }

      // Load monthly summary
      const summaryResponse = await fetch('/api/expenses/summary');
      const summaryData = await summaryResponse.json();

      let newSummary: MonthlySummary | null = null;
      if (summaryData.success) {
        newSummary = summaryData.data;
        setSummary(newSummary);
      }

      // Load recent expenses
      const expensesResponse = await fetch('/api/expenses?limit=20');
      const expensesData = await expensesResponse.json();

      let newExpenses: Expense[] = [];
      if (expensesData.success) {
        newExpenses = expensesData.data;
        setExpenses(newExpenses);
      }

      // 2. 更新 cache
      dashboardStorage.set(newSummary, newExpenses);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // 清除所有 localStorage 快取
      categoryStorage.clear();
      authStorage.clear();
      dashboardStorage.invalidate();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        dashboardStorage.invalidate();
        loadData(false); // 重新載入資料，使用 refreshing 狀態
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Delete failed, please try again later');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Loading Bar */}
      <LoadingBar loading={loading || isRefreshing} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Expense Tracker
            </h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pb-32">
        {/* Summary Card */}
        <div className="mb-6">
          {loading ? (
            <MonthlySummaryCardSkeleton />
          ) : summary ? (
            <MonthlySummaryCard summary={summary} />
          ) : null}
        </div>

        {/* Expense List */}
        <div className="px-4 sm:px-6 lg:px-8">
          {loading ? (
            <ExpenseListSkeleton />
          ) : (
            <ExpenseList
              expenses={expenses}
              onDelete={handleDeleteExpense}
            />
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

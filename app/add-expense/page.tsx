'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { categoryStorage } from '@/lib/utils/categoryStorage';
import { authStorage } from '@/lib/utils/authStorage';
import { dashboardStorage } from '@/lib/utils/dashboardStorage';
import SuccessModal from '@/components/SuccessModal';

interface CategoryConfig {
  category: string;
  subcategories: string[];
}

// 類別圖標映射
const CATEGORY_ICONS: Record<string, string> = {
  'Food-Dining': '🍽️',
  'Wellness': '🏝️',
  'Alcohol': '🍺',
  'Household': '🏠',
  'Transport': '🚗',
  'Shopping': '🛍️',
  'Housing-Utils': '💡',
  'Travel': '✈️',
  'Other': '🧮',
};

// 子類別圖標映射
const SUBCATEGORY_ICONS: Record<string, string> = {
  'Breakfast': '🥐',
  'Lunch': '🍱',
  'Dinner': '🍽️',
  'Snacks': '🍿',
  'Coffee': '☕',
  'Drinks': '🥤',
  'Ingredients': '🥬',
  'Dining-Out': '🍴',
  'Entertainment': '🎬',
  'Events': '🎉',
  'Outdoor': '🏕️',
  'Others': '📌',
  'Bar': '🍸',
  'C-Store': '🏪',
  'Liquor-Store': '🍷',
  'Cigarettes': '🚬',
  'Daily Supplies': '🧴',
  'Personal Care': '💄',
  'Cleaning': '🧹',
  'Fuel': '⛽',
  'Parking': '🅿️',
  'Public': '🚌',
  'Taxi': '🚕',
  'Rent': '🏘️',
  'Metro': '🚇',
  'Clothing': '👔',
  'Books': '📚',
  'Gear': '🎒',
  'Gifts': '🎁',
  'Utilities': '💡',
  'Internet': '📡',
  'Flights': '🛫',
  'Accommodation': '🏨',
};

const CURRENCIES = ['TWD', 'USD', 'JPY', 'EUR', 'CNY'];

export default function AddExpensePage() {
  const router = useRouter();
  const [showSubcategory, setShowSubcategory] = useState(false);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [defaultProject, setDefaultProject] = useState<string>('');
  const [defaultCurrency, setDefaultCurrency] = useState<string>('TWD');
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    amount: '',
    date: today,
    project: '', // This will be updated by defaultProject in useEffect
    label: '',
    method: '',
    currency: 'TWD',
    note: '',
  });

  useEffect(() => {
    checkAuth();
    loadCategories();
  }, []);

  // Update formData.project when defaultProject is loaded
  useEffect(() => {
    if (defaultProject && formData.project === '') {
      setFormData(prev => ({ ...prev, project: defaultProject }));
    }
  }, [defaultProject, formData.project]);

  // Update formData.currency when defaultCurrency is loaded
  useEffect(() => {
    if (defaultCurrency && formData.currency === 'TWD') { // Only update if still default
      setFormData(prev => ({ ...prev, currency: defaultCurrency }));
    }
  }, [defaultCurrency]);

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

  const loadCategories = async () => {
    try {
      // 優先從 localStorage 讀取
      const stored = categoryStorage.get();

      if (stored) {
        // 有緩存就直接使用，不再發送 API 請求
        setCategories(stored.categories);
        setPaymentMethods(stored.paymentMethods);
        setProjects(stored.projects || []);
        setLabels(stored.labels || []);
        setDefaultProject(stored.defaultProject || '');
        setDefaultCurrency(stored.defaultCurrency || 'TWD');
        setLoading(false);
        return;
      }

      // 只有在 localStorage 完全沒有資料時，才發送 API 請求
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success) {
        const categories = data.data.categories || [];
        const paymentMethods = data.data.paymentMethods || [];
        const projects = data.data.projects || [];
        const labels = data.data.labels || [];
        const defaultProject = data.data.defaultProject || '';
        const defaultCurrency = data.data.defaultCurrency || 'TWD';

        setCategories(categories);
        setPaymentMethods(paymentMethods);
        setProjects(projects);
        setLabels(labels);
        setDefaultProject(defaultProject);
        setDefaultCurrency(defaultCurrency);

        // 存入 localStorage
        categoryStorage.set(categories, paymentMethods, projects, labels, defaultProject, defaultCurrency);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category, subcategory: '' }));
    setShowSubcategory(true);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setFormData(prev => ({ ...prev, subcategory }));
  };

  const handleBackToCategory = () => {
    setShowSubcategory(false);
    setFormData(prev => ({ ...prev, category: '', subcategory: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          category: formData.category,
          subcategory: formData.subcategory,
          amount,
          project: formData.project,
          label: formData.label,
          method: formData.method,
          currency: formData.currency,
          note: formData.note,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
      } else {
        alert(data.error || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Failed to add expense, please try again later');
    }
  };

  const handleViewDashboard = () => {
    router.push('/dashboard');
  };

  const handleAddAnother = () => {
    setShowSuccess(false);
    // 重置表單
    setFormData({
      category: '',
      subcategory: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      project: defaultProject,
      label: '',
      method: '',
      currency: defaultCurrency,
      note: '',
    });
    setShowSubcategory(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const selectedCategory = categories.find(c => c.category === formData.category);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xl text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
            <h1 className="text-lg font-medium text-gray-900">New Entry</h1>
            <button
              onClick={handleSubmit}
              disabled={!formData.category}
              className={`text-xl transition-colors ${formData.category ? 'text-blue-500 hover:text-blue-600' : 'text-gray-200'}`}
            >
              ✓
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 上半部：分類選擇 */}
          <div className="p-0">
            {/* 返回按鈕（子類別時顯示） */}
            {showSubcategory && (
              <button
                type="button"
                onClick={handleBackToCategory}
                className="mb-3 text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm transition-colors"
              >
                <span>←</span>
                <span>Back</span>
              </button>
            )}

            {/* 主類別選擇 */}
            {!showSubcategory && (
              <div className="grid grid-cols-5 gap-2">
                {categories.map((config) => (
                  <button
                    key={config.category}
                    type="button"
                    onClick={() => handleCategorySelect(config.category)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all ${
                      formData.category === config.category
                        ? 'bg-blue-50 ring-2 ring-blue-500'
                        : 'bg-gray-50/50 hover:bg-gray-100 active:scale-95'
                    }`}
                  >
                    <div className="text-3xl mb-0.5">
                      {CATEGORY_ICONS[config.category] || '📦'}
                    </div>
                    <div className="text-[10px] text-gray-600 text-center font-medium leading-tight">
                      {config.category}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 子類別選擇 */}
            {showSubcategory && selectedCategory && (
              <div>
                <div className="mb-2 text-center">
                  <div className="text-3xl mb-0.5">{CATEGORY_ICONS[formData.category] || '📦'}</div>
                  <div className="text-xs font-medium text-gray-500">{formData.category}</div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {selectedCategory.subcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubcategorySelect(sub)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all ${
                        formData.subcategory === sub
                          ? 'bg-blue-50 ring-2 ring-blue-500'
                          : 'bg-gray-50/50 hover:bg-gray-100 active:scale-95'
                      }`}
                    >
                      <div className="text-2xl mb-0.5">
                        {SUBCATEGORY_ICONS[sub] || '📌'}
                      </div>
                      <div className="text-[10px] text-gray-600 text-center font-medium leading-tight">
                        {sub}
                      </div>
                    </button>
                  ))}
                  {/* Other 選項 */}
                  <button
                    type="button"
                    onClick={() => handleSubcategorySelect('')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all ${
                      formData.subcategory === ''
                        ? 'bg-blue-50 ring-2 ring-blue-500'
                        : 'border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95'
                    }`}
                  >
                    <div className="text-2xl mb-0.5">➕</div>
                    <div className="text-[10px] text-gray-500 text-center font-medium">Other</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 下半部：填入資訊 */}
          <div className="p-0 space-y-6">
          {/* 下半部：填入資訊 */}
          <div className="p-0 space-y-6">
            {/* 第一列：日期與金額 */}
            <div className="grid grid-cols-10 gap-6 items-end">
              {/* 日期 (佔 30%) */}
              <div className="col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full h-[48px] px-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-gray-900 outline-none transition-all box-border"
                />
              </div>

              {/* 金額 (佔 70%) */}
              <div className="col-span-7">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Amount *
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-20 h-[48px] px-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 outline-none transition-all box-border"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="flex-1 min-w-0 h-[48px] px-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-lg font-bold text-gray-900 outline-none transition-all box-border"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 專案與付款方式 */}

            {/* 專案與付款方式 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 專案 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Project
                </label>
                <select
                  value={formData.project}
                  onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                  className="w-full h-[48px] px-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 outline-none transition-all box-border"
                >
                  <option value="">Select Project</option>
                  {projects.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
              </div>

              {/* 付款方式 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full h-[48px] px-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 outline-none transition-all box-border"
                >
                  <option value="">Select Method</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 標籤 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Label
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Business, Personal..."
                className="w-full h-[48px] px-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 box-border"
              />
            </div>

            {/* 備註 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Notes
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Additional notes..."
                rows={2}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        </form>
      </main>

      {/* 底部固定送出按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 p-3 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4">
          <button
            onClick={handleSubmit}
            disabled={!formData.category}
            className={`w-full font-medium py-3 rounded-xl transition-all text-sm ${
              formData.category
                ? 'bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Add Expense
          </button>
        </div>
      </div>

      {/* 底部佔位符（避免內容被固定按鈕遮住） */}
      <div className="h-16"></div>

      {/* Success Modal */}
      <SuccessModal
        show={showSuccess}
        onViewDashboard={handleViewDashboard}
        onAddAnother={handleAddAnother}
      />
    </div>
  );
}

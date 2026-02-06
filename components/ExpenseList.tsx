'use client';

import type { Expense } from '@/types';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

// 類別圖標映射 (與新增頁面保持一致)
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

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400 font-medium">
        No expense records found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-4 py-2">
        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
      </div>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <div 
            key={expense.id} 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-4 active:scale-[0.98] transition-all"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
              {CATEGORY_ICONS[expense.category] || '📦'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900 truncate">
                  {expense.subcategory || expense.category}
                </h3>
                <span className="font-bold text-red-600 text-lg ml-2">
                  {expense.currency && expense.currency !== 'TWD' ? `${expense.currency} ` : '$'}
                  {expense.amount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex gap-2 truncate">
                  {expense.project && (
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                      {expense.project}
                    </span>
                  )}
                  <span>{expense.method}</span>
                </div>
                <span className="whitespace-nowrap ml-2">{expense.date}</span>
              </div>

              {expense.note && (
                <p className="mt-2 text-xs text-gray-400 line-clamp-1 italic">
                  "{expense.note}"
                </p>
              )}
            </div>

            {/* Delete Action (Hidden/Internal for better UI, triggered by long press or small button) */}
            <button
              onClick={() => onDelete(expense.id)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              aria-label="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

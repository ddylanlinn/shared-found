'use client';

import type { MonthlySummary } from '@/types';

interface MonthlySummaryCardProps {
  summary: MonthlySummary;
}

export default function MonthlySummaryCard({ summary }: MonthlySummaryCardProps) {
  return (
    <div className="bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">
          {summary.month} Monthly Statistics
        </h2>
      </div>

      <div className="p-6">
        {/* 總支出與預算 */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-1">
            <div>
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-4xl font-bold text-red-600">
                ${summary.total.toLocaleString()}
              </div>
            </div>
            {summary.budget > 0 && (
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase">Monthly Budget</div>
                <div className="text-lg font-semibold text-gray-700">
                  ${summary.budget.toLocaleString()}
                </div>
              </div>
            )}
          </div>
          
          {summary.budget > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Budget Progress</span>
                <span className={summary.total > summary.budget ? 'text-red-500 font-bold' : 'text-gray-500'}>
                  {((summary.total / summary.budget) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    summary.total > summary.budget ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((summary.total / summary.budget) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                 <span className="text-xs text-gray-500">Remaining</span>
                 <span className={`text-xs font-semibold ${summary.budget - summary.total < 0 ? 'text-red-500' : 'text-green-600'}`}>
                   ${(summary.budget - summary.total).toLocaleString()}
                 </span>
              </div>
            </div>
          )}
        </div>

        {/* 類別統計 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Category Statistics
          </h3>

          {summary.categories.length === 0 ? (
            <p className="text-gray-500 text-sm">No expense records for this month</p>
          ) : (
            <div className="space-y-3">
              {summary.categories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {category.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {category.count} items
                      </span>
                      <span className="text-sm font-semibold text-red-600">
                        ${category.total.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 最大支出 */}
        {summary.topExpenses.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 Expenses
            </h3>
            <div className="space-y-2">
              {summary.topExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {expense.label || expense.category}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {expense.date} · {expense.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-600">
                      ${expense.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {expense.method}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

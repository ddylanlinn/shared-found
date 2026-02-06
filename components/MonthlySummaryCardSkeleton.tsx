'use client';

export default function MonthlySummaryCardSkeleton() {
  return (
    <div className="bg-white overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 px-6 py-4">
        <div className="h-6 bg-gray-200/50 rounded w-48"></div>
      </div>

      <div className="p-6">
        {/* 總支出與預算 */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-1">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="text-right">
              <div className="h-3 bg-gray-200 rounded w-20 mb-1 ml-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3"></div>
            <div className="flex justify-between mt-1">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>

        {/* 類別統計 */}
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>

          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* 最大支出 */}
        <div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 bg-gray-200 rounded w-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1 ml-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

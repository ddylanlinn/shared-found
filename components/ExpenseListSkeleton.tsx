'use client';

export default function ExpenseListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="px-4 py-2">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
      </div>

      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-4"
          >
            {/* Icon Circle */}
            <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0"></div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

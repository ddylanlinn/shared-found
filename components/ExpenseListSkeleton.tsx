'use client';

export default function ExpenseListSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </th>
              <th className="px-6 py-3 text-right">
                <div className="h-3 bg-gray-200 rounded w-14 ml-auto"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </th>
              <th className="px-6 py-3 text-right">
                <div className="h-3 bg-gray-200 rounded w-12 ml-auto"></div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-14"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

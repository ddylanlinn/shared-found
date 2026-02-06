'use client';

import { useRouter } from 'next/navigation';

export default function BottomNav() {
  const router = useRouter();

  const handleAddExpense = () => {
    router.push('/add-expense');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-20 px-4 pb-safe z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {/* Wallet Icon (Coming Soon) */}
      <button 
        disabled
        title="Coming Soon"
        className="flex flex-col items-center justify-center text-gray-300 cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
      </button>

      {/* Transactions Icon (Coming Soon) */}
      <button 
        disabled
        title="Coming Soon"
        className="flex flex-col items-center justify-center text-gray-300 cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt-text"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M14 12H8"/><path d="M14 16H8"/></svg>
      </button>

      {/* Large Add Button */}
      <div className="relative -top-8">
        <button
          onClick={handleAddExpense}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-white transition-transform active:scale-95 z-50"
          aria-label="Add Expense"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
      </div>

      {/* Chart Icon (Coming Soon) */}
      <button 
        disabled
        title="Coming Soon"
        className="flex flex-col items-center justify-center text-gray-300 cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-area-chart"><path d="M3 3v18h18"/><path d="M7 12v5"/><path d="M11 9v8"/><path d="M15 13v4"/><path d="M19 7v10"/></svg>
      </button>

      {/* Settings Icon (Coming Soon) */}
      <button 
        disabled
        title="Coming Soon"
        className="flex flex-col items-center justify-center text-gray-300 cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings-2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
      </button>
    </div>
  );
}

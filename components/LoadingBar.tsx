'use client';

import { useEffect, useState } from 'react';

interface LoadingBarProps {
  loading: boolean;
}

export default function LoadingBar({ loading }: LoadingBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (loading) {
      // 立即顯示並展開
      setIsExpanded(true);
    } else {
      // 延遲收回
      const hideTimer = setTimeout(() => {
        setIsExpanded(false);
      }, 300);

      return () => clearTimeout(hideTimer);
    }
  }, [loading]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-blue-50 border-b border-blue-100 overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-12' : 'max-h-0'
      }`}
      style={{
        transform: isExpanded ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <div className="flex items-center justify-center h-12">
        <div className="flex items-center gap-2">
          {/* Loading Spinner */}
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-blue-700">Loading...</span>
        </div>
      </div>
    </div>
  );
}

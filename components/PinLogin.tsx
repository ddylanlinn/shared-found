'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/utils/authStorage';

export default function PinLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (data.success) {
        // 登入成功，設置認證狀態到 localStorage
        authStorage.set(true);
        // Login successful, redirecting to dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error, please try again later');
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (value: string) => {
    // 只允許數字，最多 6 位
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setPin(numericValue);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-4">
        {/* Logo / Title */}
        <div className="text-center mb-12">
          <h1 className="text-base font-medium text-gray-900">
            Expense Tracker
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Input */}
          <div>
            <label htmlFor="pin" className="block text-xs font-medium text-gray-500 mb-1.5">
              PIN
            </label>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={(e) => handlePinInput(e.target.value)}
              placeholder="••••••"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest outline-none transition-all"
              maxLength={6}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className={`w-full font-medium py-3 rounded-xl transition-all text-sm ${
              loading || pin.length < 4
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white shadow-sm'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Forgot PIN? Please contact administrator
          </p>
        </div>
      </div>
    </div>
  );
}

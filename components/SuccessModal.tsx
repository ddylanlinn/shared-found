'use client';

interface SuccessModalProps {
  show: boolean;
  onViewDashboard: () => void;
  onAddAnother: () => void;
}

export default function SuccessModal({ show, onViewDashboard, onAddAnother }: SuccessModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-slideUp">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-scaleIn">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Expense Added!
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Your expense has been successfully recorded.
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onViewDashboard}
            className="w-full bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-medium py-3 rounded-xl transition-all shadow-sm"
          >
            View Dashboard
          </button>
          <button
            onClick={onAddAnother}
            className="w-full bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 font-medium py-3 rounded-xl transition-all"
          >
            Add Another Expense
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

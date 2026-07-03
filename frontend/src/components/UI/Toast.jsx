import { useToast } from '../../context/ToastContext';
import { useEffect } from 'react';

const icons = {
  success: '✓',
  error: '✗',
  info: 'ℹ',
  warning: '!',
};

const styles = {
  success: 'bg-green-500/10 border-green-500/30 text-green-400',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-slideInRight flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-2xl pointer-events-auto min-w-[280px] max-w-sm ${styles[t.type]}`}
        >
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-current opacity-80 text-sm font-bold">
            {icons[t.type]}
          </div>
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition"
          >
            ×
          </button>
          
          {/* Progress bar */}
          <div 
            className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg" 
            style={{ animation: `progressCountdown ${t.duration}ms linear forwards` }} 
          />
        </div>
      ))}
    </div>
  );
}

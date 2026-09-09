import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start space-x-3 transition-all duration-300 animate-in slide-in-from-bottom-4 ${
            toast.type === 'success'
              ? 'bg-[#1A1A1A] text-white border-[#D4AF37]/50'
              : toast.type === 'info'
              ? 'bg-[#1E293B] text-white border-blue-500/40'
              : 'bg-rose-900 text-white border-rose-500/50'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
          {toast.type !== 'success' && toast.type !== 'info' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}

          <div className="flex-1 text-xs text-white">
            {toast.title && <h5 className="font-bold text-sm mb-0.5 text-white">{toast.title}</h5>}
            <p className="opacity-95 text-white/90 text-xs leading-relaxed">
              {toast.message || toast.title || 'Notification'}
            </p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/60 hover:text-white p-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

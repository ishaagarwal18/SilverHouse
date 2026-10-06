import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { adminFetch } from '../api/adminApi';

const AdminUIContext = createContext(null);
const THEME_KEY = 'silverhouse_admin_theme';

function readTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || localStorage.getItem('theme') || 'light';
  } catch {
    return 'light';
  }
}

/**
 * Shell-wide UI state for the Admin Studio: light/dark theme, toast notifications
 * and the pending custom-order count shown in the navigation.
 */
export function AdminUIProvider({ children }) {
  const [theme, setTheme] = useState(readTheme);
  const [toasts, setToasts] = useState([]);
  const [pendingCustomOrders, setPendingCustomOrders] = useState(0);
  const toastId = useRef(0);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);

  const dismissToast = useCallback(id => {
    setToasts(list => list.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, isError = false) => {
    const id = ++toastId.current;
    setToasts(list => [...list.slice(-2), { id, message, isError }]);
    setTimeout(() => dismissToast(id), isError ? 5000 : 3500);
  }, [dismissToast]);

  const refreshPendingCustomOrders = useCallback(async () => {
    try {
      const { data } = await adminFetch('/admin/custom-orders');
      if (data.success && Array.isArray(data.orders)) {
        setPendingCustomOrders(data.orders.filter(o => String(o.confirm).toLowerCase() === 'processing').length);
      }
    } catch (err) {
      console.warn('Custom orders badge note:', err);
    }
  }, []);


  return (
    <AdminUIContext.Provider value={{ theme, toggleTheme, showToast, pendingCustomOrders, refreshPendingCustomOrders }}>
      <div className="admin-root min-h-screen bg-ad-bg text-ad-text antialiased" data-theme={theme}>
        {children}
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </div>
    </AdminUIContext.Provider>
  );
}

function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed z-100 bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 flex flex-col gap-2 sm:max-w-sm pointer-events-none" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          role={t.isError ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[13px] font-semibold shadow-xl bg-ad-surface text-ad-text ${t.isError ? 'border-ad-danger/50' : 'border-ad-success/50'}`}
        >
          {t.isError
            ? <CircleAlert className="w-4.5 h-4.5 shrink-0 text-ad-danger" />
            : <CircleCheck className="w-4.5 h-4.5 shrink-0 text-ad-success" />}
          <span className="flex-1 wrap-break-word">{t.message}</span>
          <button type="button" onClick={() => onDismiss(t.id)} className="text-ad-muted hover:text-ad-text cursor-pointer" aria-label="Dismiss notification">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function useAdminUI() {
  const ctx = useContext(AdminUIContext);
  if (!ctx) throw new Error('useAdminUI must be used inside AdminUIProvider');
  return ctx;
}

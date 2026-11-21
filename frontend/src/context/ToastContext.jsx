import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

/**
 * ToastContext.jsx - Accessible global toast notification system with Undo support.
 * UI/UX Principle: Visibility of System Status & User Control (Nielsen Heuristics #1 & #3)
 * Equipped with aria-live="polite" and interactive action buttons (e.g., Undo cancellation).
 */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000, action = null }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, type, title, message, duration, action };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container (WCAG aria-live for assistive technology) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100',
            error: 'bg-red-50 dark:bg-red-950/80 border-red-500 text-red-900 dark:text-red-100',
            warning: 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 text-amber-900 dark:text-amber-100',
            info: 'bg-brand-50 dark:bg-brand-950/80 border-brand-500 text-brand-900 dark:text-brand-100'
          }[toast.type] || 'bg-white border-slate-300 text-slate-800';

          const IconComponent = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertTriangle,
            info: Info
          }[toast.type] || Info;

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-200 transform translate-y-0 ${typeStyles}`}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div className="flex-1 text-sm">
                {toast.title && <div className="font-semibold text-slate-900 dark:text-white mb-0.5">{toast.title}</div>}
                <div className="text-slate-700 dark:text-slate-200">{toast.message}</div>
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action.onClick?.();
                      removeToast(toast.id);
                    }}
                    className="mt-2 text-xs font-bold underline hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1 py-0.5"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 -mr-1 -mt-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

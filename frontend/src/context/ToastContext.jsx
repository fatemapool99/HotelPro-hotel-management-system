import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              item.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40'
                : item.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-500/40'
                : 'bg-hotel-navy/95 text-hotel-cream border-hotel-gold/40'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
              {item.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {item.type === 'info' && <Info className="w-5 h-5 text-hotel-gold shrink-0" />}
              <span className="text-sm font-medium leading-relaxed">{item.message}</span>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="ml-3 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

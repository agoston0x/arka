'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: number; text: string };

type ToastContextType = {
  pushToast: (text: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((text: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, text }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-20 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4">
        <div className="space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="rounded-xl bg-black/85 px-3 py-2 text-sm text-white shadow-lg transition"
            >
              {toast.text}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

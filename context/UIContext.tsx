"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ToastType } from "@/types";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface UIContextValue {
  showToast: (message: string, type?: ToastType) => void;
  hydrated: boolean;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  return (
    <UIContext.Provider value={{ showToast, hydrated }}>
      {children}
      <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2 print:hidden">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`anim-toast rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-panel ${
              t.type === "error" ? "bg-red-600" : "bg-cocoa-800"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </UIContext.Provider>
  );
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI harus dipakai di dalam UIProvider");
  return ctx;
}
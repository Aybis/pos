"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// UIContext — state antarmuka global (toast & hidrasi localStorage).
// Dipakai lewat useContext sesuai kebutuhan lintas halaman.
const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Hindari mismatch SSR vs localStorage: render data store setelah mount.
  useEffect(() => setHydrated(true), []);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  return (
    <UIContext.Provider value={{ showToast, hydrated }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2 print:hidden">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-panel ${
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

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI harus dipakai di dalam UIProvider");
  return ctx;
}

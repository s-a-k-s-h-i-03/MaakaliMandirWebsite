import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const value = useMemo(() => ({
    showToast(toast) {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, tone: "info", ...toast }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 3000);
    },
  }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl ${
              toast.tone === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-amber-200 bg-white text-slate-700"
            }`}
            role="status"
          >
            <p className="font-semibold">{toast.title}</p>
            {toast.description ? <p className="mt-1 text-sm">{toast.description}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

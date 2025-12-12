import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = "info") => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const toast = { id, message, type };
    setToasts((s) => [...s, toast]);

    window.setTimeout(() => remove(id), 2600);
    return id;
  }, [remove]);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toastStack" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div className="toastDot" />
            <div className="toastMsg">{t.message}</div>
            <button className="toastX" onClick={() => remove(t.id)} aria-label="Fechar">×</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

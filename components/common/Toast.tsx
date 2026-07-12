"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "info" | "warning" | "error";
interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastContextValue {
  push: (kind: ToastKind, title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 className="text-success" size={18} />,
  info: <Info className="text-info" size={18} />,
  warning: <TriangleAlert className="text-warn" size={18} />,
  error: <XCircle className="text-danger" size={18} />,
};

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, title: string, description?: string) => {
      const id = ++idCounter;
      setItems((prev) => [...prev, { id, kind, title, description }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="surface-card pointer-events-auto animate-slide-up flex items-start gap-2.5 rounded-xl p-3.5 shadow-popover"
          >
            <div className="mt-0.5">{ICONS[t.kind]}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-muted">{t.description}</p>}
            </div>
            <button onClick={() => remove(t.id)} className="text-muted hover:text-current" aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="absolute inset-0 bg-black/50 animate-slide-up" onClick={onClose} />
      <div className={cn("surface-card relative z-10 w-full max-w-lg rounded-2xl shadow-popover animate-slide-up", className)}>
        <div className="flex items-start justify-between border-b border-charcoal-100 px-5 py-4 dark:border-charcoal-800">
          <div>
            <h2 id="dialog-title" className="text-base font-semibold">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          <button onClick={onClose} className="text-muted hover:text-current" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin p-5">{children}</div>
      </div>
    </div>
  );
}

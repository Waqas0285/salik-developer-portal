import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function KpiCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "success" | "danger" | "warn" | "info";
}) {
  const toneClass: Record<string, string> = {
    neutral: "bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-200",
    success: "bg-success-light text-success",
    danger: "bg-danger-light text-danger",
    warn: "bg-warn-light text-warn",
    info: "bg-info-light text-info",
  };
  const positive = (delta ?? 0) >= 0;

  return (
    <div className="surface-card rounded-xl p-4 shadow-card transition hover:shadow-popover">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        {Icon && (
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", toneClass[tone])}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {delta !== undefined && (
        <div className={cn("mt-1.5 flex items-center gap-1 text-xs font-medium", positive ? "text-success" : "text-danger")}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          <span>{Math.abs(delta).toFixed(1)}%</span>
          {deltaLabel && <span className="text-muted">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}

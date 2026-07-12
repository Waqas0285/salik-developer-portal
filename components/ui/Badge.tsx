import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

export function Badge({ status, label, className }: { status?: string; label?: string; className?: string }) {
  const colorClass = status ? STATUS_COLORS[status] ?? "text-info bg-info-light" : "text-info bg-info-light";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold", colorClass, className)}>
      {label ?? status}
    </span>
  );
}

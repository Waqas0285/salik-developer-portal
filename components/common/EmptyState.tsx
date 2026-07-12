import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-charcoal-200 py-14 text-center dark:border-charcoal-700">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-charcoal-100 text-muted dark:bg-charcoal-800">
        <Icon size={20} />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

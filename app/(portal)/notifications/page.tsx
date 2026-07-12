"use client";
import { useMemo, useState } from "react";
import { CheckCheck, Trash2, Settings2, Info, TriangleAlert, XCircle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/common/EmptyState";
import { Dialog } from "@/components/ui/Dialog";
import { useNotifications } from "@/components/common/NotificationsProvider";
import { relativeTime, cn } from "@/lib/utils";
import type { NotificationType } from "@/types";

const ICONS = { info: Info, warning: TriangleAlert, critical: XCircle, success: CheckCircle2 };
const ICON_COLOR = { info: "text-info", warning: "text-warn", critical: "text-danger", success: "text-success" };

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllRead, remove } = useNotifications();
  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const types = Array.from(new Set(notifications.map((n) => n.type)));

  const rows = useMemo(() => (filter === "all" ? notifications : notifications.filter((n) => n.type === filter)), [notifications, filter]);

  return (
    <div>
      <PageHeader
        title="Notification Center"
        description="Platform events, subscription updates, and alerts."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={markAllRead}><CheckCheck size={13} /> Mark all read</Button>
            <Button variant="outline" size="sm" onClick={() => setPrefsOpen(true)}><Settings2 size={13} /> Preferences</Button>
          </>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-medium text-muted">Filter by type</span>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as NotificationType | "all")} className="max-w-xs">
          <option value="all">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Info} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {rows.map((n) => {
            const Icon = ICONS[n.severity];
            return (
              <div key={n.id} className={cn("surface-card flex items-start gap-3 rounded-xl p-3.5 shadow-card", !n.read && "border-l-4 border-l-salik-500")}>
                <Icon size={18} className={cn("mt-0.5 shrink-0", ICON_COLOR[n.severity])} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-salik-500" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted">{n.type} · {relativeTime(n.timestamp)}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {!n.read && <button onClick={() => markAsRead(n.id)} className="text-muted hover:text-salik-600" aria-label="Mark as read"><CheckCheck size={15} /></button>}
                  <button onClick={() => remove(n.id)} className="text-muted hover:text-danger" aria-label="Delete"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={prefsOpen} onClose={() => setPrefsOpen(false)} title="Notification preferences" description="Demo preferences — not persisted to a real backend.">
        <div className="space-y-2">
          {["Email notifications", "Push notifications", "SLA warnings", "Incident alerts", "Subscription updates", "Webhook failure alerts"].map((p) => (
            <label key={p} className="flex items-center justify-between rounded-lg border border-charcoal-100 px-3 py-2 text-xs dark:border-charcoal-800">
              {p}
              <input type="checkbox" defaultChecked />
            </label>
          ))}
        </div>
      </Dialog>
    </div>
  );
}

"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, ListChecks, Check } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useAppData } from "@/components/common/AppDataProvider";
import { useToast } from "@/components/common/Toast";
import { formatDate } from "@/lib/utils";
import type { Subscription, SubscriptionStatus } from "@/types";

const STATUSES: SubscriptionStatus[] = ["Draft", "Submitted", "Under Review", "Additional Information Required", "Approved", "Rejected", "Suspended", "Expired", "Cancelled"];

export default function SubscriptionsPage() {
  const { subscriptions, updateSubscriptionStatus, toggleChecklistItem } = useAppData();
  const { push } = useToast();
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");
  const [selected, setSelected] = useState<Subscription | null>(null);

  const rows = useMemo(
    () => (statusFilter === "all" ? subscriptions : subscriptions.filter((s) => s.status === statusFilter)),
    [subscriptions, statusFilter]
  );

  const columns: Column<Subscription>[] = [
    { key: "api", header: "API / Product", render: (r) => <span className="font-medium">{r.apiOrProductName}</span>, sortValue: (r) => r.apiOrProductName },
    { key: "app", header: "Application", render: (r) => r.applicationName, sortValue: (r) => r.applicationName },
    { key: "partner", header: "Partner", render: (r) => r.partnerName, sortValue: (r) => r.partnerName },
    { key: "env", header: "Environment", render: (r) => <Badge label={r.environment} className="bg-info-light text-info" /> },
    { key: "plan", header: "Plan", render: (r) => r.plan },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} />, sortValue: (r) => r.status },
    { key: "updated", header: "Updated", render: (r) => formatDate(r.updatedAt), sortValue: (r) => r.updatedAt },
  ];

  return (
    <div>
      <PageHeader
        title="API Subscriptions"
        description="Track subscription requests from submission through production approval."
        actions={<Link href="/marketplace"><Button size="sm"><Plus size={14} /> New subscription request</Button></Link>}
      />

      <div className="surface-card mb-4 flex items-center gap-3 rounded-xl p-3.5 shadow-card">
        <span className="text-xs font-medium text-muted">Status</span>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SubscriptionStatus | "all")} className="max-w-xs">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={ListChecks} title="No subscriptions match this filter" />
      ) : (
        <div className="surface-card rounded-xl p-2 shadow-card">
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} onRowClick={setSelected} pageSize={12} />
        </div>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} title={selected?.apiOrProductName ?? ""} description={selected ? `${selected.applicationName} · ${selected.partnerName}` : ""}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge status={selected.status} />
              <span className="text-xs text-muted">{selected.environment} · {selected.plan} plan</span>
            </div>

            {selected.environment === "production" && (
              <div>
                <p className="mb-2 text-xs font-semibold">Production approval checklist</p>
                <div className="space-y-1.5">
                  {selected.approvalChecklist.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        toggleChecklistItem(selected.id, item.key);
                        setSelected((prev) => prev && { ...prev, approvalChecklist: prev.approvalChecklist.map((c) => c.key === item.key ? { ...c, done: !c.done } : c) });
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg border border-charcoal-100 px-3 py-2 text-left text-xs transition hover:bg-charcoal-50 dark:border-charcoal-800 dark:hover:bg-charcoal-800/50"
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${item.done ? "border-salik-600 bg-salik-600 text-white" : "border-charcoal-300"}`}>
                        {item.done && <Check size={11} />}
                      </span>
                      <span className={item.done ? "text-current" : "text-muted"}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 border-t border-charcoal-100 pt-3 dark:border-charcoal-800">
              {selected.status !== "Approved" && (
                <Button size="sm" onClick={() => { updateSubscriptionStatus(selected.id, "Approved"); push("success", "Subscription approved", ""); setSelected(null); }}>Approve</Button>
              )}
              {selected.status !== "Rejected" && (
                <Button size="sm" variant="outline" onClick={() => { updateSubscriptionStatus(selected.id, "Rejected"); setSelected(null); }}>Reject</Button>
              )}
              {selected.status !== "Suspended" && (
                <Button size="sm" variant="outline" onClick={() => { updateSubscriptionStatus(selected.id, "Suspended"); setSelected(null); }}>Suspend</Button>
              )}
              {selected.status !== "Cancelled" && (
                <Button size="sm" variant="danger" onClick={() => { updateSubscriptionStatus(selected.id, "Cancelled"); setSelected(null); }}>Cancel</Button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

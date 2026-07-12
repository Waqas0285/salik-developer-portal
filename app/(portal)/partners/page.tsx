"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { useAppData } from "@/components/common/AppDataProvider";
import { formatAED, formatPercent } from "@/lib/utils";
import type { Partner, PartnerCategory } from "@/types";

export default function PartnersPage() {
  const { partners } = useAppData();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PartnerCategory | "all">("all");
  const categories = Array.from(new Set(partners.map((p) => p.category)));

  const rows = partners.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (query.trim() && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const columns: Column<Partner>[] = [
    { key: "name", header: "Partner", render: (r) => (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: r.color }}>{r.logoInitial}</span>
        <span className="font-medium">{r.name}</span>
      </div>
    ), sortValue: (r) => r.name },
    { key: "category", header: "Category", render: (r) => r.category },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} />, sortValue: (r) => r.status },
    { key: "integration", header: "Integration", render: (r) => r.integrationStatus },
    { key: "apps", header: "Apps", render: (r) => String(r.applicationsCount), sortValue: (r) => r.applicationsCount },
    { key: "usage", header: "Monthly Calls", render: (r) => r.monthlyApiCalls.toLocaleString(), sortValue: (r) => r.monthlyApiCalls },
    { key: "revenue", header: "Revenue", render: (r) => formatAED(r.revenueAed, { compact: true }), sortValue: (r) => r.revenueAed },
    { key: "sla", header: "SLA", render: (r) => formatPercent(r.slaCompliance), sortValue: (r) => r.slaCompliance },
    { key: "plan", header: "Plan", render: (r) => r.commercialPlan },
  ];

  return (
    <div>
      <PageHeader title="Partner Management" description="Manage partner onboarding, integration status, commercial plans, and performance." />

      <div className="surface-card mb-4 flex flex-col gap-3 rounded-xl p-3.5 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search partners…" className="pl-9" />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value as PartnerCategory | "all")} className="sm:w-56">
          <option value="all">All categories</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <div className="surface-card rounded-xl p-2 shadow-card">
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={12} onRowClick={(r) => router.push(`/partners/${r.id}`)} />
      </div>
    </div>
  );
}

"use client";
import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { SimpleBarChart } from "@/components/charts/Charts";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { ERRORS } from "@/data/errors";
import { formatDate, formatPercent } from "@/lib/utils";
import { AlertTriangle, Users2, Clock, TrendingDown } from "lucide-react";
import type { ErrorRecord } from "@/types";

type GroupBy = "apiName" | "partnerName" | "category" | "environment" | "httpStatus" | "endpoint";

const GROUP_LABELS: Record<GroupBy, string> = {
  apiName: "API", partnerName: "Partner", category: "Error Category", environment: "Environment", httpStatus: "HTTP Status", endpoint: "Endpoint",
};

export default function ErrorAnalyticsPage() {
  const [groupBy, setGroupBy] = useState<GroupBy>("category");

  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    ERRORS.forEach((e) => {
      const key = String(e[groupBy]);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [groupBy]);

  const totalErrors = ERRORS.length;
  const impactedPartners = new Set(ERRORS.map((e) => e.partnerName)).size;
  const impactedCustomers = ERRORS.reduce((s, e) => s + e.impactedCustomers, 0);
  const avgMttr = Math.round(ERRORS.reduce((s, e) => s + e.mttrMinutes, 0) / ERRORS.length);
  const errorRate = 2.4; // representative platform error rate over the trailing window

  const recommendations = Array.from(new Set(ERRORS.map((e) => e.rootCause))).slice(0, 6);

  const columns: Column<ErrorRecord>[] = [
    { key: "time", header: "Time", render: (r) => formatDate(r.timestamp, true), sortValue: (r) => r.timestamp },
    { key: "api", header: "API", render: (r) => r.apiName },
    { key: "endpoint", header: "Endpoint", render: (r) => <span className="font-mono text-[11px]">{r.endpoint}</span> },
    { key: "partner", header: "Partner", render: (r) => r.partnerName },
    { key: "env", header: "Env", render: (r) => r.environment },
    { key: "status", header: "HTTP", render: (r) => <Badge label={String(r.httpStatus)} className={r.httpStatus < 500 ? "bg-warn-light text-warn" : "bg-danger-light text-danger"} /> },
    { key: "category", header: "Category", render: (r) => r.category },
    { key: "impacted", header: "Impacted", render: (r) => String(r.impactedCustomers), sortValue: (r) => r.impactedCustomers },
    { key: "mttr", header: "MTTR", render: (r) => `${r.mttrMinutes}m`, sortValue: (r) => r.mttrMinutes },
  ];

  return (
    <div>
      <PageHeader title="Error and Failure Analytics" description="Root-cause analysis across every API, partner, and environment." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Total Errors (sample)" value={String(totalErrors)} icon={AlertTriangle} tone="danger" />
        <KpiCard label="Platform Error Rate" value={formatPercent(errorRate)} icon={TrendingDown} tone="warn" />
        <KpiCard label="Impacted Partners" value={String(impactedPartners)} icon={Users2} tone="warn" />
        <KpiCard label="Impacted Customers" value={String(impactedCustomers)} icon={Users2} tone="danger" />
        <KpiCard label="Mean Time to Resolution" value={`${avgMttr} min`} icon={Clock} tone="neutral" />
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={15} className="text-salik-600" />
            <p className="text-sm font-semibold">AI-style recommendations</p>
          </div>
          <div className="space-y-2">
            {recommendations.map((r, i) => (
              <div key={i} className="rounded-lg border border-charcoal-100 px-3 py-2 text-xs dark:border-charcoal-800">{r}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-medium text-muted">Group by</span>
        <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} className="max-w-xs">
          {Object.entries(GROUP_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </Select>
      </div>
      <ChartCard title={`Errors by ${GROUP_LABELS[groupBy]}`} height={320}>
        <SimpleBarChart data={grouped} xKey="name" series={[{ key: "count", color: "#dc2626", name: "Errors" }]} />
      </ChartCard>

      <div className="surface-card mt-5 rounded-xl p-2 shadow-card">
        <DataTable columns={columns} rows={ERRORS} rowKey={(r) => r.id} pageSize={12} />
      </div>
    </div>
  );
}

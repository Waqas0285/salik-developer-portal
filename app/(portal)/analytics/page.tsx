"use client";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { SimpleAreaChart, SimpleBarChart, SimpleLineChart, SimplePieChart } from "@/components/charts/Charts";
import { Select } from "@/components/ui/Input";
import { useAppData } from "@/components/common/AppDataProvider";
import { filterTransactions, computeKpis, type AnalyticsFilters } from "@/services/mockAnalyticsService";
import { PARTNERS } from "@/data/partners";
import { APIS } from "@/data/apis";
import { API_PRODUCTS } from "@/data/apiProducts";
import { MONTHLY_ANALYTICS } from "@/data/analytics";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Activity, CheckCircle2, XCircle, Gauge, Clock, Zap, ZapOff, Server, Users2, AlertTriangle } from "lucide-react";
import type { Region, TransactionCategory } from "@/types";

const REGIONS: Region[] = ["Dubai", "Abu Dhabi", "Sharjah", "Northern Emirates"];
const RESPONSE_CODES = [200, 201, 400, 401, 402, 403, 409, 429, 500, 504];

export default function AnalyticsPage() {
  const { applications } = useAppData();
  const [filters, setFilters] = useState<AnalyticsFilters & { responseCode?: number | "all" }>({
    fromDays: 90, partnerId: "all", apiId: "all", environment: "all", region: "all", category: "all", status: "all", responseCode: "all",
  });

  const rows = useMemo(() => {
    let r = filterTransactions(filters);
    if (filters.responseCode && filters.responseCode !== "all") r = r.filter((t) => t.responseCode === filters.responseCode);
    return r;
  }, [filters]);

  const kpis = useMemo(() => computeKpis(rows), [rows]);
  const days = filters.fromDays ?? 90;
  const totalTps = Math.round((rows.length / (days * 86400)) * 100000) / 100; // scaled illustrative TPS from the sample
  const failedTps = Math.round((kpis.failed / (days * 86400)) * 100000) / 100;

  const callsOverTime = MONTHLY_ANALYTICS.map((m) => ({ month: m.month, calls: m.totalCalls }));
  const successFail = [{ name: "Filtered", Success: kpis.success, Failed: kpis.failed, Timeout: kpis.timeout }];
  const usageByPartner = PARTNERS.map((p) => ({ name: p.name, calls: rows.filter((r) => r.partnerId === p.id).length })).filter((r) => r.calls > 0).sort((a, b) => b.calls - a.calls).slice(0, 8);
  const usageByApi = APIS.map((a) => ({ name: a.name.replace(" API", ""), calls: rows.filter((r) => r.apiId === a.id).length })).filter((r) => r.calls > 0).sort((a, b) => b.calls - a.calls).slice(0, 8);
  const usageByProduct = API_PRODUCTS.map((p) => ({
    name: p.name.replace("Salik ", ""),
    calls: rows.filter((r) => p.includedApiIds.includes(r.apiId) || p.includedApiIds.length === 0).length,
  })).sort((a, b) => b.calls - a.calls).slice(0, 8);
  const statusDist = RESPONSE_CODES.map((c) => ({ name: String(c), value: rows.filter((r) => r.responseCode === c).length })).filter((r) => r.value > 0);
  const latencyTrend = MONTHLY_ANALYTICS.map((m) => ({ month: m.month, P50: m.p50, P95: m.p95, P99: m.p99 }));
  const tpsTrend = MONTHLY_ANALYTICS.map((m) => ({ month: m.month, TPS: m.peakTps }));
  const failedTpsTrend = MONTHLY_ANALYTICS.map((m) => ({ month: m.month, "Failed TPS": m.failedTps }));
  const geoDist = REGIONS.map((r) => ({ name: r, value: rows.filter((t) => t.region === r).length }));
  const envComparison = [
    { name: "Sandbox", calls: rows.filter((r) => r.environment === "sandbox").length },
    { name: "Production", calls: rows.filter((r) => r.environment === "production").length },
  ];

  const activeApplications = applications.filter((a) => a.status === "Active").length;
  const activeConsumers = new Set(rows.map((r) => r.partnerId)).size;
  const timeoutRate = kpis.total ? Math.round((kpis.timeout / kpis.total) * 1000) / 10 : 0;
  const retryRate = kpis.total ? Math.round((rows.filter((r) => r.retryCount > 0).length / kpis.total) * 1000) / 10 : 0;
  const rateLimitEvents = rows.filter((r) => r.responseCode === 429).length;
  const avgResponseSize = 480; // representative payload size in bytes for this sample of mostly small JSON responses
  const quotaConsumption = Math.min(100, Math.round((kpis.total / 200) * 1000) / 10);

  return (
    <div>
      <PageHeader title="API Analytics" description="Deep-dive into API usage, performance, and reliability across every filter dimension." />

      <div className="surface-card mb-5 grid grid-cols-2 gap-3 rounded-xl p-4 shadow-card sm:grid-cols-3 lg:grid-cols-7">
        <F label="Date range">
          <Select value={filters.fromDays} onChange={(e) => setFilters((f) => ({ ...f, fromDays: Number(e.target.value) }))}>
            <option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={180}>180 days</option>
          </Select>
        </F>
        <F label="Partner">
          <Select value={filters.partnerId} onChange={(e) => setFilters((f) => ({ ...f, partnerId: e.target.value }))}>
            <option value="all">All</option>{PARTNERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </F>
        <F label="API">
          <Select value={filters.apiId} onChange={(e) => setFilters((f) => ({ ...f, apiId: e.target.value }))}>
            <option value="all">All</option>{APIS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </F>
        <F label="Environment">
          <Select value={filters.environment} onChange={(e) => setFilters((f) => ({ ...f, environment: e.target.value as AnalyticsFilters["environment"] }))}>
            <option value="all">All</option><option value="sandbox">Sandbox</option><option value="production">Production</option>
          </Select>
        </F>
        <F label="Response code">
          <Select value={filters.responseCode} onChange={(e) => setFilters((f) => ({ ...f, responseCode: e.target.value === "all" ? "all" : Number(e.target.value) }))}>
            <option value="all">All</option>{RESPONSE_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </F>
        <F label="Region">
          <Select value={filters.region} onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value as AnalyticsFilters["region"] }))}>
            <option value="all">All</option>{REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </F>
        <F label="Use case">
          <Select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as TransactionCategory | "all" }))}>
            <option value="all">All</option>
            {["Toll", "Parking", "Fuel", "EV Charging", "Car Wash", "Wallet", "Refund", "Subscription", "Vehicle Services"].map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </F>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total API Calls (sample)" value={formatNumber(kpis.total)} icon={Activity} tone="info" />
        <KpiCard label="Successful Calls" value={formatNumber(kpis.success)} icon={CheckCircle2} tone="success" />
        <KpiCard label="Failed Calls" value={formatNumber(kpis.failed)} icon={XCircle} tone="danger" />
        <KpiCard label="Success Rate" value={formatPercent(kpis.successRate)} icon={Gauge} tone="success" />
        <KpiCard label="Error Rate" value={formatPercent(kpis.errorRate)} icon={AlertTriangle} tone="danger" />
        <KpiCard label="Total TPS (illustrative)" value={totalTps.toFixed(2)} icon={Zap} tone="info" />
        <KpiCard label="Failed TPS (illustrative)" value={failedTps.toFixed(2)} icon={ZapOff} tone="danger" />
        <KpiCard label="Peak TPS (platform)" value={String(MONTHLY_ANALYTICS[MONTHLY_ANALYTICS.length - 1].peakTps)} icon={Zap} tone="info" />
        <KpiCard label="Avg Latency" value={`${kpis.avgLatency} ms`} icon={Clock} tone="neutral" />
        <KpiCard label="P50 Latency" value={`${kpis.p50} ms`} icon={Clock} tone="neutral" />
        <KpiCard label="P95 Latency" value={`${kpis.p95} ms`} icon={Clock} tone="warn" />
        <KpiCard label="P99 Latency" value={`${kpis.p99} ms`} icon={Clock} tone="danger" />
        <KpiCard label="Avg Response Size" value={`${avgResponseSize} B`} icon={Server} tone="neutral" />
        <KpiCard label="Timeout Rate" value={formatPercent(timeoutRate)} icon={AlertTriangle} tone="warn" />
        <KpiCard label="Retry Rate" value={formatPercent(retryRate)} icon={AlertTriangle} tone="warn" />
        <KpiCard label="Quota Consumption" value={formatPercent(quotaConsumption)} icon={Gauge} tone="info" />
        <KpiCard label="Rate-limit Events" value={String(rateLimitEvents)} icon={ZapOff} tone="warn" />
        <KpiCard label="Active Applications" value={String(activeApplications)} icon={Server} tone="success" />
        <KpiCard label="Active API Consumers" value={String(activeConsumers)} icon={Users2} tone="info" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Calls Over Time" subtitle="Platform-wide monthly volume"><SimpleAreaChart data={callsOverTime} xKey="month" series={[{ key: "calls", color: "#26966b" }]} /></ChartCard>
        <ChartCard title="Success vs Failure" subtitle="Filtered sample"><SimpleBarChart data={successFail} xKey="name" stacked series={[{ key: "Success", color: "#16a34a" }, { key: "Failed", color: "#dc2626" }, { key: "Timeout", color: "#d97706" }]} /></ChartCard>
        <ChartCard title="Usage by API" subtitle="Filtered sample"><SimpleBarChart data={usageByApi} xKey="name" series={[{ key: "calls", color: "#2563eb" }]} /></ChartCard>
        <ChartCard title="Usage by Partner" subtitle="Filtered sample"><SimpleBarChart data={usageByPartner} xKey="name" series={[{ key: "calls", color: "#7c3aed" }]} /></ChartCard>
        <ChartCard title="Usage by API Product" subtitle="Filtered sample"><SimpleBarChart data={usageByProduct} xKey="name" series={[{ key: "calls", color: "#0891b2" }]} /></ChartCard>
        <ChartCard title="HTTP Status Code Distribution"><SimplePieChart data={statusDist} /></ChartCard>
        <ChartCard title="Latency Trend" subtitle="P50 / P95 / P99, platform-wide"><SimpleLineChart data={latencyTrend} xKey="month" series={[{ key: "P50", color: "#16a34a" }, { key: "P95", color: "#d97706" }, { key: "P99", color: "#dc2626" }]} /></ChartCard>
        <ChartCard title="TPS Trend" subtitle="Platform-wide peak TPS"><SimpleLineChart data={tpsTrend} xKey="month" series={[{ key: "TPS", color: "#26966b" }]} /></ChartCard>
        <ChartCard title="Failed TPS Trend"><SimpleLineChart data={failedTpsTrend} xKey="month" series={[{ key: "Failed TPS", color: "#dc2626" }]} /></ChartCard>
        <ChartCard title="Geographic Distribution" subtitle="Filtered sample by Emirate"><SimplePieChart data={geoDist} /></ChartCard>
        <ChartCard title="Environment Comparison" subtitle="Filtered sample"><SimpleBarChart data={envComparison} xKey="name" series={[{ key: "calls", color: "#d97706" }]} /></ChartCard>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</label>{children}</div>;
}

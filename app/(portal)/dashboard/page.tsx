"use client";
import { useMemo, useState } from "react";
import {
  Users, Building2, FlaskConical, Boxes, PackageCheck, Activity, CheckCircle2, XCircle,
  Gauge, Zap, ZapOff, Wallet, ShieldCheck, AlertOctagon, TrendingUp, Star, LifeBuoy, Clock,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { SimpleAreaChart, SimpleBarChart, SimpleLineChart, SimplePieChart } from "@/components/charts/Charts";
import { Select } from "@/components/ui/Input";
import { PARTNERS } from "@/data/partners";
import { APIS } from "@/data/apis";
import { API_PRODUCTS } from "@/data/apiProducts";
import { SUPPORT_TICKETS } from "@/data/supportTickets";
import { SERVICE_HEALTH, MONITORING_SNAPSHOTS } from "@/data/monitoring";
import { MONTHLY_ANALYTICS, CURRENT_MONTH, PREVIOUS_MONTH, pctChange, FORECAST_NEXT_MONTH_CALLS } from "@/data/analytics";
import {
  REVENUE_BY_MONTH, REVENUE_BY_PARTNER, REVENUE_BY_DOMAIN, REVENUE_BY_API_PRODUCT,
  CURRENT_MONTH_REVENUE, MOM_REVENUE_CHANGE, YOY_MONTH_REVENUE_CHANGE, FORECAST_NEXT_MONTH_REVENUE,
  FORECAST_NEXT_QUARTER_REVENUE, FORECAST_NEXT_HALF_YEAR_REVENUE, FORECAST_NEXT_FULL_YEAR_REVENUE,
  TRAILING_QUARTER_REVENUE, TRAILING_HALF_YEAR_REVENUE, TRAILING_FULL_YEAR_REVENUE,
} from "@/data/revenue";
import { filterTransactions, computeKpis, type AnalyticsFilters } from "@/services/mockAnalyticsService";
import { formatAED, formatNumber, formatPercent } from "@/lib/utils";
import type { TransactionCategory } from "@/types";

const REGIONS = ["Dubai", "Abu Dhabi", "Sharjah", "Northern Emirates"];
const DOMAINS = Array.from(new Set(APIS.map((a) => a.category)));

export default function DashboardPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({ fromDays: 30, partnerId: "all", apiId: "all", environment: "all", status: "all", category: "all", region: "all" });

  const filteredTxns = useMemo(() => filterTransactions(filters), [filters]);
  const filteredKpis = useMemo(() => computeKpis(filteredTxns), [filteredTxns]);

  const activeProdPartners = PARTNERS.filter((p) => p.status === "Active" && p.environment === "production").length;
  const sandboxPartners = PARTNERS.filter((p) => p.environment === "sandbox").length;
  const avgSuccessRate = Math.round((APIS.reduce((s, a) => s + a.successRate, 0) / APIS.length) * 10) / 10;
  const avgLatency = Math.round(APIS.reduce((s, a) => s + a.avgLatencyMs, 0) / APIS.length);
  const avgSla = Math.round((PARTNERS.reduce((s, p) => s + p.slaCompliance, 0) / PARTNERS.length) * 10) / 10;
  const activeIncidents = SERVICE_HEALTH.filter((s) => s.status !== "Healthy").length;
  const totalSubscribers = APIS.reduce((s, a) => s + a.subscribers, 0);
  const adoptionRate = Math.round((totalSubscribers / (PARTNERS.length * APIS.length)) * 1000) / 10;
  const resolvedTickets = SUPPORT_TICKETS.filter((t) => t.status === "Resolved" || t.status === "Closed").length;
  const ticketResolutionRate = Math.round((resolvedTickets / SUPPORT_TICKETS.length) * 1000) / 10;
  const avgOnboardingDays = 18;

  const trafficTrend = MONTHLY_ANALYTICS.map((m) => ({ month: m.month, calls: m.totalCalls }));
  const successFailTrend = MONTHLY_ANALYTICS.map((m) => ({ month: m.month, Successful: m.successfulCalls, Failed: m.failedCalls }));
  const latencyTrend = MONTHLY_ANALYTICS.map((m) => ({ month: m.month, P50: m.p50, P95: m.p95, P99: m.p99 }));
  const availabilityTrend = MONITORING_SNAPSHOTS.map((s) => ({ date: s.date.slice(5), availability: s.availability }));
  const usageByDomain = DOMAINS.map((d) => ({ name: d, value: APIS.filter((a) => a.category === d).reduce((s, a) => s + a.subscribers, 0) }));
  const topPartners = REVENUE_BY_PARTNER.slice(0, 6).map((p) => ({ name: p.name, Revenue: p.revenueAed }));
  const topApis = [...APIS].sort((a, b) => b.subscribers - a.subscribers).slice(0, 6).map((a) => ({ name: a.name.replace(" API", ""), Subscribers: a.subscribers }));
  const onboardingFunnel = (["Prospect", "Onboarding", "Active", "Suspended", "Rejected"] as const).map((s) => ({
    name: s, count: PARTNERS.filter((p) => p.status === s).length,
  })).filter((r) => r.count > 0 || ["Onboarding", "Active"].includes(r.name));
  const revenueByDomainChart = REVENUE_BY_DOMAIN.slice(0, 8).map((d) => ({ name: d.name, Revenue: d.revenueAed }));
  const revenueByProductChart = REVENUE_BY_API_PRODUCT.slice(0, 6).map((d) => ({ name: d.name.replace("Salik ", ""), Revenue: d.revenueAed }));

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        description="Platform-wide KPIs across partners, APIs, transactions, and revenue. All figures are computed from mock demo data."
      />

      {/* Filters */}
      <div className="surface-card mb-5 grid grid-cols-2 gap-3 rounded-xl p-4 shadow-card sm:grid-cols-3 lg:grid-cols-8">
        <FilterField label="Date range">
          <Select value={filters.fromDays} onChange={(e) => setFilters((f) => ({ ...f, fromDays: Number(e.target.value) }))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
          </Select>
        </FilterField>
        <FilterField label="API">
          <Select value={filters.apiId} onChange={(e) => setFilters((f) => ({ ...f, apiId: e.target.value }))}>
            <option value="all">All APIs</option>
            {APIS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </FilterField>
        <FilterField label="Partner">
          <Select value={filters.partnerId} onChange={(e) => setFilters((f) => ({ ...f, partnerId: e.target.value }))}>
            <option value="all">All partners</option>
            {PARTNERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </FilterField>
        <FilterField label="Domain">
          <Select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as TransactionCategory | "all" }))}>
            <option value="all">All domains</option>
            {["Toll", "Parking", "Fuel", "EV Charging", "Car Wash", "Wallet", "Refund", "Subscription", "Vehicle Services"].map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </FilterField>
        <FilterField label="Environment">
          <Select value={filters.environment} onChange={(e) => setFilters((f) => ({ ...f, environment: e.target.value as "sandbox" | "production" | "all" }))}>
            <option value="all">All environments</option>
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
          </Select>
        </FilterField>
        <FilterField label="Region">
          <Select value={filters.region} onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value as AnalyticsFilters["region"] }))}>
            <option value="all">All regions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </FilterField>
        <FilterField label="Status">
          <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as AnalyticsFilters["status"] }))}>
            <option value="all">All statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Timeout">Timeout</option>
            <option value="Pending">Pending</option>
          </Select>
        </FilterField>
      </div>

      {/* KPI grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Registered Partners" value={String(PARTNERS.length)} icon={Building2} tone="info" />
        <KpiCard label="Active Production Partners" value={String(activeProdPartners)} icon={CheckCircle2} tone="success" />
        <KpiCard label="Sandbox Partners" value={String(sandboxPartners)} icon={FlaskConical} tone="warn" />
        <KpiCard label="APIs Published" value={String(APIS.length)} icon={Boxes} tone="info" />
        <KpiCard label="Active API Products" value={String(API_PRODUCTS.length)} icon={PackageCheck} tone="neutral" />
        <KpiCard label="Total API Calls (month)" value={formatNumber(CURRENT_MONTH.totalCalls, true)} delta={pctChange(CURRENT_MONTH.totalCalls, PREVIOUS_MONTH.totalCalls)} deltaLabel="vs last month" icon={Activity} tone="info" />
        <KpiCard label="Successful Transactions" value={formatNumber(CURRENT_MONTH.successfulCalls, true)} icon={CheckCircle2} tone="success" />
        <KpiCard label="Failed Transactions" value={formatNumber(CURRENT_MONTH.failedCalls, true)} icon={XCircle} tone="danger" />
        <KpiCard label="API Success Rate" value={formatPercent(avgSuccessRate)} icon={Gauge} tone="success" />
        <KpiCard label="Avg API Latency" value={`${avgLatency} ms`} icon={Clock} tone="neutral" />
        <KpiCard label="Peak TPS" value={String(CURRENT_MONTH.peakTps)} icon={Zap} tone="info" />
        <KpiCard label="Failed TPS" value={String(CURRENT_MONTH.failedTps)} icon={ZapOff} tone="danger" />
        <KpiCard label="Revenue Generated (month)" value={formatAED(CURRENT_MONTH_REVENUE, { compact: true })} delta={MOM_REVENUE_CHANGE} deltaLabel="MoM" icon={Wallet} tone="success" />
        <KpiCard label="Avg Partner Onboarding Time" value={`${avgOnboardingDays} days`} icon={Users} tone="neutral" />
        <KpiCard label="SLA Compliance" value={formatPercent(avgSla)} icon={ShieldCheck} tone="success" />
        <KpiCard label="Active Incidents" value={String(activeIncidents)} icon={AlertOctagon} tone={activeIncidents > 0 ? "danger" : "success"} />
        <KpiCard label="API Adoption Rate" value={formatPercent(adoptionRate)} icon={TrendingUp} tone="info" />
        <KpiCard label="Developer Satisfaction" value="4.6 / 5" icon={Star} tone="success" />
        <KpiCard label="Support Ticket Resolution Rate" value={formatPercent(ticketResolutionRate)} icon={LifeBuoy} tone="success" />
        <KpiCard label="Sandbox → Production Conversion" value={formatPercent(Math.round((activeProdPartners / PARTNERS.length) * 1000) / 10)} icon={TrendingUp} tone="info" />
      </div>

      {/* Period comparisons */}
      <div className="surface-card mb-6 rounded-xl p-4 shadow-card">
        <p className="mb-3 text-sm font-semibold">Period Comparisons — Revenue</p>
        <p className="mb-3 text-xs text-muted">
          Quarter, half-year, and full-year figures are illustrative — this demo dataset covers a trailing 12-month
          window rather than true multi-year history, so &quot;previous year&quot; uses the earliest available comparable
          period as a stand-in.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ComparisonCard label="This month vs last month" current={CURRENT_MONTH_REVENUE} previous={CURRENT_MONTH_REVENUE - Math.round(CURRENT_MONTH_REVENUE * (MOM_REVENUE_CHANGE / 100))} change={MOM_REVENUE_CHANGE} />
          <ComparisonCard label="This month vs same month last year" current={CURRENT_MONTH_REVENUE} previous={REVENUE_BY_MONTH[0].revenueAed} change={YOY_MONTH_REVENUE_CHANGE} />
          <ComparisonCard label="This quarter (trailing 3mo) forecast next quarter" current={TRAILING_QUARTER_REVENUE} previous={FORECAST_NEXT_QUARTER_REVENUE} change={pctChange(FORECAST_NEXT_QUARTER_REVENUE, TRAILING_QUARTER_REVENUE)} flip />
          <ComparisonCard label="Full-year forecast vs trailing full year" current={FORECAST_NEXT_FULL_YEAR_REVENUE} previous={TRAILING_FULL_YEAR_REVENUE} change={pctChange(FORECAST_NEXT_FULL_YEAR_REVENUE, TRAILING_FULL_YEAR_REVENUE)} flip />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ComparisonCard label="Forecast — next month revenue" current={FORECAST_NEXT_MONTH_REVENUE} previous={CURRENT_MONTH_REVENUE} change={pctChange(FORECAST_NEXT_MONTH_REVENUE, CURRENT_MONTH_REVENUE)} flip />
          <ComparisonCard label="Forecast — next half-year revenue" current={FORECAST_NEXT_HALF_YEAR_REVENUE} previous={TRAILING_HALF_YEAR_REVENUE} change={pctChange(FORECAST_NEXT_HALF_YEAR_REVENUE, TRAILING_HALF_YEAR_REVENUE)} flip />
          <ComparisonCard label="Forecast — next month API calls" current={FORECAST_NEXT_MONTH_CALLS} previous={CURRENT_MONTH.totalCalls} change={pctChange(FORECAST_NEXT_MONTH_CALLS, CURRENT_MONTH.totalCalls)} flip isCount />
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="API Traffic Trend" subtitle="Total API calls per month (12 months)">
          <SimpleAreaChart data={trafficTrend} xKey="month" series={[{ key: "calls", color: "#26966b", name: "API Calls" }]} />
        </ChartCard>
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue, AED">
          <SimpleLineChart data={REVENUE_BY_MONTH} xKey="month" series={[{ key: "revenueAed", color: "#2563eb", name: "Revenue (AED)" }]} />
        </ChartCard>
        <ChartCard title="Successful vs Failed Transactions" subtitle="Monthly volume">
          <SimpleBarChart data={successFailTrend} xKey="month" stacked series={[{ key: "Successful", color: "#16a34a" }, { key: "Failed", color: "#dc2626" }]} />
        </ChartCard>
        <ChartCard title="API Usage by Domain" subtitle="Active subscribers per mobility domain">
          <SimplePieChart data={usageByDomain} />
        </ChartCard>
        <ChartCard title="Revenue by Mobility Service" subtitle="By API domain">
          <SimpleBarChart data={revenueByDomainChart} xKey="name" series={[{ key: "Revenue", color: "#26966b" }]} />
        </ChartCard>
        <ChartCard title="Revenue by API Product" subtitle="Top 6 commercial products">
          <SimpleBarChart data={revenueByProductChart} xKey="name" series={[{ key: "Revenue", color: "#7c3aed" }]} />
        </ChartCard>
        <ChartCard title="Top Partners by Revenue">
          <SimpleBarChart data={topPartners} xKey="name" series={[{ key: "Revenue", color: "#0891b2" }]} />
        </ChartCard>
        <ChartCard title="Top APIs by Usage" subtitle="By active subscribers">
          <SimpleBarChart data={topApis} xKey="name" series={[{ key: "Subscribers", color: "#d97706" }]} />
        </ChartCard>
        <ChartCard title="Partner Onboarding Funnel">
          <SimpleBarChart data={onboardingFunnel} xKey="name" series={[{ key: "count", color: "#26966b", name: "Partners" }]} />
        </ChartCard>
        <ChartCard title="API Latency Trend" subtitle="P50 / P95 / P99, ms">
          <SimpleLineChart data={latencyTrend} xKey="month" series={[{ key: "P50", color: "#16a34a" }, { key: "P95", color: "#d97706" }, { key: "P99", color: "#dc2626" }]} />
        </ChartCard>
        <ChartCard title="API Availability Trend" subtitle="Last 30 days">
          <SimpleAreaChart data={availabilityTrend} xKey="date" series={[{ key: "availability", color: "#2563eb", name: "Availability %" }]} />
        </ChartCard>
        <ChartCard title="Filtered Transaction Insights" subtitle={`${filteredKpis.total} sample transactions match current filters`}>
          <SimpleBarChart
            data={[{ name: "Filtered", Success: filteredKpis.success, Failed: filteredKpis.failed, Timeout: filteredKpis.timeout }]}
            xKey="name"
            series={[{ key: "Success", color: "#16a34a" }, { key: "Failed", color: "#dc2626" }, { key: "Timeout", color: "#d97706" }]}
          />
        </ChartCard>
      </div>
    </div>
  );
}

function ComparisonCard({
  label, current, previous, change, flip, isCount,
}: { label: string; current: number; previous: number; change: number; flip?: boolean; isCount?: boolean }) {
  const positive = flip ? change >= 0 : change >= 0;
  return (
    <div className="rounded-lg border border-charcoal-100 p-3 dark:border-charcoal-800">
      <p className="text-[11px] font-medium text-muted">{label}</p>
      <p className="mt-1 text-base font-bold">{isCount ? formatNumber(current, true) : formatAED(current, { compact: true })}</p>
      <p className={`mt-0.5 text-[11px] font-medium ${positive ? "text-success" : "text-danger"}`}>
        {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs {isCount ? formatNumber(previous, true) : formatAED(previous, { compact: true })}
      </p>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</label>
      {children}
    </div>
  );
}

"use client";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { SimpleBarChart, SimpleLineChart, SimplePieChart } from "@/components/charts/Charts";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { APIS } from "@/data/apis";
import { PARTNERS } from "@/data/partners";
import {
  REVENUE_BY_MONTH, REVENUE_BY_PARTNER, REVENUE_BY_DOMAIN, REVENUE_BY_API_PRODUCT,
  SUBSCRIPTION_REVENUE_AED, TRANSACTION_FEE_REVENUE_AED, CURRENT_MONTH_REVENUE, PREVIOUS_MONTH_REVENUE,
  MOM_REVENUE_CHANGE, YOY_MONTH_REVENUE_CHANGE, SAME_MONTH_LAST_YEAR_REVENUE,
  FORECAST_NEXT_MONTH_REVENUE, FORECAST_NEXT_QUARTER_REVENUE, FORECAST_NEXT_HALF_YEAR_REVENUE, FORECAST_NEXT_FULL_YEAR_REVENUE,
  TRAILING_QUARTER_REVENUE, TRAILING_HALF_YEAR_REVENUE, TRAILING_FULL_YEAR_REVENUE,
} from "@/data/revenue";
import { pctChange } from "@/data/analytics";
import { formatAED, formatPercent } from "@/lib/utils";
import { Wallet, TrendingUp, Users2, Receipt } from "lucide-react";

export default function RevenuePage() {
  const revenueByApi = [...APIS]
    .map((a) => ({ name: a.name.replace(" API", ""), Revenue: a.subscribers * 4200 }))
    .sort((a, b) => b.Revenue - a.Revenue)
    .slice(0, 8);
  const totalRevenue = REVENUE_BY_MONTH.reduce((s, m) => s + m.revenueAed, 0);
  const arpp = Math.round(totalRevenue / PARTNERS.length);
  const growth = pctChange(REVENUE_BY_MONTH[REVENUE_BY_MONTH.length - 1].revenueAed, REVENUE_BY_MONTH[0].revenueAed);

  return (
    <div>
      <PageHeader title="Revenue and Commercials" description="Platform commercial performance across partners, API products, and mobility domains." />
      <DisclaimerBanner className="mb-4" />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Total Revenue (12mo)" value={formatAED(totalRevenue, { compact: true })} icon={Wallet} tone="success" />
        <KpiCard label="Revenue Growth (12mo)" value={formatPercent(growth)} icon={TrendingUp} tone="success" />
        <KpiCard label="Subscription Revenue" value={formatAED(SUBSCRIPTION_REVENUE_AED, { compact: true })} icon={Receipt} tone="info" />
        <KpiCard label="Transaction-fee Revenue" value={formatAED(TRANSACTION_FEE_REVENUE_AED, { compact: true })} icon={Receipt} tone="info" />
        <KpiCard label="Avg Revenue per Partner" value={formatAED(arpp, { compact: true })} icon={Users2} tone="neutral" />
        <KpiCard label="This Month" value={formatAED(CURRENT_MONTH_REVENUE, { compact: true })} delta={MOM_REVENUE_CHANGE} deltaLabel="vs last month" icon={Wallet} tone="success" />
        <KpiCard label="Same Month Last Year*" value={formatAED(SAME_MONTH_LAST_YEAR_REVENUE, { compact: true })} delta={YOY_MONTH_REVENUE_CHANGE} deltaLabel="YoY*" icon={Wallet} tone="info" />
        <KpiCard label="Forecast — Next Month" value={formatAED(FORECAST_NEXT_MONTH_REVENUE, { compact: true })} icon={TrendingUp} tone="info" />
      </div>

      <p className="mb-4 text-[11px] text-muted">* &quot;Same month/quarter/half/year last year&quot; figures use the earliest point in this demo&apos;s trailing 12-month dataset as a stand-in for true prior-year data.</p>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PeriodCard label="Next quarter forecast" value={FORECAST_NEXT_QUARTER_REVENUE} compareLabel="trailing quarter" compareValue={TRAILING_QUARTER_REVENUE} />
        <PeriodCard label="Next half-year forecast" value={FORECAST_NEXT_HALF_YEAR_REVENUE} compareLabel="trailing half-year" compareValue={TRAILING_HALF_YEAR_REVENUE} />
        <PeriodCard label="Next full-year forecast" value={FORECAST_NEXT_FULL_YEAR_REVENUE} compareLabel="trailing full year" compareValue={TRAILING_FULL_YEAR_REVENUE} />
        <PeriodCard label="Previous month" value={PREVIOUS_MONTH_REVENUE} compareLabel="vs this month" compareValue={CURRENT_MONTH_REVENUE} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle="Monthly, AED"><SimpleLineChart data={REVENUE_BY_MONTH} xKey="month" series={[{ key: "revenueAed", color: "#26966b", name: "Revenue" }]} /></ChartCard>
        <ChartCard title="Revenue by Partner"><SimpleBarChart data={REVENUE_BY_PARTNER.slice(0, 8).map((p) => ({ name: p.name, Revenue: p.revenueAed }))} xKey="name" series={[{ key: "Revenue", color: "#2563eb" }]} /></ChartCard>
        <ChartCard title="Revenue by API"><SimpleBarChart data={revenueByApi} xKey="name" series={[{ key: "Revenue", color: "#7c3aed" }]} /></ChartCard>
        <ChartCard title="Revenue by API Product"><SimpleBarChart data={REVENUE_BY_API_PRODUCT.slice(0, 8).map((p) => ({ name: p.name.replace("Salik ", ""), Revenue: p.revenueAed }))} xKey="name" series={[{ key: "Revenue", color: "#0891b2" }]} /></ChartCard>
        <ChartCard title="Revenue by Mobility Domain"><SimplePieChart data={REVENUE_BY_DOMAIN.map((d) => ({ name: d.name, value: d.revenueAed }))} /></ChartCard>
        <ChartCard title="Subscription vs Transaction-fee Revenue"><SimplePieChart data={[{ name: "Subscription", value: SUBSCRIPTION_REVENUE_AED }, { name: "Transaction fees", value: TRANSACTION_FEE_REVENUE_AED }]} /></ChartCard>
      </div>
    </div>
  );
}

function PeriodCard({ label, value, compareLabel, compareValue }: { label: string; value: number; compareLabel: string; compareValue: number }) {
  const change = pctChange(value, compareValue);
  return (
    <div className="surface-card rounded-xl p-4 shadow-card">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1.5 text-lg font-bold">{formatAED(value, { compact: true })}</p>
      <p className={`mt-0.5 text-[11px] font-medium ${change >= 0 ? "text-success" : "text-danger"}`}>{change >= 0 ? "+" : ""}{change.toFixed(1)}% vs {compareLabel} ({formatAED(compareValue, { compact: true })})</p>
    </div>
  );
}

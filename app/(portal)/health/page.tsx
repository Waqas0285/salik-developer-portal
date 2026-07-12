"use client";
import { useEffect, useState } from "react";
import { RefreshCw, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChartCard } from "@/components/charts/ChartCard";
import { SimpleAreaChart, SimpleBarChart } from "@/components/charts/Charts";
import { SERVICE_HEALTH, MONITORING_SNAPSHOTS } from "@/data/monitoring";
import { formatDate } from "@/lib/utils";
import type { ServiceHealth } from "@/types";

export default function HealthPage() {
  const [services, setServices] = useState<ServiceHealth[]>(SERVICE_HEALTH);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          avgResponseMs: Math.max(40, Math.round(s.avgResponseMs + (Math.random() - 0.5) * 20)),
          tps: Math.max(1, Math.round(s.tps + (Math.random() - 0.5) * 6)),
          failedTps: Math.max(0, Math.round((s.failedTps + (Math.random() - 0.5) * 1) * 10) / 10),
        }))
      );
      setLastRefresh(new Date());
      setTick((t) => t + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const availabilityTrend = MONITORING_SNAPSHOTS.map((s) => ({ date: s.date.slice(5), availability: s.availability }));
  const volumeTrend = MONITORING_SNAPSHOTS.map((s) => ({ date: s.date.slice(5), requests: s.requestVolume }));
  const activeIncidents = services.filter((s) => s.status !== "Healthy").length;

  return (
    <div>
      <PageHeader
        title="API Health & Monitoring"
        description="Live-simulated platform health — metrics auto-refresh every 5 seconds."
        actions={
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <RefreshCw size={12} className="animate-spin" style={{ animationDuration: "3s" }} /> Updated {formatDate(lastRefresh.toISOString(), true)}
          </span>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active Incidents" value={String(activeIncidents)} tone={activeIncidents > 0 ? "danger" : "success"} />
        <StatCard label="Services Monitored" value={String(services.length)} tone="info" />
        <StatCard label="Avg Availability (30d)" value={`${(MONITORING_SNAPSHOTS.reduce((s, m) => s + m.availability, 0) / MONITORING_SNAPSHOTS.length).toFixed(2)}%`} tone="success" />
        <StatCard label="Refresh cycle" value={`${tick} ticks`} tone="neutral" />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id}>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{s.name}</p>
                <Badge status={s.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-[11px] text-muted">
                <span>Availability</span><span className="text-right font-medium text-current">{s.availability}%</span>
                <span>Avg response</span><span className="text-right font-medium text-current">{s.avgResponseMs} ms</span>
                <span>TPS</span><span className="text-right font-medium text-current">{s.tps}</span>
                <span>Failed TPS</span><span className="text-right font-medium text-current">{s.failedTps}</span>
                <span>Error rate</span><span className="text-right font-medium text-current">{s.errorRate}%</span>
                <span>Last deployment</span><span className="text-right font-medium text-current">{formatDate(s.lastDeployment)}</span>
              </div>
              {s.dependsOn.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1 border-t border-charcoal-100 pt-2 text-[10px] text-muted dark:border-charcoal-800">
                  <span>Depends on:</span>
                  {s.dependsOn.map((d) => (
                    <span key={d} className="flex items-center gap-0.5 rounded-full bg-charcoal-100 px-2 py-0.5 dark:bg-charcoal-800"><ArrowRight size={9} />{d}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="API Availability Trend" subtitle="Last 30 days"><SimpleAreaChart data={availabilityTrend} xKey="date" series={[{ key: "availability", color: "#26966b", name: "Availability %" }]} /></ChartCard>
        <ChartCard title="Request Volume" subtitle="Last 30 days"><SimpleBarChart data={volumeTrend} xKey="date" series={[{ key: "requests", color: "#2563eb" }]} /></ChartCard>
      </div>

      <Card className="mt-5">
        <CardHeader><CardTitle>Service dependency map</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg border border-charcoal-200 px-2.5 py-1 font-medium dark:border-charcoal-700">{s.name}</span>
              {s.dependsOn.map((d) => (
                <span key={d} className="flex items-center gap-1 text-muted"><ArrowRight size={12} /> {d}</span>
              ))}
              {s.dependsOn.length === 0 && <span className="text-muted">No upstream dependencies</span>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "success" | "danger" | "info" | "neutral" }) {
  const toneClass = { success: "text-success", danger: "text-danger", info: "text-info", neutral: "text-current" }[tone];
  return (
    <div className="surface-card rounded-xl p-4 shadow-card">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1.5 text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

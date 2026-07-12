"use client";
import { Tabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { APIS } from "@/data/apis";
import { PARTNERS } from "@/data/partners";
import { mulberry32, formatAED } from "@/lib/utils";
import type { ApiDefinition, Partner } from "@/types";

const rnd = mulberry32(4141);

interface SlaRow {
  name: string;
  availabilityTarget: number;
  availabilityActual: number;
  responseTimeTargetMs: number;
  responseTimeActualMs: number;
  errorRateTarget: number;
  errorRateActual: number;
  maxTps: number;
  actualPeakTps: number;
  downtimeMinutes: number;
  compliant: boolean;
  creditsAed: number;
}

function apiToSla(api: ApiDefinition): SlaRow {
  const availabilityTarget = 99.9;
  const availabilityActual = Math.round(api.successRate * 100) / 100;
  const compliant = availabilityActual >= availabilityTarget - 0.05;
  const downtimeMinutes = Math.round((1 - availabilityActual / 100) * 43800 * 10) / 10;
  return {
    name: api.name, availabilityTarget, availabilityActual,
    responseTimeTargetMs: api.responseTimeTargetMs, responseTimeActualMs: api.avgLatencyMs,
    errorRateTarget: 1.0, errorRateActual: Math.round((100 - api.successRate) * 100) / 100,
    maxTps: api.peakTps, actualPeakTps: Math.round(api.peakTps * (0.8 + rnd() * 0.35)),
    downtimeMinutes, compliant, creditsAed: compliant ? 0 : Math.round(500 + rnd() * 4500),
  };
}

function partnerToSla(p: Partner): SlaRow {
  const availabilityTarget = 99.9;
  const availabilityActual = p.slaCompliance;
  const compliant = availabilityActual >= availabilityTarget - 0.1;
  const downtimeMinutes = Math.round((1 - availabilityActual / 100) * 43800 * 10) / 10;
  return {
    name: p.name, availabilityTarget, availabilityActual,
    responseTimeTargetMs: 300, responseTimeActualMs: Math.round(150 + rnd() * 200),
    errorRateTarget: 1.5, errorRateActual: Math.round((100 - availabilityActual) * 100) / 100,
    maxTps: 100, actualPeakTps: Math.round(40 + rnd() * 80),
    downtimeMinutes, compliant, creditsAed: compliant ? 0 : Math.round(1000 + rnd() * 8000),
  };
}

const columns: Column<SlaRow>[] = [
  { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
  { key: "avail", header: "Availability (target / actual)", render: (r) => `${r.availabilityTarget}% / ${r.availabilityActual}%`, sortValue: (r) => r.availabilityActual },
  { key: "resp", header: "Response time (target / actual)", render: (r) => `${r.responseTimeTargetMs}ms / ${r.responseTimeActualMs}ms` },
  { key: "err", header: "Error rate (target / actual)", render: (r) => `${r.errorRateTarget}% / ${r.errorRateActual}%` },
  { key: "tps", header: "Max TPS (target / actual)", render: (r) => `${r.maxTps} / ${r.actualPeakTps}` },
  { key: "downtime", header: "Monthly downtime", render: (r) => `${r.downtimeMinutes} min`, sortValue: (r) => r.downtimeMinutes },
  { key: "compliance", header: "SLA status", render: (r) => <Badge label={r.compliant ? "Compliant" : "Breach"} status={r.compliant ? "Active" : "Failed"} /> },
  { key: "credits", header: "Service credits", render: (r) => (r.creditsAed > 0 ? formatAED(r.creditsAed) : "—") },
];

export default function SlaPage() {
  const apiRows = APIS.map(apiToSla);
  const partnerRows = PARTNERS.map(partnerToSla);
  const breaches = apiRows.filter((r) => !r.compliant).length + partnerRows.filter((r) => !r.compliant).length;

  return (
    <div>
      <PageHeader title="SLA Management" description="Availability, latency, error-rate, and TPS commitments tracked per API and per partner." />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SlaStat label="APIs Tracked" value={String(apiRows.length)} />
        <SlaStat label="Partners Tracked" value={String(partnerRows.length)} />
        <SlaStat label="Active Breaches" value={String(breaches)} tone={breaches > 0 ? "danger" : "success"} />
        <SlaStat label="Avg Compliance" value={`${(apiRows.reduce((s, r) => s + r.availabilityActual, 0) / apiRows.length).toFixed(2)}%`} tone="success" />
      </div>

      <Tabs
        defaultTab="apis"
        tabs={[
          { key: "apis", label: "By API", content: <div className="surface-card rounded-xl p-2 shadow-card"><DataTable columns={columns} rows={apiRows} rowKey={(r) => r.name} pageSize={12} /></div> },
          { key: "partners", label: "By Partner", content: <div className="surface-card rounded-xl p-2 shadow-card"><DataTable columns={columns} rows={partnerRows} rowKey={(r) => r.name} pageSize={12} /></div> },
        ]}
      />
    </div>
  );
}

function SlaStat({ label, value, tone }: { label: string; value: string; tone?: "danger" | "success" }) {
  return (
    <div className="surface-card rounded-xl p-4 shadow-card">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1.5 text-xl font-bold ${tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : ""}`}>{value}</p>
    </div>
  );
}

import type { MonitoringSnapshot, ServiceHealth } from "@/types";
import { mulberry32 } from "@/lib/utils";

const rnd = mulberry32(3131);
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const MONITORING_SNAPSHOTS: MonitoringSnapshot[] = Array.from({ length: 30 }, (_, i) => {
  const day = 29 - i;
  const incidentDay = day === 24 || day === 9;
  return {
    date: daysAgo(day).slice(0, 10),
    availability: Math.round((incidentDay ? 98.4 + rnd() * 0.8 : 99.7 + rnd() * 0.29) * 100) / 100,
    uptimeMinutes: incidentDay ? 1418 : 1440,
    avgResponseMs: Math.round((incidentDay ? 340 : 140) + rnd() * 60),
    requestVolume: Math.round(180000 + rnd() * 90000),
    tps: Math.round(40 + rnd() * 60),
    failedTps: Math.round((incidentDay ? 6 : 1) + rnd() * 3),
    errorRate: Math.round(((incidentDay ? 3.2 : 0.6) + rnd() * 0.8) * 100) / 100,
    timeoutRate: Math.round(((incidentDay ? 1.4 : 0.2) + rnd() * 0.3) * 100) / 100,
    incidents: incidentDay ? 1 : 0,
  };
});

const SERVICES: { name: string; dependsOn: string[]; degraded?: boolean }[] = [
  { name: "API Gateway", dependsOn: [] },
  { name: "Identity Provider", dependsOn: [] },
  { name: "Salik Wallet", dependsOn: ["Ledger Service"] },
  { name: "Parking Provider Connector", dependsOn: ["API Gateway"], degraded: true },
  { name: "Payment Engine", dependsOn: ["Salik Wallet", "Ledger Service"] },
  { name: "Notification Service", dependsOn: ["Event Broker"] },
  { name: "Event Broker", dependsOn: [] },
  { name: "Data Platform", dependsOn: ["Event Broker"] },
  { name: "Partner Endpoint Relay", dependsOn: ["API Gateway"] },
  { name: "Ledger Service", dependsOn: [] },
];

export const SERVICE_HEALTH: ServiceHealth[] = SERVICES.map((s, i) => ({
  id: `svc_${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: s.name,
  status: s.degraded ? "Degraded" : i === 3 ? "Degraded" : "Healthy",
  availability: Math.round((s.degraded ? 98.2 : 99.85 + rnd() * 0.14) * 100) / 100,
  avgResponseMs: Math.round((s.degraded ? 420 : 90) + rnd() * 80),
  tps: Math.round(10 + rnd() * 60),
  failedTps: Math.round((s.degraded ? 4 : 0.3) + rnd() * 1.2),
  errorRate: Math.round(((s.degraded ? 2.8 : 0.3) + rnd() * 0.5) * 100) / 100,
  lastDeployment: daysAgo(Math.floor(rnd() * 12)),
  dependsOn: s.dependsOn,
}));

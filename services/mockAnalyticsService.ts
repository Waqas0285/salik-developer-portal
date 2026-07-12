import { TRANSACTIONS } from "@/data/transactions";
import type { Environment, Region, Transaction } from "@/types";

export interface AnalyticsFilters {
  partnerId?: string;
  apiId?: string;
  environment?: Environment | "all";
  status?: Transaction["status"] | "all";
  category?: Transaction["category"] | "all";
  region?: Region | "all";
  fromDays?: number; // lookback window
}

export function filterTransactions(filters: AnalyticsFilters): Transaction[] {
  const cutoff = filters.fromDays ? Date.now() - filters.fromDays * 86400000 : 0;
  return TRANSACTIONS.filter((t) => {
    if (filters.partnerId && filters.partnerId !== "all" && t.partnerId !== filters.partnerId) return false;
    if (filters.apiId && filters.apiId !== "all" && t.apiId !== filters.apiId) return false;
    if (filters.environment && filters.environment !== "all" && t.environment !== filters.environment) return false;
    if (filters.status && filters.status !== "all" && t.status !== filters.status) return false;
    if (filters.category && filters.category !== "all" && t.category !== filters.category) return false;
    if (filters.region && filters.region !== "all" && t.region !== filters.region) return false;
    if (cutoff && new Date(t.timestamp).getTime() < cutoff) return false;
    return true;
  });
}

export function computeKpis(rows: Transaction[]) {
  const total = rows.length;
  const success = rows.filter((r) => r.status === "Success").length;
  const failed = rows.filter((r) => r.status === "Failed").length;
  const timeout = rows.filter((r) => r.status === "Timeout").length;
  const avgLatency = total ? Math.round(rows.reduce((s, r) => s + r.latencyMs, 0) / total) : 0;
  const sorted = [...rows].sort((a, b) => a.latencyMs - b.latencyMs);
  const pct = (p: number) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))].latencyMs : 0);
  return {
    total,
    success,
    failed,
    timeout,
    successRate: total ? Math.round((success / total) * 1000) / 10 : 0,
    errorRate: total ? Math.round(((failed + timeout) / total) * 1000) / 10 : 0,
    avgLatency,
    p50: pct(0.5),
    p95: pct(0.95),
    p99: pct(0.99),
  };
}

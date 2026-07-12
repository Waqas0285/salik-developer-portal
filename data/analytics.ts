import type { MonthlyAnalytics } from "@/types";
import { mulberry32, linearForecast } from "@/lib/utils";

const rnd = mulberry32(5151);

const MONTH_LABELS = (() => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));
  }
  return labels;
})();

// Gentle upward growth trend with seasonal noise, so month-over-month and
// year-over-year comparisons in the dashboard look plausible.
export const MONTHLY_ANALYTICS: MonthlyAnalytics[] = MONTH_LABELS.map((month, i) => {
  const growth = 1 + i * 0.045;
  const totalCalls = Math.round((2_100_000 + rnd() * 350_000) * growth);
  const failedCalls = Math.round(totalCalls * (0.018 + rnd() * 0.012));
  const successfulCalls = totalCalls - failedCalls;
  const revenueAed = Math.round((640_000 + rnd() * 120_000) * growth);
  return {
    month,
    totalCalls,
    successfulCalls,
    failedCalls,
    avgLatencyMs: Math.round(120 + rnd() * 60),
    p50: Math.round(85 + rnd() * 30),
    p95: Math.round(280 + rnd() * 90),
    p99: Math.round(520 + rnd() * 180),
    peakTps: Math.round(90 + rnd() * 60 + i * 2),
    failedTps: Math.round(2 + rnd() * 5),
    revenueAed,
  };
});

export const CURRENT_MONTH = MONTHLY_ANALYTICS[MONTHLY_ANALYTICS.length - 1];
export const PREVIOUS_MONTH = MONTHLY_ANALYTICS[MONTHLY_ANALYTICS.length - 2];
export const SAME_MONTH_LAST_YEAR = MONTHLY_ANALYTICS[0]; // 11 months back ~ proxy since only 12mo of data exists

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

const callsSeries = MONTHLY_ANALYTICS.map((m) => m.totalCalls);
export const FORECAST_NEXT_MONTH_CALLS = linearForecast(callsSeries, 1);
export const FORECAST_NEXT_QUARTER_CALLS =
  linearForecast(callsSeries, 1) + linearForecast(callsSeries, 2) + linearForecast(callsSeries, 3);


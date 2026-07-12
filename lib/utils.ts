import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAED(amount: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact) {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number, compact = false): string {
  return new Intl.NumberFormat("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(n);
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function formatDate(input: string | number | Date, withTime = false): string {
  const d = new Date(input);
  if (withTime) {
    return d.toLocaleString("en-AE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" });
}

export function relativeTime(input: string | number | Date): string {
  const d = new Date(input).getTime();
  const diff = Date.now() - d;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

// Deterministic pseudo-random generator so seed data is stable across renders/builds.
export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

export function randomId(prefix: string, length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}_${out}`;
}

export function maskSecret(secret: string, visible = 4): string {
  if (secret.length <= visible) return "•".repeat(secret.length);
  return `${"•".repeat(secret.length - visible)}${secret.slice(-visible)}`;
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Deterministic variant of randomId for use in seed data modules, so server
// and client render the exact same mock credential strings (avoids React
// hydration mismatches). Runtime "generate credential" actions should use
// randomId() instead, since those only ever run client-side after a click.
export function seededId(rnd: () => number, prefix: string, length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(rnd() * chars.length)];
  return `${prefix}_${out}`;
}

// Simple least-squares linear forecast used by the Revenue and Dashboard
// modules to project the next month/quarter/half-year/full-year from a
// trailing monthly series. This is intentionally transparent (no black-box
// ML) since it's illustrating a demo capability, not a production model.
export function linearForecast(values: number[], stepsAhead: number): number {
  const n = values.length;
  if (n === 0) return 0;
  const xs = values.map((_, i) => i);
  const xMean = xs.reduce((s, x) => s + x, 0) / n;
  const yMean = values.reduce((s, y) => s + y, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - xMean) * (values[i] - yMean), 0);
  const den = xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return Math.round(intercept + slope * (n - 1 + stepsAhead));
}

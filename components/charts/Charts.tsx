"use client";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

export const CHART_COLORS = ["#26966b", "#2563eb", "#d97706", "#7c3aed", "#dc2626", "#0891b2", "#65a30d", "#db2777"];

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid rgb(var(--border))",
  background: "rgb(var(--surface))",
  fontSize: 12,
};

export function SimpleLineChart({ data, xKey, series }: { data: Record<string, unknown>[]; xKey: string; series: { key: string; color: string; name?: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name ?? s.key} stroke={s.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SimpleAreaChart({ data, xKey, series }: { data: Record<string, unknown>[]; xKey: string; series: { key: string; color: string; name?: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.map((s) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name ?? s.key} stroke={s.color} fill={`url(#grad-${s.key})`} strokeWidth={2} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({ data, xKey, series, stacked }: { data: Record<string, unknown>[]; xKey: string; series: { key: string; color: string; name?: string }[]; stacked?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name ?? s.key} fill={s.color} stackId={stacked ? "a" : undefined} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimplePieChart({ data, nameKey = "name", valueKey = "value" }: { data: Record<string, unknown>[]; nameKey?: string; valueKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

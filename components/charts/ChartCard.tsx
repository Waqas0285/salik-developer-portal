"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function ChartCard({
  title,
  subtitle,
  children,
  actions,
  height = 280,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  height?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {actions}
      </CardHeader>
      <CardContent>
        <div style={{ height }}>{children}</div>
      </CardContent>
    </Card>
  );
}

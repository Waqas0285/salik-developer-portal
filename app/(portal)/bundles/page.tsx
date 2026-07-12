"use client";
import { useState } from "react";
import { RefreshCw, Gift } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChartCard } from "@/components/charts/ChartCard";
import { SimpleLineChart } from "@/components/charts/Charts";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { useToast } from "@/components/common/Toast";
import { MOBILITY_BUNDLES, BUNDLE_UTILIZATION_TREND } from "@/data/bundles";
import { formatAED } from "@/lib/utils";
import type { BundleBenefit } from "@/types";

export default function BundlesPage() {
  const { push } = useToast();
  const [bundles, setBundles] = useState(MOBILITY_BUNDLES);

  function consume(bundleId: string, benefitId: string) {
    setBundles((prev) =>
      prev.map((b) =>
        b.id !== bundleId
          ? b
          : { ...b, benefits: b.benefits.map((ben) => (ben.id === benefitId && ben.used < ben.totalAllowance ? { ...ben, used: ben.used + 1 } : ben)) }
      )
    );
    push("success", "Benefit consumed", "Usage recorded (sandbox).");
  }

  function renew(bundleId: string) {
    setBundles((prev) => prev.map((b) => (b.id === bundleId ? { ...b, benefits: b.benefits.map((ben) => ({ ...ben, used: 0 })) } : b)));
    push("success", "Bundle renewed", "All benefit allowances reset for the new cycle.");
  }

  return (
    <div>
      <PageHeader title="Mobility Bundles" description="Subscription bundles combining parking, fuel, car wash, and toll benefits across partners." />
      <DisclaimerBanner className="mb-4" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {bundles.map((b) => (
          <Card key={b.id}>
            <CardHeader><CardTitle>{b.name}</CardTitle><Badge label={`${formatAED(b.priceAed)}/${b.billingCycle === "Monthly" ? "mo" : b.billingCycle}`} className="bg-salik-100 text-salik-700 dark:bg-salik-950/50 dark:text-salik-300" /></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[11px] text-muted">{b.eligibility} · {b.activeSubscribers.toLocaleString()} active subscribers · renews every {b.expiryDays} days</p>
              <div className="space-y-2.5">
                {b.benefits.map((ben: BundleBenefit) => (
                  <div key={ben.id}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="font-medium">{ben.label}</span>
                      <span className="text-muted">{ben.used}/{ben.totalAllowance}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-charcoal-100 dark:bg-charcoal-800">
                      <div className="h-full rounded-full bg-salik-600" style={{ width: `${Math.min(100, (ben.used / ben.totalAllowance) * 100)}%` }} />
                    </div>
                    <button
                      onClick={() => consume(b.id, ben.id)}
                      disabled={ben.used >= ben.totalAllowance}
                      className="mt-1 text-[10px] font-medium text-salik-600 hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
                    >
                      Simulate consumption
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-charcoal-100 pt-2 text-[11px] text-muted dark:border-charcoal-800">
                <p className="mb-1 font-semibold text-current">Partner contribution</p>
                {b.partnerContribution.map((pc) => <p key={pc.partnerName}>{pc.partnerName} — {pc.benefit}</p>)}
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => renew(b.id)}><RefreshCw size={13} /> Simulate renewal</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <ChartCard title="Bundle Utilization Trend" subtitle="Active subscribers over the last 6 months" height={300} actions={<Gift size={16} className="text-salik-600" />}>
        <SimpleLineChart
          data={BUNDLE_UTILIZATION_TREND}
          xKey="month"
          series={[
            { key: "everydayDriver", color: "#26966b", name: "Everyday Driver" },
            { key: "evDriver", color: "#2563eb", name: "EV Driver" },
            { key: "premiumMobility", color: "#7c3aed", name: "Premium Mobility" },
          ]}
        />
      </ChartCard>
    </div>
  );
}

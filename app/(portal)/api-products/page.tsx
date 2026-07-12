"use client";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { API_PRODUCTS } from "@/data/apiProducts";
import { getApiById } from "@/data/apis";
import { formatAED } from "@/lib/utils";
import type { ApiProduct } from "@/types";

export default function ApiProductsPage() {
  const [selected, setSelected] = useState<ApiProduct | null>(null);

  return (
    <div>
      <PageHeader title="API Products" description="Commercial bundles of related APIs, each with its own plans, pricing, and limits." />
      <DisclaimerBanner className="mb-4" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {API_PRODUCTS.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex flex-col">
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.plans.map((pl) => <Badge key={pl} label={pl} className="bg-charcoal-100 text-muted dark:bg-charcoal-800" />)}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-y-1 text-[11px] text-muted">
                <span>Monthly fee</span><span className="text-right font-medium text-current">{formatAED(p.monthlyFeeAed)}</span>
                <span>Transaction fee</span><span className="text-right font-medium text-current">{p.transactionFeePercent}%</span>
                <span>Included calls</span><span className="text-right font-medium text-current">{p.includedApiCalls.toLocaleString()}</span>
                <span>TPS limit</span><span className="text-right font-medium text-current">{p.tpsLimit}</span>
              </div>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setSelected(p)}>View details</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ""} description={selected?.intendedPartnerType}>
        {selected && (
          <div className="space-y-4 text-xs">
            <p className="text-muted">{selected.description}</p>
            <DisclaimerBanner />
            <div className="grid grid-cols-2 gap-2">
              <Row k="Monthly fee" v={formatAED(selected.monthlyFeeAed)} />
              <Row k="Transaction fee" v={`${selected.transactionFeePercent}%`} />
              <Row k="Included API calls" v={selected.includedApiCalls.toLocaleString()} />
              <Row k="Overage rate" v={`${formatAED(selected.overageRatePer1000Aed)} / 1,000 calls`} />
              <Row k="TPS limit" v={String(selected.tpsLimit)} />
              <Row k="SLA" v={selected.sla} />
              <Row k="Support tier" v={selected.supportTier} />
              <Row k="Sandbox" v={selected.sandboxAvailable ? "Available" : "Not available"} />
              <Row k="Production" v={selected.productionAvailable ? "Available" : "Not available"} />
            </div>
            <div>
              <p className="mb-1.5 font-semibold">Included APIs</p>
              <div className="space-y-1">
                {(selected.includedApiIds.length ? selected.includedApiIds : ["all"]).map((id) => {
                  const api = getApiById(id);
                  return <p key={id} className="rounded-lg border border-charcoal-100 px-2.5 py-1.5 dark:border-charcoal-800">{api ? api.name : "Full platform access — every published API"}</p>;
                })}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-charcoal-50 py-1 last:border-0 dark:border-charcoal-800/60"><span className="text-muted">{k}</span><span className="font-medium">{v}</span></div>;
}

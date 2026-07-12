"use client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { useAppData, newId } from "@/components/common/AppDataProvider";
import { useToast } from "@/components/common/Toast";
import { usePersona } from "@/components/persona/PersonaProvider";
import { formatAED, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { transactions, addTransaction, deliveries } = useAppData();
  const { push } = useToast();
  const { user } = usePersona();
  const txn = transactions.find((t) => t.id === params.id);

  if (!txn) {
    return <EmptyState icon={ArrowLeft} title="Transaction not found" action={<Button size="sm" onClick={() => router.push("/transactions")}>Back to Transactions</Button>} />;
  }

  const eventPrefix: Record<string, string> = { Toll: "toll.", Parking: "parking.", Fuel: "fuel.", "EV Charging": "ev.", "Car Wash": "carwash.", Wallet: "wallet.", Refund: "refund.", Subscription: "subscription.", "Vehicle Services": "vehicle." };
  const relatedDeliveries = deliveries.filter((d) => d.eventType.startsWith(eventPrefix[txn.category] ?? "__none__"));

  function refund() {
    const now = new Date().toISOString();
    const rf: Transaction = {
      ...txn!, id: newId("txn"), correlationId: newId("corr"), timestamp: now,
      category: "Refund", amountAed: -Math.abs(txn!.amountAed), useCase: `Refund — ${txn!.useCase}`,
      apiId: "refund-api", apiName: "Refund API", status: "Success", responseCode: 200, retryCount: 0,
      lifecycle: [{ ts: now, label: "Refund requested", detail: `Refund issued for ${txn!.id}` }, { ts: now, label: "Refund settled", detail: "Ledger updated." }],
      requestPayload: { originalTransactionId: txn!.id, amountAed: Math.abs(txn!.amountAed) },
      responsePayload: { status: "SUCCESS" },
    };
    addTransaction(rf);
    push("success", "Refund created", `${formatAED(Math.abs(txn!.amountAed))} refunded for ${txn!.id}.`);
  }

  return (
    <div>
      <button onClick={() => router.push("/transactions")} className="mb-3 flex items-center gap-1 text-xs text-muted hover:text-current">
        <ArrowLeft size={13} /> Back to Transactions
      </button>
      <PageHeader
        title={txn.id}
        description={`${txn.useCase} · ${formatDate(txn.timestamp, true)}`}
        actions={
          <>
            <Badge status={txn.status} />
            {txn.category !== "Refund" && txn.status === "Success" && <Button size="sm" variant="outline" onClick={refund}><Undo2 size={13} /> Create refund</Button>}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Transaction lifecycle</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {txn.lifecycle.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-salik-600" />
                    {i < txn.lifecycle.length - 1 && <span className="w-px flex-1 bg-charcoal-200 dark:bg-charcoal-700" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-semibold">{step.label}</p>
                    <p className="text-[11px] text-muted">{step.detail}</p>
                    <p className="text-[10px] text-muted">{formatDate(step.ts, true)}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 opacity-60">
                <span className="h-2.5 w-2.5 rounded-full bg-charcoal-300" />
                <div>
                  <p className="text-xs font-semibold">Viewed in Developer Portal</p>
                  <p className="text-[11px] text-muted">Audit entry — viewed by {user?.name} ({user?.personaLabel})</p>
                  <p className="text-[10px] text-muted">{formatDate(new Date().toISOString(), true)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment details</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <Row k="Correlation ID" v={txn.correlationId} mono />
            <Row k="Partner" v={txn.partnerName} />
            <Row k="Customer" v={txn.customerName} />
            <Row k="Vehicle" v={txn.vehiclePlate} mono />
            <Row k="API" v={txn.apiName} />
            <Row k="Amount" v={formatAED(txn.amountAed)} />
            <Row k="Response code" v={String(txn.responseCode)} />
            <Row k="Latency" v={`${txn.latencyMs} ms`} />
            <Row k="Environment" v={txn.environment} />
            <Row k="Region" v={txn.region} />
            <Row k="Retry count" v={String(txn.retryCount)} />
            {txn.failureReason && <Row k="Failure reason" v={txn.failureReason} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Request payload</CardTitle></CardHeader>
          <CardContent><pre className="scrollbar-thin max-h-56 overflow-auto rounded-lg bg-charcoal-950 p-3 text-[11px] text-charcoal-100">{JSON.stringify(txn.requestPayload, null, 2)}</pre></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Response payload</CardTitle></CardHeader>
          <CardContent><pre className="scrollbar-thin max-h-56 overflow-auto rounded-lg bg-charcoal-950 p-3 text-[11px] text-charcoal-100">{JSON.stringify(txn.responsePayload, null, 2)}</pre></CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Related webhook events</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {relatedDeliveries.length === 0 && <p className="text-xs text-muted">No related webhook deliveries found for this category.</p>}
            {relatedDeliveries.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-charcoal-100 px-2.5 py-1.5 text-xs dark:border-charcoal-800">
                <span className="font-mono">{d.eventType}</span><Badge status={d.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return <div className="flex justify-between border-b border-charcoal-50 py-1 last:border-0 dark:border-charcoal-800/60"><span className="text-muted">{k}</span><span className={mono ? "font-mono" : "font-medium"}>{v}</span></div>;
}

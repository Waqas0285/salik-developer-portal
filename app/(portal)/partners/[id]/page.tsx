"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, XCircle, PauseCircle, PlayCircle, MessageSquareWarning, Award } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/common/EmptyState";
import { useAppData } from "@/components/common/AppDataProvider";
import { useToast } from "@/components/common/Toast";
import { API_PRODUCTS } from "@/data/apiProducts";
import { getApiById } from "@/data/apis";
import { formatAED, formatDate, formatPercent } from "@/lib/utils";
import type { PartnerStatus } from "@/types";

const PLANS = ["Sandbox", "Starter", "Business", "Enterprise", "Government", "Strategic Partner"];

export default function PartnerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { partners, updatePartner, applications, tickets } = useAppData();
  const { push } = useToast();
  const partner = partners.find((p) => p.id === params.id);
  const [assignProductId, setAssignProductId] = useState("");

  if (!partner) {
    return <EmptyState icon={ArrowLeft} title="Partner not found" action={<Button size="sm" onClick={() => router.push("/partners")}>Back to Partners</Button>} />;
  }

  function setStatus(status: PartnerStatus) {
    updatePartner(partner!.id, { status, onboardingProgress: status === "Active" ? 100 : partner!.onboardingProgress });
    push("success", `Partner ${status.toLowerCase()}`, partner!.name);
  }

  function changePlan(plan: string) {
    updatePartner(partner!.id, { commercialPlan: plan });
    push("success", "Commercial plan updated", `${partner!.name} is now on the ${plan} plan.`);
  }

  const partnerApps = applications.filter((a) => a.partnerId === partner.id);
  const partnerTickets = tickets.filter((t) => t.partnerName === partner.name);
  const scorecard = {
    integration: partner.integrationStatus === "Live" ? 95 : partner.integrationStatus === "In Progress" ? 60 : 20,
    reliability: Math.round(partner.slaCompliance),
    revenue: Math.min(100, Math.round((partner.revenueAed / 200000) * 100)),
    support: Math.max(20, 100 - partner.openTickets * 15),
    security: partner.securityStatus === "Compliant" ? 100 : 50,
  };
  const overallScore = Math.round(Object.values(scorecard).reduce((a, b) => a + b, 0) / 5);

  return (
    <div>
      <button onClick={() => router.push("/partners")} className="mb-3 flex items-center gap-1 text-xs text-muted hover:text-current">
        <ArrowLeft size={13} /> Back to Partners
      </button>
      <PageHeader
        title={partner.name}
        description={`${partner.category} · Joined ${formatDate(partner.joinedAt)}`}
        actions={
          <>
            {partner.status !== "Active" && <Button size="sm" onClick={() => setStatus("Active")}><PlayCircle size={13} /> Activate</Button>}
            {partner.status !== "Suspended" && <Button size="sm" variant="outline" onClick={() => setStatus("Suspended")}><PauseCircle size={13} /> Suspend</Button>}
            {partner.status === "Prospect" && <Button size="sm" variant="outline" onClick={() => setStatus("Onboarding")}><MessageSquareWarning size={13} /> Request info</Button>}
            {partner.status !== "Rejected" && <Button size="sm" variant="danger" onClick={() => setStatus("Rejected")}><XCircle size={13} /> Reject</Button>}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Company profile</CardTitle><Badge status={partner.status} /></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <Row k="Category" v={partner.category} />
            <Row k="Registration" v={partner.status} />
            <Row k="Integration status" v={partner.integrationStatus} />
            <Row k="Environment" v={partner.environment} />
            <Row k="Applications" v={String(partner.applicationsCount)} />
            <Row k="Subscribed APIs" v={String(partner.subscribedApiIds.length)} />
            <Row k="Monthly API calls" v={partner.monthlyApiCalls.toLocaleString()} />
            <Row k="Revenue" v={formatAED(partner.revenueAed)} />
            <Row k="SLA compliance" v={formatPercent(partner.slaCompliance)} />
            <Row k="Support tickets" v={String(partner.openTickets)} />
            <Row k="Security status" v={partner.securityStatus} />
            <Row k="Onboarding progress" v={formatPercent(partner.onboardingProgress)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contacts</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <p className="font-semibold">Primary contact</p>
              <p className="text-muted">{partner.primaryContact.name}</p>
              <p className="text-muted">{partner.primaryContact.email}</p>
              <p className="text-muted">{partner.primaryContact.phone}</p>
            </div>
            <div>
              <p className="font-semibold">Technical contact</p>
              <p className="text-muted">{partner.technicalContact.name}</p>
              <p className="text-muted">{partner.technicalContact.email}</p>
              <p className="text-muted">{partner.technicalContact.phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Commercial plan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-semibold">{partner.commercialPlan}</p>
            <Select defaultValue={partner.commercialPlan} onChange={(e) => changePlan(e.target.value)}>
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Assign API product</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Select value={assignProductId} onChange={(e) => setAssignProductId(e.target.value)}>
              <option value="">Select a product…</option>
              {API_PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Button
              size="sm"
              className="w-full"
              disabled={!assignProductId}
              onClick={() => {
                const product = API_PRODUCTS.find((p) => p.id === assignProductId);
                updatePartner(partner.id, { subscribedApiIds: Array.from(new Set([...partner.subscribedApiIds, ...(product?.includedApiIds ?? [])])) });
                push("success", "API product assigned", product?.name ?? "");
                setAssignProductId("");
              }}
            >
              Assign product
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5"><Award size={14} /> Partner scorecard</CardTitle><span className="text-lg font-bold text-salik-600">{overallScore}</span></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(scorecard).map(([k, v]) => (
              <div key={k}>
                <div className="mb-0.5 flex justify-between text-[11px]"><span className="capitalize text-muted">{k}</span><span className="font-medium">{v}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-charcoal-100 dark:bg-charcoal-800">
                  <div className="h-full rounded-full bg-salik-600" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Subscribed APIs</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {partner.subscribedApiIds.map((id) => {
              const api = getApiById(id);
              return api ? <Badge key={id} label={api.name} className="bg-charcoal-100 text-muted dark:bg-charcoal-800" /> : null;
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Applications ({partnerApps.length}) & Support tickets ({partnerTickets.length})</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              {partnerApps.map((a) => <p key={a.id} className="border-b border-charcoal-50 py-1.5 text-xs last:border-0 dark:border-charcoal-800/60">{a.name} <Badge status={a.status} className="ml-1" /></p>)}
            </div>
            <div>
              {partnerTickets.map((t) => <p key={t.id} className="border-b border-charcoal-50 py-1.5 text-xs last:border-0 dark:border-charcoal-800/60">{t.subject} <Badge status={t.status} className="ml-1" /></p>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-charcoal-50 py-1 last:border-0 dark:border-charcoal-800/60"><span className="text-muted">{k}</span><span className="font-medium">{v}</span></div>;
}

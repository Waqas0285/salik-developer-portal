"use client";
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Input";
import { useAppData, newId } from "@/components/common/AppDataProvider";
import { useToast } from "@/components/common/Toast";
import type { ApiDefinition, Environment, Subscription } from "@/types";

const PLANS = ["Sandbox", "Starter", "Business", "Enterprise", "Government", "Strategic Partner"];
const CHECKLIST_LABELS = [
  { key: "nda", label: "NDA accepted" },
  { key: "trade_license", label: "Trade license verified" },
  { key: "security_review", label: "Security review completed" },
  { key: "tech_certification", label: "Technical certification passed" },
  { key: "uat", label: "UAT completed" },
  { key: "sla_accepted", label: "SLA accepted" },
  { key: "commercial_agreement", label: "Commercial agreement signed" },
  { key: "prod_credentials", label: "Production credentials issued" },
];

export function SubscribeDialog({ api, open, onClose }: { api: ApiDefinition | null; open: boolean; onClose: () => void }) {
  const { applications, addSubscription } = useAppData();
  const { push } = useToast();
  const [applicationId, setApplicationId] = useState(applications[0]?.id ?? "");
  const [environment, setEnvironment] = useState<Environment>("sandbox");
  const [plan, setPlan] = useState(PLANS[0]);
  const [accepted, setAccepted] = useState(false);
  const [step, setStep] = useState<"form" | "review">("form");

  if (!api) return null;

  function reset() {
    setStep("form");
    setAccepted(false);
  }

  function submit() {
    const app = applications.find((a) => a.id === applicationId);
    const sub: Subscription = {
      id: newId("sub"),
      apiOrProductId: api!.id,
      apiOrProductName: api!.name,
      applicationId,
      applicationName: app?.name ?? "Unnamed application",
      partnerId: app?.partnerId ?? "ptn_demo",
      partnerName: app?.partnerName ?? "Demo Partner",
      environment,
      plan,
      status: environment === "sandbox" ? "Approved" : "Submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvalChecklist: environment === "production" ? CHECKLIST_LABELS.map((c) => ({ ...c, done: false })) : [],
    };
    addSubscription(sub);
    push("success", "Subscription request submitted", `${api!.name} · ${environment} · ${plan} plan.`);
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onClose={() => { reset(); onClose(); }} title={`Subscribe to ${api.name}`} description="This creates a mock subscription request — no real access is granted.">
      {step === "form" && (
        <div className="space-y-4">
          <div>
            <Label>Application</Label>
            <Select value={applicationId} onChange={(e) => setApplicationId(e.target.value)}>
              {applications.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>Environment</Label>
            <Select value={environment} onChange={(e) => setEnvironment(e.target.value as Environment)}>
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </Select>
          </div>
          <div>
            <Label>Usage plan</Label>
            <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <div className="rounded-lg bg-charcoal-50 p-3 text-xs text-muted dark:bg-charcoal-800">
            <p className="font-semibold text-current">SLA & pricing (mock)</p>
            <p className="mt-1">{api.sla} · Rate limit {api.rateLimitPerMin}/min · {api.pricingStatus}</p>
          </div>
          <Button className="w-full" onClick={() => setStep("review")} disabled={!applicationId}>
            Continue to review
          </Button>
        </div>
      )}
      {step === "review" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-charcoal-100 p-3 text-xs dark:border-charcoal-800">
            <Row k="API" v={api.name} />
            <Row k="Application" v={applications.find((a) => a.id === applicationId)?.name ?? ""} />
            <Row k="Environment" v={environment} />
            <Row k="Plan" v={plan} />
          </div>
          <label className="flex items-start gap-2 text-xs">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" />
            I accept the API terms of use and SLA for this subscription (demo acknowledgement only).
          </label>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>Back</Button>
            <Button className="flex-1" onClick={submit} disabled={!accepted}>Submit access request</Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-charcoal-100 py-1.5 last:border-0 dark:border-charcoal-800">
      <span className="text-muted">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

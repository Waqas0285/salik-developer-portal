import type { Subscription, ApprovalChecklistItem, SubscriptionStatus } from "@/types";
import { APPLICATIONS } from "@/data/applications";
import { APIS } from "@/data/apis";
import { mulberry32 } from "@/lib/utils";

const rnd = mulberry32(909);
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

const CHECKLIST_LABELS: { key: string; label: string }[] = [
  { key: "nda", label: "NDA accepted" },
  { key: "trade_license", label: "Trade license verified" },
  { key: "security_review", label: "Security review completed" },
  { key: "tech_certification", label: "Technical certification passed" },
  { key: "uat", label: "UAT completed" },
  { key: "sla_accepted", label: "SLA accepted" },
  { key: "commercial_agreement", label: "Commercial agreement signed" },
  { key: "prod_credentials", label: "Production credentials issued" },
];

function checklistFor(status: SubscriptionStatus, environment: "sandbox" | "production"): ApprovalChecklistItem[] {
  if (environment === "sandbox") return [];
  const doneCount =
    status === "Approved" ? 8 :
    status === "Under Review" ? 4 :
    status === "Additional Information Required" ? 3 :
    status === "Submitted" ? 1 :
    status === "Suspended" ? 6 : 0;
  return CHECKLIST_LABELS.map((c, i) => ({ ...c, done: i < doneCount }));
}

const STATUS_POOL: SubscriptionStatus[] = [
  "Approved", "Approved", "Approved", "Approved", "Approved",
  "Under Review", "Under Review", "Submitted", "Additional Information Required",
  "Draft", "Rejected", "Suspended", "Expired", "Cancelled",
];

const PLANS = ["Sandbox", "Starter", "Business", "Enterprise", "Government", "Strategic Partner"];

export const SUBSCRIPTIONS: Subscription[] = APPLICATIONS.flatMap((app, ai) =>
  app.subscribedApiIds.slice(0, 2).map((apiId, si) => {
    const api = APIS.find((a) => a.id === apiId)!;
    const idx = ai * 2 + si;
    const status: SubscriptionStatus = app.environment === "sandbox" ? "Approved" : STATUS_POOL[idx % STATUS_POOL.length];
    const created = daysAgo(150 - idx * 4);
    return {
      id: `sub_${app.id}_${apiId}`,
      apiOrProductId: api.id,
      apiOrProductName: api.name,
      applicationId: app.id,
      applicationName: app.name,
      partnerId: app.partnerId,
      partnerName: app.partnerName,
      environment: app.environment,
      plan: PLANS[Math.floor(rnd() * PLANS.length)],
      status,
      createdAt: created,
      updatedAt: daysAgo(Math.max(0, 150 - idx * 4 - Math.floor(rnd() * 20))),
      approvalChecklist: checklistFor(status, app.environment),
    };
  })
).slice(0, 20);

export const getSubscriptionById = (id: string) => SUBSCRIPTIONS.find((s) => s.id === id);

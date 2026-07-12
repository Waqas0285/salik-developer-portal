import type { SupportTicket, TicketPriority, TicketStatus } from "@/types";
import { PARTNERS } from "@/data/partners";
import { mulberry32, pick } from "@/lib/utils";

const rnd = mulberry32(8181);
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600000).toISOString();

const CATEGORIES = ["Integration support", "Authentication", "API error", "Payment issue", "Refund issue", "Sandbox issue", "Production incident", "Subscription issue", "Credential issue", "Webhook issue", "Commercial query"];
const TEAMS = ["Platform Support", "Payments Engineering", "Partner Success", "Security Team", "Commercial Desk"];
const SUBJECTS = [
  "401 errors after key rotation", "Parking Payment webhook not firing", "Refund stuck in PENDING",
  "Sandbox rate limit lower than documented", "Production incident: elevated latency on Toll Transaction API",
  "Need production access for Fraud Risk API", "Client secret rotation didn't take effect",
  "Signature verification failing on webhook payloads", "Question about overage pricing",
  "Duplicate charges on Fuel Payment API", "IP allow-list update request", "OAuth scope missing for wallet writes",
  "EV charging session stuck in CHARGING state", "Onboarding checklist unclear on UAT step",
  "Requesting sandbox data reset", "Congestion Prediction API returning stale scores",
  "Settlement report missing yesterday's batch", "Certificate upload failing validation",
  "Bundle benefit not decrementing after redemption", "SLA credit request for last month's outage",
];

const PRIORITIES: TicketPriority[] = ["Low", "Medium", "Medium", "High", "High", "Urgent"];
const STATUSES: TicketStatus[] = ["Open", "In Progress", "In Progress", "Waiting on Partner", "Resolved", "Resolved", "Closed"];

export const SUPPORT_TICKETS: SupportTicket[] = SUBJECTS.map((subject, i) => {
  const priority = pick(PRIORITIES, rnd);
  const status = pick(STATUSES, rnd);
  const partner = pick(PARTNERS, rnd);
  const createdHoursAgo = 4 + Math.floor(rnd() * 400);
  const severity: SupportTicket["severity"] =
    priority === "Urgent" ? "SEV-1" : priority === "High" ? "SEV-2" : priority === "Medium" ? "SEV-3" : "SEV-4";
  const resolved = status === "Resolved" || status === "Closed";

  return {
    id: `TCK-${2200 + i}`,
    subject,
    category: pick(CATEGORIES, rnd),
    priority,
    severity,
    status,
    assignedTeam: pick(TEAMS, rnd),
    partnerName: partner.name,
    createdBy: partner.primaryContact.name,
    createdAt: hoursAgo(createdHoursAgo),
    updatedAt: hoursAgo(Math.max(0, createdHoursAgo - Math.floor(rnd() * 20))),
    slaDueAt: resolved ? hoursAgo(createdHoursAgo - 6) : hoursFromNow(Math.floor(rnd() * 20) - 4),
    comments: [
      { author: partner.primaryContact.name, timestamp: hoursAgo(createdHoursAgo), message: `We're seeing this issue consistently: ${subject.toLowerCase()}.` },
      { author: "Salik Support", timestamp: hoursAgo(createdHoursAgo - 2), message: "Thanks for the report — we've reproduced this in our staging environment and are investigating." },
      ...(resolved
        ? [{ author: "Salik Support", timestamp: hoursAgo(createdHoursAgo - 5), message: "Root cause identified and fix deployed. Please confirm on your end." }]
        : []),
    ],
    resolutionNotes: resolved ? "Fixed via configuration change; verified with partner in sandbox before closing." : undefined,
  };
});

export const getTicketById = (id: string) => SUPPORT_TICKETS.find((t) => t.id === id);

export const FAQS = [
  { q: "How do I get sandbox credentials?", a: "Create an application under My Applications, select Sandbox, and assign the APIs you need. Credentials generate instantly." },
  { q: "Why is my webhook signature invalid?", a: "Verify you're computing HMAC-SHA256 over the raw request body using the signing secret shown on the webhook's detail page, not a re-serialized JSON body." },
  { q: "How long does production approval take?", a: "In this demo, production approval stages can be simulated instantly from the subscription's approval checklist. In a live environment, expect 5-10 business days." },
  { q: "What's the difference between rate limit and daily quota?", a: "Rate limit caps requests per minute (bursts); daily quota caps total requests per rolling 24-hour period." },
  { q: "How do I test failure scenarios?", a: "Use the 'Simulate Error' toggle in API Explorer to force a specific error response without needing real failure conditions." },
];

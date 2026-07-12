import type { AppNotification, NotificationType } from "@/types";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

const mk = (
  type: NotificationType,
  title: string,
  message: string,
  hAgo: number,
  severity: AppNotification["severity"],
  read: boolean,
  link?: string
): AppNotification => ({ id: `ntf_${type.replace(/\s+/g, "_").toLowerCase()}_${hAgo}`, type, title, message, timestamp: hoursAgo(hAgo), read, severity, link });

export const NOTIFICATIONS: AppNotification[] = [
  mk("Subscription Approved", "Production access approved", "Your subscription to Parking Payment API (Production) has been approved.", 1, "success", false, "/subscriptions"),
  mk("Webhook Failed", "Webhook delivery failed", "3 consecutive delivery failures for webhook wh_dubaimall_parking on event parking.session.expired.", 2, "critical", false, "/webhooks"),
  mk("Key Expiring", "API key expiring in 7 days", "Sandbox API key for Mobility Super App expires 2026-07-19. Rotate before expiry.", 3, "warning", false, "/security"),
  mk("Incident Started", "Degraded performance: Payment Engine", "Elevated latency detected on Payment Engine dependency. Impact: Parking Payment API, Fuel Payment API.", 4, "critical", false, "/health"),
  mk("Incident Resolved", "Incident resolved: Payment Engine", "Payment Engine latency has returned to baseline. Total incident duration: 34 minutes.", 4.5, "success", true, "/health"),
  mk("API Published", "New API published: Voucher API", "Voucher API v1.0 is now published and available in Sandbox and Production.", 20, "info", true, "/marketplace"),
  mk("API Version Updated", "EV Charging Session API v1.2 released", "New version adds idempotency-key support and improved error taxonomy.", 26, "info", true, "/apis/ev-charging-session-api"),
  mk("Quota Nearing Limit", "Daily quota at 82%", "Dubai Mall Smart Parking has consumed 82% of its daily quota for Parking Session API.", 30, "warning", true, "/applications"),
  mk("Rate Limit Exceeded", "Rate limit exceeded", "Application 'Airport Access Management' exceeded its rate limit on Vehicle Access Validation API 14 times in the last hour.", 36, "warning", true, "/analytics"),
  mk("SLA Warning", "SLA at risk: Toll Transaction API", "Monthly availability is trending at 99.83%, below the 99.9% target.", 40, "warning", true, "/sla"),
  mk("Certificate Expiring", "mTLS certificate expiring", "Certificate for DEWA EV Charging expires in 14 days.", 48, "warning", true, "/security"),
  mk("Maintenance Scheduled", "Scheduled maintenance: Notification Service", "Maintenance window 2026-07-20 02:00–04:00 GST. Minor delivery delays possible.", 50, "info", true, "/health"),
  mk("Support Ticket Updated", "Ticket TCK-2291 updated", "Salik support replied to your ticket about webhook signature verification.", 55, "info", true, "/support"),
  mk("Subscription Rejected", "Sandbox request needs more info", "Your request for Fraud Risk API requires additional business justification.", 60, "warning", true, "/subscriptions"),
  mk("API Deprecated", "Payment Initiation API v1.0 deprecated", "v1.0 is deprecated. Migrate to v1.1 before the sunset date.", 72, "warning", true, "/versions"),
  mk("API Sunset Announced", "Sunset announced: Toll Balance API v1.0", "v1.0 will be retired on 2026-09-01. See migration guide.", 80, "warning", true, "/versions"),
  mk("Webhook Failed", "Webhook re-enabled after fix", "webhook wh_enoc_fuel resumed successful delivery after endpoint fix.", 90, "success", true, "/webhooks"),
  mk("Key Expiring", "Production secret rotated", "Client secret for ENOC Fuel Payment Integration was rotated successfully.", 100, "info", true, "/applications"),
  mk("Incident Started", "Partial outage: Notification Service", "Push notification delivery delayed for EV charging completion events.", 120, "critical", true, "/health"),
  mk("Incident Resolved", "Resolved: Notification Service", "Notification Service fully restored; backlog cleared.", 121, "success", true, "/health"),
];

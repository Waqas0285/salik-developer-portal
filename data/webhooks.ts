import type { WebhookEventType, Webhook, WebhookDelivery, WebhookDeliveryStatus } from "@/types";
import { APPLICATIONS } from "@/data/applications";
import { mulberry32, pick, seededId } from "@/lib/utils";

const rnd = mulberry32(6060);
const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const WEBHOOK_EVENT_TYPES: WebhookEventType[] = [
  { id: "toll.passage.detected", name: "Toll passage detected", category: "Toll", description: "Fired the moment a vehicle crosses a toll gate." },
  { id: "parking.session.started", name: "Parking session started", category: "Parking", description: "Fired when a new parking session opens." },
  { id: "parking.session.extended", name: "Parking session extended", category: "Parking", description: "Fired when a session's expiry is extended." },
  { id: "parking.session.expired", name: "Parking session expired", category: "Parking", description: "Fired when a session exceeds its allowed duration without exit." },
  { id: "parking.entry.detected", name: "Parking entry detected", category: "Parking", description: "Fired on ANPR/tag-based facility entry." },
  { id: "parking.exit.detected", name: "Parking exit detected", category: "Parking", description: "Fired on ANPR/tag-based facility exit." },
  { id: "payment.initiated", name: "Payment initiated", category: "Wallet", description: "Fired when any payment request is accepted for processing." },
  { id: "payment.completed", name: "Payment completed", category: "Wallet", description: "Fired when a payment settles successfully." },
  { id: "payment.failed", name: "Payment failed", category: "Wallet", description: "Fired when a payment is declined or errors out." },
  { id: "refund.initiated", name: "Refund initiated", category: "Refund", description: "Fired when a refund request is accepted." },
  { id: "refund.completed", name: "Refund completed", category: "Refund", description: "Fired when a refund settles back to the customer." },
  { id: "wallet.credited", name: "Wallet credited", category: "Wallet", description: "Fired when a customer's wallet balance increases." },
  { id: "wallet.debited", name: "Wallet debited", category: "Wallet", description: "Fired when a customer's wallet balance decreases." },
  { id: "wallet.balance.low", name: "Wallet balance low", category: "Wallet", description: "Fired when balance drops below the customer's configured threshold." },
  { id: "ev.charging.started", name: "EV charging started", category: "EV Charging", description: "Fired when a charging session begins delivering energy." },
  { id: "ev.charging.completed", name: "EV charging completed", category: "EV Charging", description: "Fired when a charging session ends." },
  { id: "fuel.purchase.completed", name: "Fuel purchase completed", category: "Fuel", description: "Fired when a fuel payment settles." },
  { id: "carwash.completed", name: "Car wash completed", category: "Car Wash", description: "Fired when a booked car wash service is marked complete." },
  { id: "subscription.activated", name: "Subscription activated", category: "Subscription", description: "Fired when a mobility bundle subscription becomes active." },
  { id: "subscription.renewed", name: "Subscription renewed", category: "Subscription", description: "Fired on successful bundle renewal." },
  { id: "subscription.benefit.consumed", name: "Subscription benefit consumed", category: "Subscription", description: "Fired when a bundle benefit unit is redeemed." },
  { id: "vehicle.registration.renewed", name: "Vehicle registration renewed", category: "Vehicle", description: "Fired when RTA registration renewal completes." },
  { id: "insurance.policy.renewed", name: "Insurance policy renewed", category: "Vehicle", description: "Fired when an insurance policy renewal completes." },
];

export const WEBHOOKS: Webhook[] = APPLICATIONS.filter((a) => a.webhookUrl).map((app, i) => ({
  id: `wh_${app.id}`,
  applicationId: app.id,
  applicationName: app.name,
  url: app.webhookUrl!,
  events: WEBHOOK_EVENT_TYPES.filter((_, idx) => (idx + i) % 4 === 0).map((e) => e.id).slice(0, 4),
  authType: i % 2 === 0 ? "HMAC Signature" : "Bearer Token",
  signingSecret: seededId(rnd, "whsec", 28),
  retryPolicy: i % 3 === 0 ? "Exponential" : "Linear",
  timeoutSeconds: [5, 10, 15][i % 3],
  active: i % 5 !== 0,
  createdAt: daysAgo(120 - i * 6),
}));

const DELIVERY_STATUS_POOL: WebhookDeliveryStatus[] = ["Delivered", "Delivered", "Delivered", "Delivered", "Failed", "Retrying", "Pending"];

export const WEBHOOK_DELIVERIES: WebhookDelivery[] = Array.from({ length: 20 }, (_, i) => {
  const wh = WEBHOOKS[i % WEBHOOKS.length] ?? WEBHOOKS[0];
  const event = pick(WEBHOOK_EVENT_TYPES, rnd);
  const status = pick(DELIVERY_STATUS_POOL, rnd);
  return {
    id: seededId(rnd, "whd", 12),
    webhookId: wh?.id ?? "wh_none",
    eventType: event.id,
    status,
    attempt: status === "Retrying" ? 2 : status === "Failed" ? 3 : 1,
    timestamp: minutesAgo(Math.floor(rnd() * 4000)),
    requestPayload: { event: event.id, id: seededId(rnd, "evt", 10), timestamp: minutesAgo(0) },
    responseStatus: status === "Delivered" ? 200 : status === "Failed" ? pick([500, 502, 504], rnd) : null,
    responseBody: status === "Delivered" ? '{"received":true}' : status === "Failed" ? '{"error":"endpoint unreachable"}' : "",
  };
});

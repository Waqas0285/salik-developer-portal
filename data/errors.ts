import type { ErrorRecord, ErrorCategory } from "@/types";
import { PARTNERS } from "@/data/partners";
import { APPLICATIONS } from "@/data/applications";
import { APIS } from "@/data/apis";
import { mulberry32, pick, seededId } from "@/lib/utils";

const rnd = mulberry32(4242);
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

const CATEGORY_INFO: Record<ErrorCategory, { status: number; messages: string[]; rootCauses: string[]; actions: string[] }> = {
  Authentication: { status: 401, messages: ["Bearer token expired", "API key not recognized", "mTLS certificate invalid"], rootCauses: ["Token expiry is causing a large share of authentication failures.", "Partner is using a revoked sandbox key against production."], actions: ["Rotate and reissue credentials", "Shorten token TTL warning window", "Notify partner via Security dashboard"] },
  Authorization: { status: 403, messages: ["Application not subscribed to this API", "Environment mismatch (sandbox key on production)", "Scope insufficient for requested action"], rootCauses: ["Partner application is calling an API it has not been approved for.", "OAuth scope was not requested during subscription."], actions: ["Guide partner to complete subscription workflow", "Adjust granted OAuth scopes"] },
  Validation: { status: 400, messages: ["Missing required field: vehiclePlate", "Invalid amountAed: must be positive", "Malformed idempotency key"], rootCauses: ["Partner application is sending an invalid vehicle identifier.", "Client SDK version predates a required field."], actions: ["Share updated request schema with partner", "Recommend SDK upgrade"] },
  "Business Rule": { status: 422, messages: ["Session already closed", "Refund exceeds original transaction amount", "Bundle benefit already fully consumed"], rootCauses: ["Retry configuration is creating duplicate payment requests.", "Partner UI allows re-submitting a closed session."], actions: ["Add idempotency guidance to docs", "Work with partner on UI validation"] },
  Wallet: { status: 402, messages: ["Insufficient wallet balance", "Wallet frozen pending KYC", "Auto-reload failed"], rootCauses: ["Customer wallet balance is below the transaction amount at a higher rate during evening hours.", "Auto-reload card expired."], actions: ["Prompt customer to top up", "Surface auto-reload failure notification"] },
  Partner: { status: 403, messages: ["Partner account suspended", "Partner exceeded contracted volume", "IP address not allow-listed"], rootCauses: ["Partner's allow-listed IP range changed without updating the application config."], actions: ["Update allowed IP list", "Contact partner technical contact"] },
  Timeout: { status: 504, messages: ["Downstream payment engine timeout", "Parking provider gateway timeout", "Wallet ledger write timeout"], rootCauses: ["Parking provider response time increased after 3:00 PM local time.", "Ledger service experiencing elevated write latency."], actions: ["Engage parking provider on latency", "Scale ledger service replica count"] },
  Network: { status: 503, messages: ["Connection reset by peer", "DNS resolution failure to partner endpoint", "TLS handshake failure"], rootCauses: ["Intermittent network path issue between region edge and partner endpoint."], actions: ["Open network diagnostics ticket", "Enable retry with backoff"] },
  Gateway: { status: 502, messages: ["Upstream returned invalid response", "Gateway circuit breaker open", "Malformed upstream JSON"], rootCauses: ["Circuit breaker tripped after a burst of 5xx responses from Parking Session API."], actions: ["Investigate upstream service health", "Review circuit breaker thresholds"] },
  Backend: { status: 500, messages: ["Unhandled exception in payment processor", "Null reference in settlement calculation", "Database constraint violation"], rootCauses: ["Recent deployment introduced a regression in the settlement calculator."], actions: ["Roll back or hotfix deployment", "Add regression test coverage"] },
  "Dependency Failure": { status: 503, messages: ["Wallet service unavailable", "Fraud scoring service unavailable", "Notification service unavailable"], rootCauses: ["Dependency service degraded during a scheduled maintenance window."], actions: ["Coordinate maintenance windows with dependent teams", "Add graceful degradation"] },
  "Rate Limit": { status: 429, messages: ["Per-minute rate limit exceeded", "Daily quota exceeded", "Burst limit exceeded"], rootCauses: ["Failed TPS is concentrated on a single high-traffic endpoint during peak hours."], actions: ["Advise partner to implement backoff", "Consider a higher-tier plan for the partner"] },
  "Duplicate Transaction": { status: 409, messages: ["Idempotency key already used", "Duplicate toll passage detected", "Duplicate refund request"], rootCauses: ["Retry configuration is creating duplicate payment requests on the refund endpoint."], actions: ["Confirm partner is reusing idempotency keys correctly"] },
  "Fraud/Risk": { status: 403, messages: ["Transaction blocked by fraud model", "Velocity check failed", "Device fingerprint mismatch"], rootCauses: ["Fraud model flagged an unusual transaction velocity pattern from one application."], actions: ["Review fraud model threshold", "Manually clear false positive if confirmed legitimate"] },
};

const CATEGORIES = Object.keys(CATEGORY_INFO) as ErrorCategory[];

export const ERRORS: ErrorRecord[] = Array.from({ length: 50 }, (_, i) => {
  const category = pick(CATEGORIES, rnd);
  const info = CATEGORY_INFO[category];
  const api = pick(APIS, rnd);
  const app = pick(APPLICATIONS, rnd);
  const partner = PARTNERS.find((p) => p.id === app.partnerId) ?? pick(PARTNERS, rnd);
  return {
    id: seededId(rnd, "err", 12),
    timestamp: hoursAgo(Math.floor(rnd() * 720)),
    apiId: api.id,
    apiName: api.name,
    endpoint: api.endpoints[Math.floor(rnd() * api.endpoints.length)]?.path ?? "/v1/unknown",
    partnerId: partner.id,
    partnerName: partner.name,
    applicationName: app.name,
    environment: app.environment,
    httpStatus: info.status,
    category,
    message: pick(info.messages, rnd),
    impactedCustomers: Math.round(1 + rnd() * 140),
    rootCause: pick(info.rootCauses, rnd),
    recommendedAction: pick(info.actions, rnd),
    mttrMinutes: Math.round(5 + rnd() * 175),
  };
});

export const ERROR_CATEGORY_INFO = CATEGORY_INFO;

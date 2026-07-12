import type { ApiDefinition, ApiEndpoint, ApiVersion, ApiCategory } from "@/types";
import { mulberry32 } from "@/lib/utils";

const rnd = mulberry32(1337);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function defaultVersions(current: string): ApiVersion[] {
  return [
    { version: "v1.0", status: "deprecated", releasedOn: "2024-03-01", sunsetOn: "2026-03-01", changes: ["Initial GA release"] },
    { version: "v1.1", status: current === "v1.1" ? "current" : "deprecated", releasedOn: "2025-02-10", changes: ["Added correlation ID header", "Added pagination to list endpoints"] },
    { version: current, status: "current", releasedOn: "2025-11-18", changes: ["Added idempotency-key support", "Improved error taxonomy", "Added webhook event references"] },
  ];
}

const IDEMPOTENT_HEADERS = [
  { name: "X-Correlation-Id", in: "header" as const, type: "string", required: false, description: "Caller-supplied trace ID propagated through logs and webhook events.", example: "corr_8f2a1c90" },
  { name: "Authorization", in: "header" as const, type: "string", required: true, description: "Bearer token or API key depending on the application's configured auth type.", example: "Bearer sk_live_***" },
];

function commonErrors(entity: string): ApiEndpoint["errorExamples"] {
  return [
    { status: 400, code: "VALIDATION_ERROR", example: { error: "VALIDATION_ERROR", message: `Missing or invalid field on ${entity} request.`, correlationId: "corr_8f2a1c90" } },
    { status: 401, code: "UNAUTHENTICATED", example: { error: "UNAUTHENTICATED", message: "Invalid or expired credentials.", correlationId: "corr_8f2a1c91" } },
    { status: 403, code: "PARTNER_NOT_AUTHORIZED", example: { error: "PARTNER_NOT_AUTHORIZED", message: "Application is not subscribed to this API in this environment.", correlationId: "corr_8f2a1c92" } },
    { status: 404, code: "NOT_FOUND", example: { error: "NOT_FOUND", message: `${entity} could not be located.`, correlationId: "corr_8f2a1c93" } },
    { status: 409, code: "DUPLICATE_TRANSACTION", example: { error: "DUPLICATE_TRANSACTION", message: "A request with this idempotency key was already processed.", correlationId: "corr_8f2a1c94" } },
    { status: 429, code: "RATE_LIMIT_EXCEEDED", example: { error: "RATE_LIMIT_EXCEEDED", message: "Too many requests — retry after the interval in Retry-After.", correlationId: "corr_8f2a1c95" } },
    { status: 500, code: "INTERNAL_ERROR", example: { error: "INTERNAL_ERROR", message: "Unexpected server error.", correlationId: "corr_8f2a1c96" } },
    { status: 503, code: "SERVICE_UNAVAILABLE", example: { error: "SERVICE_UNAVAILABLE", message: "Downstream dependency temporarily unavailable.", correlationId: "corr_8f2a1c97" } },
  ];
}

function defaultEndpoint(name: string, path: string): ApiEndpoint {
  const entity = name.replace(/ API$/, "");
  return {
    id: `${slug(path)}-get`,
    method: "GET",
    path,
    summary: `Retrieve ${entity.toLowerCase()} details`,
    description: `Returns the current ${entity.toLowerCase()} record for the given identifier.`,
    parameters: [
      { name: "id", in: "path", type: "string", required: true, description: `Unique ${entity.toLowerCase()} identifier.`, example: "id_9F2K7QX" },
      ...IDEMPOTENT_HEADERS,
    ],
    responseSchema: [
      { name: "id", type: "string", required: true, description: "Resource identifier.", example: "id_9F2K7QX" },
      { name: "status", type: "string", required: true, description: "Current lifecycle status of the resource.", example: "ACTIVE", enum: ["ACTIVE", "PENDING", "CLOSED"] },
      { name: "updatedAt", type: "string (ISO 8601)", required: true, description: "Last update timestamp.", example: "2026-07-10T08:12:00Z" },
    ],
    successExample: { id: "id_9F2K7QX", status: "ACTIVE", updatedAt: "2026-07-10T08:12:00Z" },
    errorExamples: commonErrors(entity),
  };
}

interface RawApi {
  name: string;
  category: ApiCategory;
  shortDescription: string;
  businessPurpose: string;
  keyUseCases: string[];
  intendedConsumers: string[];
  owner: string;
  technicalOwner: string;
  dependencyServices: string[];
  tags: string[];
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  endpoints?: ApiEndpoint[];
}

// ---- Flagship, fully-specified endpoint sets (used by API Explorer + Swagger viewer) ----

const parkingPaymentEndpoints: ApiEndpoint[] = [
  {
    id: "parking-payment-initiate",
    method: "POST",
    path: "/v1/parking/payments",
    summary: "Initiate a parking payment",
    description: "Charges the customer's linked Salik Wallet or card for an active or completed parking session.",
    requiresIdempotencyKey: true,
    parameters: [
      { name: "Idempotency-Key", in: "header", type: "string", required: true, description: "Unique key to safely retry this request without double-charging.", example: "idem_7f3a-9c21-4b0e" },
      ...IDEMPOTENT_HEADERS,
    ],
    requestBody: [
      { name: "sessionId", type: "string", required: true, description: "Parking Session API session identifier.", example: "psn_7QK2M9XZ" },
      { name: "vehiclePlate", type: "string", required: true, description: "UAE plate number of the parked vehicle.", example: "A 12345" },
      { name: "amountAed", type: "number", required: true, description: "Amount to charge in AED.", example: 12.5 },
      { name: "paymentMethod", type: "string", required: true, description: "Funding source for the charge.", example: "WALLET", enum: ["WALLET", "CARD", "SALIK_TAG"] },
      { name: "locationId", type: "string", required: false, description: "Parking zone/location identifier.", example: "zone_dxb_mall_l2" },
    ],
    responseSchema: [
      { name: "paymentId", type: "string", required: true, description: "Unique payment identifier.", example: "pay_9K2QZX7M" },
      { name: "status", type: "string", required: true, description: "Payment outcome status.", example: "SUCCESS", enum: ["SUCCESS", "FAILED", "PENDING"] },
      { name: "amountAed", type: "number", required: true, description: "Amount charged in AED.", example: 12.5 },
      { name: "walletBalanceAed", type: "number", required: false, description: "Remaining wallet balance after charge, if paid via WALLET.", example: 187.25 },
      { name: "receiptUrl", type: "string", required: false, description: "Digital receipt URL.", example: "https://receipts.salik-demo.ae/pay_9K2QZX7M" },
    ],
    successExample: { paymentId: "pay_9K2QZX7M", status: "SUCCESS", amountAed: 12.5, walletBalanceAed: 187.25, receiptUrl: "https://receipts.salik-demo.ae/pay_9K2QZX7M" },
    errorExamples: [
      { status: 402, code: "INSUFFICIENT_BALANCE", example: { error: "INSUFFICIENT_BALANCE", message: "Wallet balance is insufficient to complete this payment.", correlationId: "corr_1a2b3c" } },
      ...commonErrors("parking payment"),
    ],
  },
  {
    id: "parking-payment-get",
    method: "GET",
    path: "/v1/parking/payments/{paymentId}",
    summary: "Retrieve a parking payment",
    description: "Returns the current status and details of a previously initiated parking payment.",
    parameters: [
      { name: "paymentId", in: "path", type: "string", required: true, description: "Payment identifier returned from the initiate call.", example: "pay_9K2QZX7M" },
      ...IDEMPOTENT_HEADERS,
    ],
    responseSchema: [
      { name: "paymentId", type: "string", required: true, description: "Unique payment identifier.", example: "pay_9K2QZX7M" },
      { name: "status", type: "string", required: true, description: "Current payment status.", example: "SUCCESS" },
      { name: "amountAed", type: "number", required: true, description: "Amount charged.", example: 12.5 },
    ],
    successExample: { paymentId: "pay_9K2QZX7M", status: "SUCCESS", amountAed: 12.5 },
    errorExamples: commonErrors("parking payment"),
  },
];

const parkingSessionEndpoints: ApiEndpoint[] = [
  {
    id: "parking-session-start",
    method: "POST",
    path: "/v1/parking/sessions",
    summary: "Start a parking session",
    description: "Opens a new parking session when a vehicle enters a monitored zone or facility.",
    requiresIdempotencyKey: true,
    parameters: [{ name: "Idempotency-Key", in: "header", type: "string", required: true, description: "Prevents duplicate session creation on retry.", example: "idem_2b7f-88ac" }, ...IDEMPOTENT_HEADERS],
    requestBody: [
      { name: "vehiclePlate", type: "string", required: true, description: "UAE plate number.", example: "D 88213" },
      { name: "locationId", type: "string", required: true, description: "Parking facility/zone identifier.", example: "zone_dxb_mall_l2" },
      { name: "entryMethod", type: "string", required: true, description: "How entry was detected.", example: "ANPR", enum: ["ANPR", "SALIK_TAG", "QR_CODE", "MANUAL"] },
    ],
    responseSchema: [
      { name: "sessionId", type: "string", required: true, description: "Unique parking session identifier.", example: "psn_7QK2M9XZ" },
      { name: "status", type: "string", required: true, description: "Session status.", example: "ACTIVE", enum: ["ACTIVE", "EXTENDED", "EXPIRED", "CLOSED"] },
      { name: "startedAt", type: "string (ISO 8601)", required: true, description: "Session start time.", example: "2026-07-12T09:15:00Z" },
    ],
    successExample: { sessionId: "psn_7QK2M9XZ", status: "ACTIVE", startedAt: "2026-07-12T09:15:00Z" },
    errorExamples: commonErrors("parking session"),
  },
  {
    id: "parking-session-extend",
    method: "PATCH",
    path: "/v1/parking/sessions/{sessionId}/extend",
    summary: "Extend a parking session",
    description: "Extends an active parking session by the given duration, typically triggered from the consumer app.",
    parameters: [
      { name: "sessionId", in: "path", type: "string", required: true, description: "Session to extend.", example: "psn_7QK2M9XZ" },
      ...IDEMPOTENT_HEADERS,
    ],
    requestBody: [{ name: "extendMinutes", type: "number", required: true, description: "Additional minutes requested.", example: 60 }],
    responseSchema: [
      { name: "sessionId", type: "string", required: true, description: "Session identifier.", example: "psn_7QK2M9XZ" },
      { name: "status", type: "string", required: true, description: "Updated status.", example: "EXTENDED" },
      { name: "newExpiryAt", type: "string (ISO 8601)", required: true, description: "New expiry timestamp.", example: "2026-07-12T11:15:00Z" },
    ],
    successExample: { sessionId: "psn_7QK2M9XZ", status: "EXTENDED", newExpiryAt: "2026-07-12T11:15:00Z" },
    errorExamples: commonErrors("parking session"),
  },
];

const walletEndpoints: ApiEndpoint[] = [
  {
    id: "wallet-get-balance",
    method: "GET",
    path: "/v1/wallet/{customerId}/balance",
    summary: "Get wallet balance",
    description: "Returns the current Salik Wallet balance and currency for a customer.",
    parameters: [{ name: "customerId", in: "path", type: "string", required: true, description: "Salik customer identifier.", example: "cus_4M2K9QXZ" }, ...IDEMPOTENT_HEADERS],
    responseSchema: [
      { name: "customerId", type: "string", required: true, description: "Customer identifier.", example: "cus_4M2K9QXZ" },
      { name: "balanceAed", type: "number", required: true, description: "Current wallet balance in AED.", example: 187.25 },
      { name: "lowBalanceThresholdAed", type: "number", required: false, description: "Configured low-balance alert threshold.", example: 50 },
    ],
    successExample: { customerId: "cus_4M2K9QXZ", balanceAed: 187.25, lowBalanceThresholdAed: 50 },
    errorExamples: commonErrors("wallet"),
  },
  {
    id: "wallet-topup",
    method: "POST",
    path: "/v1/wallet/{customerId}/topup",
    summary: "Top up wallet balance",
    description: "Credits a customer's Salik Wallet from a linked card, bank transfer, or partner cashback source.",
    requiresIdempotencyKey: true,
    parameters: [
      { name: "customerId", in: "path", type: "string", required: true, description: "Customer identifier.", example: "cus_4M2K9QXZ" },
      { name: "Idempotency-Key", in: "header", type: "string", required: true, description: "Prevents duplicate top-ups on retry.", example: "idem_44ac-91bd" },
      ...IDEMPOTENT_HEADERS,
    ],
    requestBody: [
      { name: "amountAed", type: "number", required: true, description: "Amount to credit in AED.", example: 100 },
      { name: "source", type: "string", required: true, description: "Funding source.", example: "CARD", enum: ["CARD", "BANK_TRANSFER", "PARTNER_CASHBACK"] },
    ],
    responseSchema: [
      { name: "transactionId", type: "string", required: true, description: "Top-up transaction identifier.", example: "wtx_82KQ9XZM" },
      { name: "newBalanceAed", type: "number", required: true, description: "Wallet balance after top-up.", example: 287.25 },
    ],
    successExample: { transactionId: "wtx_82KQ9XZM", newBalanceAed: 287.25 },
    errorExamples: commonErrors("wallet"),
  },
];

const tollTransactionEndpoints: ApiEndpoint[] = [
  {
    id: "toll-transaction-list",
    method: "GET",
    path: "/v1/toll/transactions",
    summary: "List toll transactions",
    description: "Returns a paginated list of toll gate crossings for a given vehicle or account.",
    parameters: [
      { name: "vehiclePlate", in: "query", type: "string", required: false, description: "Filter by UAE plate number.", example: "A 12345" },
      { name: "from", in: "query", type: "string", required: false, description: "Start date (ISO 8601).", example: "2026-06-01" },
      { name: "to", in: "query", type: "string", required: false, description: "End date (ISO 8601).", example: "2026-07-01" },
      { name: "page", in: "query", type: "integer", required: false, description: "Page number, starting at 1.", example: "1" },
      { name: "pageSize", in: "query", type: "integer", required: false, description: "Results per page (max 100).", example: "20" },
      ...IDEMPOTENT_HEADERS,
    ],
    responseSchema: [
      { name: "items", type: "array<TollTransaction>", required: true, description: "Toll crossings matching the filter." },
      { name: "page", type: "integer", required: true, description: "Current page number.", example: 1 },
      { name: "totalPages", type: "integer", required: true, description: "Total pages available.", example: 4 },
    ],
    successExample: {
      items: [{ transactionId: "tol_6QZ9K2XM", gateId: "gate_al_barsha", amountAed: 4, crossedAt: "2026-07-12T07:41:00Z" }],
      page: 1,
      totalPages: 4,
    },
    errorExamples: commonErrors("toll transaction"),
  },
  {
    id: "toll-transaction-get",
    method: "GET",
    path: "/v1/toll/transactions/{transactionId}",
    summary: "Get a toll transaction",
    description: "Returns full detail for a single toll gate crossing, including gate and pricing metadata.",
    parameters: [{ name: "transactionId", in: "path", type: "string", required: true, description: "Toll transaction identifier.", example: "tol_6QZ9K2XM" }, ...IDEMPOTENT_HEADERS],
    responseSchema: [
      { name: "transactionId", type: "string", required: true, description: "Transaction identifier.", example: "tol_6QZ9K2XM" },
      { name: "gateId", type: "string", required: true, description: "Toll gate identifier.", example: "gate_al_barsha" },
      { name: "amountAed", type: "number", required: true, description: "Toll fee charged.", example: 4 },
      { name: "crossedAt", type: "string (ISO 8601)", required: true, description: "Gate crossing timestamp.", example: "2026-07-12T07:41:00Z" },
    ],
    successExample: { transactionId: "tol_6QZ9K2XM", gateId: "gate_al_barsha", amountAed: 4, crossedAt: "2026-07-12T07:41:00Z" },
    errorExamples: commonErrors("toll transaction"),
  },
];

const evChargingEndpoints: ApiEndpoint[] = [
  {
    id: "ev-session-start",
    method: "POST",
    path: "/v1/ev/charging-sessions",
    summary: "Start an EV charging session",
    description: "Begins a charging session at a connected EV charger for an authenticated customer/vehicle.",
    requiresIdempotencyKey: true,
    parameters: [{ name: "Idempotency-Key", in: "header", type: "string", required: true, description: "Prevents duplicate session start on retry.", example: "idem_ev-91a2" }, ...IDEMPOTENT_HEADERS],
    requestBody: [
      { name: "chargerId", type: "string", required: true, description: "EV charger identifier.", example: "chg_dubai_marina_03" },
      { name: "vehiclePlate", type: "string", required: true, description: "UAE plate number.", example: "P 55210" },
      { name: "connectorType", type: "string", required: true, description: "Charging connector type.", example: "CCS2", enum: ["CCS2", "CHAdeMO", "TYPE2"] },
    ],
    responseSchema: [
      { name: "sessionId", type: "string", required: true, description: "Charging session identifier.", example: "evs_31QK9XZM" },
      { name: "status", type: "string", required: true, description: "Session status.", example: "CHARGING", enum: ["CHARGING", "COMPLETE", "FAULTED"] },
      { name: "estimatedCostAed", type: "number", required: false, description: "Estimated total cost.", example: 42.0 },
    ],
    successExample: { sessionId: "evs_31QK9XZM", status: "CHARGING", estimatedCostAed: 42.0 },
    errorExamples: commonErrors("EV charging session"),
  },
  {
    id: "ev-session-status",
    method: "GET",
    path: "/v1/ev/charging-sessions/{sessionId}",
    summary: "Get charging session status",
    description: "Returns live status, energy delivered, and cost accrued for an active or completed charging session.",
    parameters: [{ name: "sessionId", in: "path", type: "string", required: true, description: "Charging session identifier.", example: "evs_31QK9XZM" }, ...IDEMPOTENT_HEADERS],
    responseSchema: [
      { name: "sessionId", type: "string", required: true, description: "Session identifier.", example: "evs_31QK9XZM" },
      { name: "status", type: "string", required: true, description: "Current status.", example: "CHARGING" },
      { name: "energyDeliveredKwh", type: "number", required: true, description: "Energy delivered so far.", example: 18.4 },
      { name: "costSoFarAed", type: "number", required: true, description: "Cost accrued so far.", example: 25.76 },
    ],
    successExample: { sessionId: "evs_31QK9XZM", status: "CHARGING", energyDeliveredKwh: 18.4, costSoFarAed: 25.76 },
    errorExamples: commonErrors("EV charging session"),
  },
];

const fuelPaymentEndpoints: ApiEndpoint[] = [
  {
    id: "fuel-payment-initiate",
    method: "POST",
    path: "/v1/fuel/payments",
    summary: "Initiate a fuel payment",
    description: "Processes an in-app or pump-side fuel purchase payment via the customer's Salik Wallet or linked card.",
    requiresIdempotencyKey: true,
    parameters: [{ name: "Idempotency-Key", in: "header", type: "string", required: true, description: "Prevents duplicate fuel charges on retry.", example: "idem_fuel-771c" }, ...IDEMPOTENT_HEADERS],
    requestBody: [
      { name: "stationId", type: "string", required: true, description: "Fuel station identifier.", example: "stn_enoc_jlt_04" },
      { name: "pumpNumber", type: "integer", required: true, description: "Pump number used.", example: 6 },
      { name: "amountAed", type: "number", required: true, description: "Amount to charge in AED.", example: 120.0 },
      { name: "fuelType", type: "string", required: true, description: "Fuel grade dispensed.", example: "SUPER_98", enum: ["SPECIAL_91", "SUPER_98", "DIESEL"] },
    ],
    responseSchema: [
      { name: "paymentId", type: "string", required: true, description: "Fuel payment identifier.", example: "fpy_20QK9XZM" },
      { name: "status", type: "string", required: true, description: "Payment status.", example: "SUCCESS" },
      { name: "discountAppliedAed", type: "number", required: false, description: "Loyalty/partner discount applied.", example: 1.2 },
    ],
    successExample: { paymentId: "fpy_20QK9XZM", status: "SUCCESS", discountAppliedAed: 1.2 },
    errorExamples: commonErrors("fuel payment"),
  },
  {
    id: "fuel-payment-get",
    method: "GET",
    path: "/v1/fuel/payments/{paymentId}",
    summary: "Get a fuel payment",
    description: "Retrieves the status and detail of a fuel payment transaction.",
    parameters: [{ name: "paymentId", in: "path", type: "string", required: true, description: "Fuel payment identifier.", example: "fpy_20QK9XZM" }, ...IDEMPOTENT_HEADERS],
    responseSchema: [
      { name: "paymentId", type: "string", required: true, description: "Payment identifier.", example: "fpy_20QK9XZM" },
      { name: "status", type: "string", required: true, description: "Payment status.", example: "SUCCESS" },
    ],
    successExample: { paymentId: "fpy_20QK9XZM", status: "SUCCESS" },
    errorExamples: commonErrors("fuel payment"),
  },
];

const refundEndpoints: ApiEndpoint[] = [
  {
    id: "refund-create",
    method: "POST",
    path: "/v1/refunds",
    summary: "Create a refund",
    description: "Issues a full or partial refund for any completed Salik transaction (parking, toll, fuel, EV, car wash, subscription).",
    requiresIdempotencyKey: true,
    parameters: [{ name: "Idempotency-Key", in: "header", type: "string", required: true, description: "Prevents duplicate refunds on retry.", example: "idem_ref-3d21" }, ...IDEMPOTENT_HEADERS],
    requestBody: [
      { name: "originalTransactionId", type: "string", required: true, description: "The transaction being refunded.", example: "pay_9K2QZX7M" },
      { name: "amountAed", type: "number", required: true, description: "Refund amount (up to the original amount).", example: 12.5 },
      { name: "reason", type: "string", required: true, description: "Refund reason code.", example: "SERVICE_NOT_RENDERED", enum: ["SERVICE_NOT_RENDERED", "DUPLICATE_CHARGE", "CUSTOMER_REQUEST", "GOODWILL"] },
    ],
    responseSchema: [
      { name: "refundId", type: "string", required: true, description: "Refund identifier.", example: "rfd_55QK9XZM" },
      { name: "status", type: "string", required: true, description: "Refund status.", example: "COMPLETED", enum: ["COMPLETED", "PENDING", "FAILED"] },
    ],
    successExample: { refundId: "rfd_55QK9XZM", status: "COMPLETED" },
    errorExamples: commonErrors("refund"),
  },
  {
    id: "refund-get",
    method: "GET",
    path: "/v1/refunds/{refundId}",
    summary: "Get refund status",
    description: "Returns the current status of a previously created refund.",
    parameters: [{ name: "refundId", in: "path", type: "string", required: true, description: "Refund identifier.", example: "rfd_55QK9XZM" }, ...IDEMPOTENT_HEADERS],
    responseSchema: [
      { name: "refundId", type: "string", required: true, description: "Refund identifier.", example: "rfd_55QK9XZM" },
      { name: "status", type: "string", required: true, description: "Current status.", example: "COMPLETED" },
    ],
    successExample: { refundId: "rfd_55QK9XZM", status: "COMPLETED" },
    errorExamples: commonErrors("refund"),
  },
];

const customerProfileEndpoints: ApiEndpoint[] = [
  {
    id: "customer-get",
    method: "GET",
    path: "/v1/customers/{customerId}",
    summary: "Get customer profile",
    description: "Returns core customer profile fields, subject to the application's granted consent scope.",
    parameters: [{ name: "customerId", in: "path", type: "string", required: true, description: "Customer identifier.", example: "cus_4M2K9QXZ" }, ...IDEMPOTENT_HEADERS],
    responseSchema: [
      { name: "customerId", type: "string", required: true, description: "Customer identifier.", example: "cus_4M2K9QXZ" },
      { name: "fullName", type: "string", required: true, description: "Customer full name.", example: "Rashid Al Mansoori" },
      { name: "segment", type: "string", required: false, description: "AI-derived customer segment.", example: "Frequent Commuter" },
      { name: "vehicleCount", type: "integer", required: true, description: "Number of vehicles linked to this account.", example: 2 },
    ],
    successExample: { customerId: "cus_4M2K9QXZ", fullName: "Rashid Al Mansoori", segment: "Frequent Commuter", vehicleCount: 2 },
    errorExamples: commonErrors("customer profile"),
  },
  {
    id: "customer-update-preferences",
    method: "PATCH",
    path: "/v1/customers/{customerId}/preferences",
    summary: "Update notification preferences",
    description: "Updates a customer's notification and consent preferences.",
    parameters: [{ name: "customerId", in: "path", type: "string", required: true, description: "Customer identifier.", example: "cus_4M2K9QXZ" }, ...IDEMPOTENT_HEADERS],
    requestBody: [
      { name: "lowBalanceAlerts", type: "boolean", required: false, description: "Enable low-balance push notifications.", example: true },
      { name: "congestionAlerts", type: "boolean", required: false, description: "Enable predictive congestion notifications.", example: true },
    ],
    responseSchema: [{ name: "customerId", type: "string", required: true, description: "Customer identifier.", example: "cus_4M2K9QXZ" }, { name: "updated", type: "boolean", required: true, description: "Whether the update succeeded.", example: true }],
    successExample: { customerId: "cus_4M2K9QXZ", updated: true },
    errorExamples: commonErrors("customer profile"),
  },
];

const mobilityBundleEndpoints: ApiEndpoint[] = [
  {
    id: "bundle-list",
    method: "GET",
    path: "/v1/bundles",
    summary: "List available mobility bundles",
    description: "Returns all mobility bundles a customer is eligible to subscribe to.",
    parameters: [{ name: "customerId", in: "query", type: "string", required: false, description: "Filter by eligibility for a specific customer.", example: "cus_4M2K9QXZ" }, ...IDEMPOTENT_HEADERS],
    responseSchema: [{ name: "items", type: "array<Bundle>", required: true, description: "Available bundles." }],
    successExample: { items: [{ bundleId: "bnd_everyday_driver", name: "Everyday Driver Bundle", priceAed: 49 }] },
    errorExamples: commonErrors("mobility bundle"),
  },
  {
    id: "bundle-consume-benefit",
    method: "POST",
    path: "/v1/bundles/{subscriptionId}/consume",
    summary: "Consume a bundle benefit",
    description: "Records the consumption of one unit of a subscribed bundle benefit (for example one free car wash).",
    requiresIdempotencyKey: true,
    parameters: [{ name: "subscriptionId", in: "path", type: "string", required: true, description: "Bundle subscription identifier.", example: "bsub_71QK9XZM" }, ...IDEMPOTENT_HEADERS],
    requestBody: [{ name: "benefitId", type: "string", required: true, description: "Benefit being consumed.", example: "free_car_wash" }],
    responseSchema: [
      { name: "benefitId", type: "string", required: true, description: "Benefit identifier.", example: "free_car_wash" },
      { name: "remainingUnits", type: "integer", required: true, description: "Units remaining after consumption.", example: 1 },
    ],
    successExample: { benefitId: "free_car_wash", remainingUnits: 1 },
    errorExamples: commonErrors("bundle benefit"),
  },
];

const congestionPredictionEndpoints: ApiEndpoint[] = [
  {
    id: "congestion-predict",
    method: "GET",
    path: "/v1/ai/congestion-prediction",
    summary: "Predict road segment congestion",
    description: "Returns a predicted congestion score and recommended alternate route for a road segment over the next 30–60 minutes.",
    parameters: [
      { name: "segmentId", in: "query", type: "string", required: true, description: "Road segment identifier.", example: "seg_sheikh_zayed_12" },
      { name: "horizonMinutes", in: "query", type: "integer", required: false, description: "Prediction horizon in minutes.", example: "30" },
      ...IDEMPOTENT_HEADERS,
    ],
    responseSchema: [
      { name: "segmentId", type: "string", required: true, description: "Road segment identifier.", example: "seg_sheikh_zayed_12" },
      { name: "congestionScore", type: "number", required: true, description: "Predicted congestion score, 0 (clear) to 100 (gridlock).", example: 74 },
      { name: "alternateRouteId", type: "string", required: false, description: "Recommended alternate route, if congestion score is high.", example: "route_al_khail_alt_3" },
    ],
    successExample: { segmentId: "seg_sheikh_zayed_12", congestionScore: 74, alternateRouteId: "route_al_khail_alt_3" },
    errorExamples: commonErrors("congestion prediction"),
  },
  {
    id: "congestion-subscribe",
    method: "POST",
    path: "/v1/ai/congestion-alerts/subscriptions",
    summary: "Subscribe to congestion alerts",
    description: "Registers a webhook or push-notification subscription for predictive congestion alerts on a route.",
    parameters: [...IDEMPOTENT_HEADERS],
    requestBody: [
      { name: "routeId", type: "string", required: true, description: "Route to monitor.", example: "route_sheikh_zayed_main" },
      { name: "thresholdScore", type: "number", required: true, description: "Minimum congestion score that triggers an alert.", example: 70 },
    ],
    responseSchema: [{ name: "subscriptionId", type: "string", required: true, description: "Alert subscription identifier.", example: "cas_91QK7XZM" }],
    successExample: { subscriptionId: "cas_91QK7XZM" },
    errorExamples: commonErrors("congestion alert subscription"),
  },
];

const RAW: RawApi[] = [
  { name: "Toll Transaction API", category: "Toll", shortDescription: "Query and reconcile individual toll gate crossing transactions.", businessPurpose: "Gives partners and internal teams programmatic access to toll crossing records for billing, reconciliation, and customer support.", keyUseCases: ["Statement generation", "Dispute investigation", "Partner billing reconciliation"], intendedConsumers: ["Banks", "Fleet operators", "Insurance partners"], owner: "Sara Al Hashimi", technicalOwner: "Platform Engineering", dependencyServices: ["Toll Gate Event Broker", "Billing Engine"], tags: ["toll", "core", "read"], featured: true, endpoints: tollTransactionEndpoints },
  { name: "Toll Passage Event API", category: "Toll", shortDescription: "Real-time event feed of toll gate passages as they occur.", businessPurpose: "Streams toll passage events to partner systems in near real time for fleet tracking and fraud monitoring.", keyUseCases: ["Live fleet tracking", "Fraud detection", "Trip reconstruction"], intendedConsumers: ["Fleet operators", "Insurance partners"], owner: "Sara Al Hashimi", technicalOwner: "Event Platform", dependencyServices: ["Toll Gate Event Broker"], tags: ["toll", "events", "streaming"] },
  { name: "Toll Balance API", category: "Toll", shortDescription: "Retrieve prepaid toll account balance for a Salik Tag.", businessPurpose: "Lets partner apps show up-to-date toll balance without redirecting to the Salik app.", keyUseCases: ["Balance display in partner apps", "Low-balance UX"], intendedConsumers: ["Mobility super apps", "Banks"], owner: "Sara Al Hashimi", technicalOwner: "Wallet Engineering", dependencyServices: ["Salik Wallet API"], tags: ["toll", "balance"] },

  { name: "Parking Payment API", category: "Parking", shortDescription: "Charge customers for parking sessions via wallet, card, or Salik Tag.", businessPurpose: "Central payment execution for all parking transactions across managed and third-party parking facilities.", keyUseCases: ["In-app parking payment", "Gate-exit auto-charge", "Partner facility billing"], intendedConsumers: ["Mall operators", "Parking operators", "Mobility apps"], owner: "Sara Al Hashimi", technicalOwner: "Payments Engineering", dependencyServices: ["Salik Wallet API", "Payment Engine", "Parking Session API"], tags: ["parking", "payments", "core"], featured: true, trending: true, endpoints: parkingPaymentEndpoints },
  { name: "Parking Session API", category: "Parking", shortDescription: "Create, extend, and close parking sessions in real time.", businessPurpose: "Tracks the full lifecycle of a vehicle's stay in a monitored parking facility.", keyUseCases: ["ANPR-based entry/exit", "Session extension from app", "Overstay detection"], intendedConsumers: ["Mall operators", "Parking operators"], owner: "Sara Al Hashimi", technicalOwner: "Parking Platform", dependencyServices: ["ANPR Gateway", "Parking Payment API"], tags: ["parking", "sessions", "core"], featured: true, endpoints: parkingSessionEndpoints },
  { name: "Parking Availability API", category: "Parking", shortDescription: "Real-time bay availability across managed parking facilities.", businessPurpose: "Powers 'find parking near me' experiences in partner and consumer apps.", keyUseCases: ["Live availability maps", "Pre-booking availability checks"], intendedConsumers: ["Mobility apps", "Mall operators"], owner: "Sara Al Hashimi", technicalOwner: "Parking Platform", dependencyServices: ["Facility Sensor Network"], tags: ["parking", "availability"], trending: true },
  { name: "Dynamic Parking Pricing API", category: "Parking", shortDescription: "AI-recommended real-time parking price per zone based on demand.", businessPurpose: "Lets operators run demand-based pricing to balance occupancy and revenue.", keyUseCases: ["Peak-hour pricing", "Event-day surge pricing"], intendedConsumers: ["Parking operators", "Mall operators"], owner: "Sara Al Hashimi", technicalOwner: "Data & AI", dependencyServices: ["Parking Demand Forecast Model"], tags: ["parking", "ai", "pricing"], isNew: true },

  { name: "Vehicle Access Validation API", category: "Access Management", shortDescription: "Validate whether a vehicle is authorized to enter a controlled zone or facility.", businessPurpose: "Provides sub-second access decisions for gates, garages, and restricted zones.", keyUseCases: ["Airport access control", "Staff/visitor gate validation"], intendedConsumers: ["Airports", "Government facilities"], owner: "Omar Al Zaabi", technicalOwner: "Access Platform", dependencyServices: ["Access Pass Service"], tags: ["access", "security"] },
  { name: "Gate Entry API", category: "Access Management", shortDescription: "Record and authorize a vehicle gate-entry event.", businessPurpose: "Standardizes entry event capture across all gated facilities on the platform.", keyUseCases: ["Facility entry logging", "Visitor check-in"], intendedConsumers: ["Airports", "Mall operators"], owner: "Omar Al Zaabi", technicalOwner: "Access Platform", dependencyServices: ["Vehicle Access Validation API"], tags: ["access", "events"] },

  { name: "Salik Wallet API", category: "Wallet & Payments", shortDescription: "Manage customer prepaid wallet balance, top-ups, and history.", businessPurpose: "The core stored-value ledger underlying nearly every payment flow on the platform.", keyUseCases: ["Balance inquiry", "Top-up", "Auto-reload configuration"], intendedConsumers: ["All partner categories"], owner: "Sara Al Hashimi", technicalOwner: "Wallet Engineering", dependencyServices: ["Payment Engine", "Ledger Service"], tags: ["wallet", "payments", "core"], featured: true, endpoints: walletEndpoints },
  { name: "Payment Initiation API", category: "Wallet & Payments", shortDescription: "Generic payment-initiation endpoint used across mobility use cases.", businessPurpose: "Single entry point for initiating a charge against a customer for any mobility service.", keyUseCases: ["Unified checkout across services"], intendedConsumers: ["Mobility super apps"], owner: "Sara Al Hashimi", technicalOwner: "Payments Engineering", dependencyServices: ["Payment Engine"], tags: ["payments", "core"] },
  { name: "Refund API", category: "Wallet & Payments", shortDescription: "Issue full or partial refunds for any completed transaction.", businessPurpose: "Standardizes refund issuance and tracking across all mobility services for support and finance teams.", keyUseCases: ["Support-initiated refunds", "Automated dispute refunds"], intendedConsumers: ["All partner categories"], owner: "Sara Al Hashimi", technicalOwner: "Payments Engineering", dependencyServices: ["Payment Engine", "Ledger Service"], tags: ["payments", "refunds", "core"], featured: true, endpoints: refundEndpoints },
  { name: "Settlement API", category: "Wallet & Payments", shortDescription: "Retrieve daily/weekly settlement batches for partner reconciliation.", businessPurpose: "Gives partner finance teams programmatic access to settlement data instead of manual statements.", keyUseCases: ["Automated reconciliation", "Finance reporting"], intendedConsumers: ["Banks", "Fintech partners"], owner: "Sara Al Hashimi", technicalOwner: "Finance Platform", dependencyServices: ["Ledger Service"], tags: ["payments", "settlement"] },

  { name: "Fuel Payment API", category: "Fuel", shortDescription: "Process in-app or pump-side fuel purchase payments.", businessPurpose: "Enables cashless fuel payment with loyalty and partner discounts applied automatically.", keyUseCases: ["Pump-side payment", "In-app pre-pay"], intendedConsumers: ["Fuel retailers"], owner: "Sara Al Hashimi", technicalOwner: "Payments Engineering", dependencyServices: ["Salik Wallet API", "Fuel Loyalty Engine"], tags: ["fuel", "payments"], featured: true, endpoints: fuelPaymentEndpoints },
  { name: "Fuel Station Discovery API", category: "Fuel", shortDescription: "Locate nearby fuel stations with live pricing and amenities.", businessPurpose: "Powers station-finder experiences across partner and consumer apps.", keyUseCases: ["Station finder", "Route-based fuel planning"], intendedConsumers: ["Mobility apps", "Fuel retailers"], owner: "Sara Al Hashimi", technicalOwner: "Data & AI", dependencyServices: ["Station Directory Service"], tags: ["fuel", "discovery"] },

  { name: "EV Charging Session API", category: "EV Charging", shortDescription: "Start, monitor, and complete EV charging sessions.", businessPurpose: "Standardizes charging session lifecycle across third-party charge point operators.", keyUseCases: ["Start/stop charging", "Live energy monitoring"], intendedConsumers: ["EV charging networks", "Utilities"], owner: "Sara Al Hashimi", technicalOwner: "EV Platform", dependencyServices: ["Charge Point OCPP Gateway", "Salik Wallet API"], tags: ["ev", "charging", "core"], featured: true, trending: true, endpoints: evChargingEndpoints },
  { name: "EV Charger Discovery API", category: "EV Charging", shortDescription: "Find nearby EV chargers with live availability and connector type.", businessPurpose: "Reduces range anxiety by surfacing accurate, real-time charger availability.", keyUseCases: ["Charger finder", "Route charging planning"], intendedConsumers: ["EV charging networks", "Mobility apps"], owner: "Sara Al Hashimi", technicalOwner: "EV Platform", dependencyServices: ["Charge Point OCPP Gateway"], tags: ["ev", "discovery"], isNew: true },

  { name: "Car Wash Booking API", category: "Car Wash", shortDescription: "Book a car wash slot at a partner location.", businessPurpose: "Lets partner and consumer apps book car wash appointments directly against operator schedules.", keyUseCases: ["Slot booking", "Bundle-benefit redemption"], intendedConsumers: ["Car wash providers"], owner: "Sara Al Hashimi", technicalOwner: "Services Platform", dependencyServices: ["Operator Scheduling Service"], tags: ["car-wash", "booking"] },
  { name: "Car Wash Payment API", category: "Car Wash", shortDescription: "Charge for a completed car wash service.", businessPurpose: "Processes payment on car wash completion, applying any subscribed bundle benefit automatically.", keyUseCases: ["Post-service payment", "Bundle benefit consumption"], intendedConsumers: ["Car wash providers"], owner: "Sara Al Hashimi", technicalOwner: "Payments Engineering", dependencyServices: ["Salik Wallet API", "Mobility Bundle API"], tags: ["car-wash", "payments"] },

  { name: "Vehicle Inspection API", category: "Vehicle Services", shortDescription: "Schedule and retrieve vehicle inspection results.", businessPurpose: "Connects inspection center partners to Salik's customer base for scheduling and result retrieval.", keyUseCases: ["Inspection booking", "Result lookup"], intendedConsumers: ["Vehicle inspection providers", "Government"], owner: "Sara Al Hashimi", technicalOwner: "Services Platform", dependencyServices: ["RTA Vehicle Registry (mock)"], tags: ["vehicle", "inspection"] },
  { name: "Insurance API", category: "Vehicle Services", shortDescription: "Retrieve and renew vehicle insurance policy information.", businessPurpose: "Enables insurers to offer renewal and quote flows inside the Salik ecosystem.", keyUseCases: ["Policy renewal reminders", "In-app renewal"], intendedConsumers: ["Insurers"], owner: "Sara Al Hashimi", technicalOwner: "Services Platform", dependencyServices: ["Customer Profile API", "Vehicle Profile Service"], tags: ["vehicle", "insurance"] },

  { name: "Customer Profile API", category: "Customer", shortDescription: "Retrieve and update consented customer profile data.", businessPurpose: "The canonical customer record shared (with consent) across partner integrations.", keyUseCases: ["Profile lookup", "Preference management", "Segment retrieval"], intendedConsumers: ["All partner categories"], owner: "Sara Al Hashimi", technicalOwner: "Customer Platform", dependencyServices: ["Consent Management Service"], tags: ["customer", "core"], featured: true, endpoints: customerProfileEndpoints },
  { name: "Consent Management API", category: "Customer", shortDescription: "Manage granular data-sharing consent per partner and data category.", businessPurpose: "Ensures every partner data exchange is backed by an explicit, auditable customer consent record.", keyUseCases: ["Consent capture", "Consent revocation", "Audit trail"], intendedConsumers: ["All partner categories", "Government"], owner: "Omar Al Zaabi", technicalOwner: "Trust & Privacy", dependencyServices: ["Customer Profile API"], tags: ["customer", "privacy", "compliance"] },

  { name: "Mobility Bundle API", category: "Subscription & Loyalty", shortDescription: "Browse, subscribe to, and consume benefits from mobility bundles.", businessPurpose: "Powers subscription bundle merchandising and benefit redemption across all mobility services.", keyUseCases: ["Bundle catalog", "Benefit consumption", "Utilization tracking"], intendedConsumers: ["Mobility apps", "Partner apps"], owner: "Sara Al Hashimi", technicalOwner: "Loyalty Platform", dependencyServices: ["Salik Wallet API"], tags: ["subscription", "loyalty", "core"], featured: true, trending: true, endpoints: mobilityBundleEndpoints },
  { name: "Loyalty Points API", category: "Subscription & Loyalty", shortDescription: "Earn and redeem loyalty points across mobility services.", businessPurpose: "Cross-service loyalty ledger that rewards frequent multi-service usage.", keyUseCases: ["Points earning on transactions", "Points redemption"], intendedConsumers: ["Fuel retailers", "Mobility apps"], owner: "Sara Al Hashimi", technicalOwner: "Loyalty Platform", dependencyServices: ["Ledger Service"], tags: ["loyalty"] },
  { name: "Voucher API", category: "Subscription & Loyalty", shortDescription: "Issue and redeem promotional vouchers.", businessPurpose: "Supports targeted promotional campaigns run jointly with partners.", keyUseCases: ["Campaign voucher issuance", "Redemption validation"], intendedConsumers: ["All partner categories"], owner: "Sara Al Hashimi", technicalOwner: "Loyalty Platform", dependencyServices: ["Ledger Service"], tags: ["loyalty", "marketing"], isNew: true },

  { name: "Congestion Prediction API", category: "AI & Data", shortDescription: "Predict short-horizon road segment congestion using historical and live signals.", businessPurpose: "Feeds predictive in-app notifications and partner routing tools with Salik's proprietary traffic model.", keyUseCases: ["Predictive push notifications", "Partner route optimization"], intendedConsumers: ["RTA", "Mobility apps", "Fleet operators"], owner: "Sara Al Hashimi", technicalOwner: "Data & AI", dependencyServices: ["Traffic Model Service"], tags: ["ai", "traffic", "core"], featured: true, trending: true, endpoints: congestionPredictionEndpoints },
  { name: "Alternate Route Recommendation API", category: "AI & Data", shortDescription: "Recommend alternate routes when predicted congestion exceeds a threshold.", businessPurpose: "Pairs with Congestion Prediction API to close the loop from prediction to actionable guidance.", keyUseCases: ["In-app route suggestions", "Fleet dispatch optimization"], intendedConsumers: ["RTA", "Fleet operators"], owner: "Sara Al Hashimi", technicalOwner: "Data & AI", dependencyServices: ["Congestion Prediction API"], tags: ["ai", "traffic"] },
  { name: "User Segmentation API", category: "AI & Data", shortDescription: "Retrieve AI-derived behavioral and spend segments for a customer.", businessPurpose: "Powers targeted offers, bundle recommendations, and partner co-marketing.", keyUseCases: ["Targeted offer eligibility", "Partner co-marketing"], intendedConsumers: ["Business teams", "Marketing partners"], owner: "Sara Al Hashimi", technicalOwner: "Data & AI", dependencyServices: ["Customer 360 Store"], tags: ["ai", "segmentation"], trending: true },
  { name: "Fraud Risk API", category: "AI & Data", shortDescription: "Score a transaction's fraud risk in real time.", businessPurpose: "Reduces fraud losses by scoring transactions before they are authorized.", keyUseCases: ["Pre-authorization risk scoring", "Step-up authentication triggers"], intendedConsumers: ["Payments Engineering", "Banks"], owner: "Omar Al Zaabi", technicalOwner: "Risk & Fraud", dependencyServices: ["Fraud Model Service"], tags: ["ai", "fraud", "risk"] },
];

const OWNERS_ENV: Record<string, boolean> = {};
void OWNERS_ENV;

export const APIS: ApiDefinition[] = RAW.map((raw, i) => {
  const id = slug(raw.name);
  const popularity = Math.round(40 + rnd() * 60);
  const subscribers = Math.round(4 + rnd() * 46);
  const successRate = Math.round((96 + rnd() * 3.6) * 100) / 100;
  const avgLatencyMs = Math.round(60 + rnd() * 220);
  const daysAgo = Math.round(rnd() * 40);
  const lastUpdated = new Date(Date.now() - daysAgo * 86400000).toISOString();
  const version = raw.isNew ? "v1.1" : "v1.2";
  return {
    id,
    name: raw.name,
    shortDescription: raw.shortDescription,
    category: raw.category,
    version,
    lifecycleStatus: "Published",
    authType: raw.category === "AI & Data" ? "OAuth 2.0 Client Credentials" : i % 5 === 0 ? "mTLS + API Key" : "API Key",
    environments: ["sandbox", "production"],
    sla: "99.9% monthly availability",
    rateLimitPerMin: [60, 120, 300, 600][i % 4],
    dailyQuota: [5000, 20000, 100000, 500000][i % 4],
    peakTps: [15, 40, 90, 150][i % 4],
    pricingStatus: raw.category === "AI & Data" ? "Contact Sales" : i % 3 === 0 ? "Subscription" : "Metered",
    subscribers,
    popularity,
    lastUpdated,
    owner: raw.owner,
    technicalOwner: raw.technicalOwner,
    tags: raw.tags,
    featured: raw.featured,
    trending: raw.trending,
    isNew: raw.isNew,
    businessPurpose: raw.businessPurpose,
    keyUseCases: raw.keyUseCases,
    intendedConsumers: raw.intendedConsumers,
    responseTimeTargetMs: [200, 300, 500][i % 3],
    dataClassification: raw.category === "Customer" || raw.category === "AI & Data" ? "Confidential" : "Internal",
    productionReadiness: "Ready",
    dependencyServices: raw.dependencyServices,
    avgLatencyMs,
    successRate,
    endpoints: raw.endpoints ?? [defaultEndpoint(raw.name, `/v1/${slug(raw.category)}/${slug(raw.name).replace(/-api$/, "")}`)],
    versions: defaultVersions(version),
  };
});

export const getApiById = (id: string) => APIS.find((a) => a.id === id);
export const FLAGSHIP_API_IDS = [
  "toll-transaction-api", "parking-payment-api", "parking-session-api", "salik-wallet-api",
  "ev-charging-session-api", "fuel-payment-api", "refund-api", "customer-profile-api",
  "mobility-bundle-api", "congestion-prediction-api",
];

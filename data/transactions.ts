import type { Transaction, TransactionCategory, TransactionStatus, Region } from "@/types";
import { PARTNERS } from "@/data/partners";
import { APIS } from "@/data/apis";
import { mulberry32, pick, seededId } from "@/lib/utils";

const rnd = mulberry32(2024);
const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

const CUSTOMER_NAMES = [
  "Rashid Al Mansoori", "Fatima Al Zaabi", "Mohammed Al Hashimi", "Aisha Al Marzooqi", "Khalid Al Suwaidi",
  "Mariam Al Nuaimi", "Ahmed Al Balushi", "Noura Al Shamsi", "Saeed Al Falasi", "Hessa Al Ketbi",
  "Omar Al Qassimi", "Layla Al Mazrui", "Hamdan Al Dhaheri", "Shamma Al Ameri", "Sultan Al Rashidi",
];

const PLATE_CODES = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "U", "V", "X", "Y", "Z"];
const plate = () => `${pick(PLATE_CODES, rnd)} ${Math.floor(rnd() * 89999 + 10000)}`;

const CATEGORY_APIS: Record<TransactionCategory, string> = {
  Toll: "toll-transaction-api",
  Parking: "parking-payment-api",
  Fuel: "fuel-payment-api",
  "EV Charging": "ev-charging-session-api",
  "Car Wash": "car-wash-payment-api",
  Wallet: "salik-wallet-api",
  Refund: "refund-api",
  Subscription: "mobility-bundle-api",
  "Vehicle Services": "vehicle-inspection-api",
};

const CATEGORY_AMOUNT: Record<TransactionCategory, [number, number]> = {
  Toll: [4, 4],
  Parking: [5, 45],
  Fuel: [50, 220],
  "EV Charging": [20, 95],
  "Car Wash": [25, 90],
  Wallet: [50, 300],
  Refund: [-90, -5],
  Subscription: [39, 299],
  "Vehicle Services": [80, 350],
};

const CATEGORIES: TransactionCategory[] = ["Toll", "Parking", "Fuel", "EV Charging", "Car Wash", "Wallet", "Refund", "Subscription", "Vehicle Services"];
const REGIONS: Region[] = ["Dubai", "Dubai", "Dubai", "Abu Dhabi", "Abu Dhabi", "Sharjah", "Northern Emirates"];

const FAILURE_REASONS = [
  "Insufficient wallet balance", "Invalid vehicle identifier", "Duplicate idempotency key",
  "Partner application not authorized for this environment", "Downstream payment engine timeout",
  "Rate limit exceeded", "Card declined by issuer", "Session already closed",
];

function buildLifecycle(status: TransactionStatus, ts: string, category: TransactionCategory): Transaction["lifecycle"] {
  const base = new Date(ts).getTime();
  const steps: Transaction["lifecycle"] = [
    { ts: new Date(base).toISOString(), label: "Request received", detail: `${category} request accepted by API gateway.` },
    { ts: new Date(base + 80).toISOString(), label: "Authentication validated", detail: "Application credentials verified." },
    { ts: new Date(base + 220).toISOString(), label: "Business rules evaluated", detail: "Amount, entity and consent checks passed." },
  ];
  if (status === "Success") {
    steps.push({ ts: new Date(base + 480).toISOString(), label: "Payment settled", detail: "Ledger updated and receipt generated." });
  } else if (status === "Failed") {
    steps.push({ ts: new Date(base + 300).toISOString(), label: "Request rejected", detail: "See failure reason for detail." });
  } else if (status === "Timeout") {
    steps.push({ ts: new Date(base + 5000).toISOString(), label: "Downstream timeout", detail: "No response from dependency within SLA window." });
  } else {
    steps.push({ ts: new Date(base + 300).toISOString(), label: "Awaiting confirmation", detail: "Transaction is pending settlement." });
  }
  return steps;
}

export const TRANSACTIONS: Transaction[] = Array.from({ length: 200 }, (_, i) => {
  const category = pick(CATEGORIES, rnd);
  const partner = pick(PARTNERS, rnd);
  const api = APIS.find((a) => a.id === CATEGORY_APIS[category])!;
  const statusRoll = rnd();
  const status: TransactionStatus = statusRoll < 0.86 ? "Success" : statusRoll < 0.95 ? "Failed" : statusRoll < 0.98 ? "Timeout" : "Pending";
  const [min, max] = CATEGORY_AMOUNT[category];
  const amountAed = Math.round((min + rnd() * (max - min)) * 100) / 100;
  const ts = minutesAgo(Math.floor(rnd() * 259200)); // up to ~180 days
  const environment = rnd() > 0.25 ? "production" : "sandbox";
  const responseCode = status === "Success" ? 200 : status === "Failed" ? pick([400, 402, 403, 409], rnd) : status === "Timeout" ? 504 : 202;

  return {
    id: seededId(rnd, "txn", 14),
    correlationId: seededId(rnd, "corr", 12),
    timestamp: ts,
    partnerId: partner.id,
    partnerName: partner.name,
    customerName: pick(CUSTOMER_NAMES, rnd),
    vehiclePlate: plate(),
    useCase: `${category} — ${api.name}`,
    region: pick(REGIONS, rnd),
    apiId: api.id,
    apiName: api.name,
    category,
    amountAed,
    status,
    responseCode,
    latencyMs: Math.round(60 + rnd() * (status === "Timeout" ? 5000 : 400)),
    environment,
    failureReason: status === "Failed" || status === "Timeout" ? pick(FAILURE_REASONS, rnd) : undefined,
    lifecycle: buildLifecycle(status, ts, category),
    requestPayload: { amountAed, category, correlationId: seededId(rnd, "corr", 12) },
    responsePayload: status === "Success" ? { status: "SUCCESS", amountAed } : { error: status.toUpperCase(), message: FAILURE_REASONS[i % FAILURE_REASONS.length] },
    retryCount: status === "Failed" || status === "Timeout" ? Math.floor(rnd() * 3) : 0,
  };
});

export const getTransactionById = (id: string) => TRANSACTIONS.find((t) => t.id === id);

import type { Application } from "@/types";
import { PARTNERS } from "@/data/partners";
import { mulberry32, seededId } from "@/lib/utils";

const rnd = mulberry32(555);
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

interface RawApp {
  name: string;
  partnerName: string;
  description: string;
  environment: Application["environment"];
  apiIds: string[];
}

const RAW: RawApp[] = [
  { name: "Dubai Mall Smart Parking", partnerName: "Dubai Mall", description: "In-mall parking payment and session management integration.", environment: "production", apiIds: ["parking-payment-api", "parking-session-api", "parking-availability-api"] },
  { name: "ENOC Fuel Payment Integration", partnerName: "ENOC", description: "Pump-side cashless fuel payment via Salik Wallet.", environment: "production", apiIds: ["fuel-payment-api", "fuel-station-discovery-api"] },
  { name: "DEWA EV Charging", partnerName: "DEWA", description: "Public EV charger network session management.", environment: "production", apiIds: ["ev-charging-session-api", "ev-charger-discovery-api"] },
  { name: "Airport Access Management", partnerName: "Dubai Airports", description: "Vehicle access control for staff and visitor gates.", environment: "production", apiIds: ["vehicle-access-validation-api", "gate-entry-api"] },
  { name: "Smart Car Wash", partnerName: "Washmen", description: "Booking and payment for on-demand car wash service.", environment: "sandbox", apiIds: ["car-wash-booking-api", "car-wash-payment-api"] },
  { name: "Mobility Super App", partnerName: "Careem", description: "Unified toll, parking, and fraud-scored payments inside the Careem app.", environment: "production", apiIds: ["toll-transaction-api", "parking-payment-api", "fraud-risk-api"] },
  { name: "Emaar Valet & Parking", partnerName: "Emaar", description: "Valet and self-park session management for Emaar properties.", environment: "production", apiIds: ["parking-session-api", "dynamic-parking-pricing-api"] },
  { name: "MAF Loyalty Bundle App", partnerName: "Majid Al Futtaim", description: "Bundle subscription and benefit redemption for MAF loyalty members.", environment: "production", apiIds: ["mobility-bundle-api", "customer-profile-api"] },
  { name: "ADNOC Distribution App", partnerName: "ADNOC", description: "Consumer fuel payment app backend integration.", environment: "sandbox", apiIds: ["fuel-payment-api", "fuel-station-discovery-api"] },
  { name: "RTA Traffic Insights", partnerName: "RTA", description: "AI congestion and route-recommendation feed for RTA traffic systems.", environment: "production", apiIds: ["congestion-prediction-api", "alternate-route-recommendation-api"] },
  { name: "RTA Vehicle Compliance", partnerName: "RTA", description: "Vehicle inspection scheduling and compliance lookups.", environment: "sandbox", apiIds: ["vehicle-inspection-api"] },
  { name: "Emirates Frequent Flyer Bridge", partnerName: "Emirates", description: "Cross-loyalty points bridge between Skywards and Salik Loyalty.", environment: "sandbox", apiIds: ["loyalty-points-api", "customer-profile-api"] },
  { name: "Parkin City Zones", partnerName: "Parkin", description: "On-street parking zone availability and dynamic pricing.", environment: "production", apiIds: ["parking-availability-api", "dynamic-parking-pricing-api"] },
  { name: "Dubai Mall Developer Sandbox", partnerName: "Dubai Mall", description: "Sandbox workspace for testing next-gen valet flows.", environment: "sandbox", apiIds: ["parking-session-api"] },
  { name: "Careem Fleet Ops Console", partnerName: "Careem", description: "Fleet-wide toll and refund operations console.", environment: "sandbox", apiIds: ["toll-transaction-api", "refund-api"] },
];

export const APPLICATIONS: Application[] = RAW.map((r, i) => {
  const partner = PARTNERS.find((p) => p.name === r.partnerName)!;
  const statusPool: Application["status"][] = ["Active", "Active", "Active", "Pending", "Suspended"];
  return {
    id: `app_${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: r.name,
    partnerId: partner.id,
    partnerName: partner.name,
    description: r.description,
    environment: r.environment,
    status: statusPool[i % statusPool.length],
    clientId: seededId(rnd, "client", 16),
    clientSecret: seededId(rnd, "secret", 32),
    apiKey: seededId(rnd, r.environment === "production" ? "sk_live" : "sk_test", 24),
    oauthScopes: ["read:transactions", "write:payments", "read:profile"].slice(0, 1 + Math.floor(rnd() * 3)),
    certificateStatus: i % 7 === 0 ? "Expiring Soon" : r.environment === "production" ? "Valid" : "Not Configured",
    redirectUrls: [`https://${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.partner-demo.ae/callback`],
    allowedIps: [`10.${(i * 7) % 255}.${(i * 13) % 255}.0/24`],
    webhookUrl: i % 3 === 0 ? `https://${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.partner-demo.ae/webhooks/salik` : undefined,
    subscribedApiIds: r.apiIds,
    createdAt: daysAgo(180 - i * 9),
    lastActivity: daysAgo(Math.floor(rnd() * 5)),
    secretRotatedAt: i % 4 === 0 ? daysAgo(30 + i) : undefined,
  };
});

export const getApplicationById = (id: string) => APPLICATIONS.find((a) => a.id === id);

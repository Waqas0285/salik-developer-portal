import type { Partner } from "@/types";
import { mulberry32 } from "@/lib/utils";

const rnd = mulberry32(77);
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

interface RawPartner {
  name: string;
  category: Partner["category"];
  status: Partner["status"];
  color: string;
  apiIds: string[];
  commercialPlan: string;
}

const RAW: RawPartner[] = [
  { name: "Dubai Mall", category: "Retail & Mall", status: "Active", color: "#26966b", apiIds: ["parking-payment-api", "parking-session-api", "parking-availability-api"], commercialPlan: "Enterprise" },
  { name: "Emaar", category: "Retail & Mall", status: "Active", color: "#0f4030", apiIds: ["parking-payment-api", "parking-session-api", "dynamic-parking-pricing-api"], commercialPlan: "Enterprise" },
  { name: "Majid Al Futtaim", category: "Retail & Mall", status: "Active", color: "#2563eb", apiIds: ["parking-payment-api", "parking-session-api", "customer-profile-api", "mobility-bundle-api"], commercialPlan: "Strategic Partner" },
  { name: "ENOC", category: "Fuel Retailer", status: "Active", color: "#dc2626", apiIds: ["fuel-payment-api", "fuel-station-discovery-api", "loyalty-points-api"], commercialPlan: "Business" },
  { name: "ADNOC", category: "Fuel Retailer", status: "Active", color: "#0891b2", apiIds: ["fuel-payment-api", "fuel-station-discovery-api"], commercialPlan: "Business" },
  { name: "DEWA", category: "Utilities", status: "Active", color: "#d97706", apiIds: ["ev-charging-session-api", "ev-charger-discovery-api"], commercialPlan: "Government" },
  { name: "RTA", category: "Government", status: "Active", color: "#7c3aed", apiIds: ["toll-transaction-api", "congestion-prediction-api", "alternate-route-recommendation-api", "vehicle-inspection-api"], commercialPlan: "Government" },
  { name: "Dubai Airports", category: "Aviation", status: "Active", color: "#1e1f27", apiIds: ["vehicle-access-validation-api", "gate-entry-api", "parking-availability-api"], commercialPlan: "Strategic Partner" },
  { name: "Emirates", category: "Aviation", status: "Onboarding", color: "#c8102e", apiIds: ["customer-profile-api", "loyalty-points-api"], commercialPlan: "Enterprise" },
  { name: "Careem", category: "Mobility", status: "Active", color: "#09b83e", apiIds: ["toll-transaction-api", "parking-payment-api", "fraud-risk-api"], commercialPlan: "Strategic Partner" },
  { name: "Parkin", category: "Parking Operator", status: "Active", color: "#065f46", apiIds: ["parking-session-api", "parking-availability-api", "dynamic-parking-pricing-api"], commercialPlan: "Enterprise" },
  { name: "Washmen", category: "Car Wash", status: "Onboarding", color: "#0369a1", apiIds: ["car-wash-booking-api", "car-wash-payment-api"], commercialPlan: "Starter" },
];

export const PARTNERS: Partner[] = RAW.map((r, i) => {
  const onboardingProgress = r.status === "Active" ? 100 : Math.round(35 + rnd() * 45);
  const monthlyApiCalls = Math.round(20000 + rnd() * 480000);
  const revenueAed = Math.round(8000 + rnd() * 180000);
  return {
    id: `ptn_${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: r.name,
    category: r.category,
    status: r.status,
    environment: r.status === "Active" ? "production" : "sandbox",
    integrationStatus: r.status === "Active" ? "Live" : i % 4 === 0 ? "Blocked" : "In Progress",
    applicationsCount: Math.max(1, Math.round(rnd() * 3)),
    subscribedApiIds: r.apiIds,
    monthlyApiCalls,
    revenueAed,
    slaCompliance: Math.round((97.5 + rnd() * 2.4) * 100) / 100,
    openTickets: Math.round(rnd() * 4),
    securityStatus: i % 6 === 0 ? "Review Needed" : "Compliant",
    onboardingProgress,
    commercialPlan: r.commercialPlan,
    primaryContact: { name: `${r.name} Partnerships Lead`, email: `partnerships@${r.name.toLowerCase().replace(/\s+/g, "")}-demo.ae`, phone: "+971 4 555 01" + String(10 + i) },
    technicalContact: { name: `${r.name} Integration Engineer`, email: `tech@${r.name.toLowerCase().replace(/\s+/g, "")}-demo.ae`, phone: "+971 4 555 02" + String(10 + i) },
    joinedAt: daysAgo(120 + i * 27),
    logoInitial: r.name.charAt(0),
    color: r.color,
  };
});

export const getPartnerById = (id: string) => PARTNERS.find((p) => p.id === id);

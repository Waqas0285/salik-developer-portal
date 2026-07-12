import type { MobilityBundle } from "@/types";
import { mulberry32 } from "@/lib/utils";

const rnd = mulberry32(1212);

export const MOBILITY_BUNDLES: MobilityBundle[] = [
  {
    id: "bnd_everyday_driver",
    name: "Everyday Driver Bundle",
    priceAed: 49,
    billingCycle: "Monthly",
    benefits: [
      { id: "free_parking_2", label: "Two free parking sessions", type: "Free Session", totalAllowance: 2, used: 1 },
      { id: "fuel_discount_1", label: "1% discount on fuel payments", type: "Discount", totalAllowance: 100, used: 34 },
      { id: "free_carwash_1", label: "One free car wash", type: "Free Session", totalAllowance: 1, used: 0 },
      { id: "toll_cashback", label: "Toll cashback benefit (AED 0.20/crossing)", type: "Cashback", totalAllowance: 40, used: 18 },
    ],
    activeSubscribers: 4210,
    expiryDays: 30,
    eligibility: "All Salik customers with an active wallet",
    partnerContribution: [{ partnerName: "Washmen", benefit: "One free car wash per cycle" }, { partnerName: "ENOC", benefit: "1% fuel discount funding" }],
  },
  {
    id: "bnd_ev_driver",
    name: "EV Driver Bundle",
    priceAed: 79,
    billingCycle: "Monthly",
    benefits: [
      { id: "ev_discount_5", label: "5% discount on EV charging sessions", type: "Discount", totalAllowance: 100, used: 61 },
      { id: "priority_reservation", label: "Priority charger reservation", type: "Priority Access", totalAllowance: 999, used: 12 },
      { id: "parking_discount_ev", label: "10% parking discount at EV-enabled facilities", type: "Discount", totalAllowance: 100, used: 22 },
      { id: "charging_alerts", label: "Charging-session push notifications", type: "Priority Access", totalAllowance: 999, used: 88 },
    ],
    activeSubscribers: 1380,
    expiryDays: 30,
    eligibility: "Customers with at least one registered EV",
    partnerContribution: [{ partnerName: "DEWA", benefit: "Charging discount funding" }],
  },
  {
    id: "bnd_premium_mobility",
    name: "Premium Mobility Bundle",
    priceAed: 149,
    billingCycle: "Monthly",
    benefits: [
      { id: "free_parking_3", label: "Three free parking sessions", type: "Free Session", totalAllowance: 3, used: 2 },
      { id: "free_carwash_2", label: "Two free car washes", type: "Free Session", totalAllowance: 2, used: 1 },
      { id: "fuel_discount_3", label: "3% discount on fuel payments", type: "Discount", totalAllowance: 100, used: 47 },
      { id: "priority_support", label: "Priority customer support", type: "Priority Access", totalAllowance: 999, used: 3 },
      { id: "toll_rewards", label: "Toll rewards — 1 point per AED spent", type: "Cashback", totalAllowance: 500, used: 210 },
    ],
    activeSubscribers: 960,
    expiryDays: 30,
    eligibility: "Invite-only / top-tier customer segment",
    partnerContribution: [{ partnerName: "Washmen", benefit: "Two free car washes per cycle" }, { partnerName: "ENOC", benefit: "3% fuel discount funding" }, { partnerName: "Parkin", benefit: "Free parking session funding" }],
  },
];

export const BUNDLE_UTILIZATION_TREND = Array.from({ length: 6 }, (_, i) => {
  const month = new Date(Date.now() - (5 - i) * 30 * 86400000).toLocaleDateString("en-US", { month: "short" });
  return {
    month,
    everydayDriver: Math.round(3200 + i * 180 + rnd() * 200),
    evDriver: Math.round(900 + i * 90 + rnd() * 120),
    premiumMobility: Math.round(700 + i * 40 + rnd() * 80),
  };
});

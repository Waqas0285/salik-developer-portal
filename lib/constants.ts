import type { PersonaId } from "@/types";

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: string; // lucide icon name, resolved in Sidebar
  personas: PersonaId[]; // which personas see this item
}

// Persona shorthand used across `personas` arrays below:
// PD partner_developer | PB partner_business | PM product_manager
// TA tech_admin | OPS operations | MGMT management
export const ALL_PERSONAS: PersonaId[] = [
  "partner_developer",
  "partner_business",
  "product_manager",
  "tech_admin",
  "operations",
  "management",
];

const PD: PersonaId = "partner_developer";
const PB: PersonaId = "partner_business";
const PM: PersonaId = "product_manager";
const TA: PersonaId = "tech_admin";
const OPS: PersonaId = "operations";
const MGMT: PersonaId = "management";

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", personas: ALL_PERSONAS },
  { key: "marketplace", label: "API Marketplace", href: "/marketplace", icon: "Store", personas: ALL_PERSONAS },
  { key: "api-products", label: "API Products", href: "/api-products", icon: "PackageSearch", personas: [PB, PM, TA, OPS, MGMT] },
  { key: "applications", label: "My Applications", href: "/applications", icon: "AppWindow", personas: [PD, PB, TA] },
  { key: "subscriptions", label: "API Subscriptions", href: "/subscriptions", icon: "ListChecks", personas: [PD, PB, PM, TA] },
  { key: "sandbox", label: "Sandbox", href: "/sandbox", icon: "FlaskConical", personas: [PD, TA] },
  { key: "api-explorer", label: "API Explorer", href: "/api-explorer", icon: "TerminalSquare", personas: [PD, TA, PM] },
  { key: "webhooks", label: "Events and Webhooks", href: "/webhooks", icon: "Webhook", personas: [PD, TA, PM] },
  { key: "sdks", label: "SDKs and Tools", href: "/sdks", icon: "Boxes", personas: [PD, TA] },
  { key: "analytics", label: "Analytics", href: "/analytics", icon: "BarChart3", personas: [PB, PM, TA, OPS, MGMT] },
  { key: "transactions", label: "Transactions", href: "/transactions", icon: "Receipt", personas: [PB, TA, OPS, MGMT, PD] },
  { key: "errors", label: "Error Analytics", href: "/errors", icon: "AlertTriangle", personas: [TA, OPS, PM] },
  { key: "health", label: "API Health", href: "/health", icon: "Activity", personas: [TA, OPS, PM] },
  { key: "sla", label: "SLA Management", href: "/sla", icon: "ShieldCheck", personas: [TA, OPS, PM, MGMT] },
  { key: "monitoring", label: "Monitoring", href: "/health", icon: "MonitorDot", personas: [TA, OPS] },
  { key: "security", label: "Security", href: "/security", icon: "KeyRound", personas: [TA, PD] },
  { key: "partners", label: "Partner Management", href: "/partners", icon: "Handshake", personas: [PB, PM, OPS, MGMT] },
  { key: "revenue", label: "Revenue and Commercials", href: "/revenue", icon: "TrendingUp", personas: [PB, MGMT, PM] },
  { key: "bundles", label: "Mobility Bundles", href: "/bundles", icon: "Gift", personas: [PB, PM, MGMT, OPS] },
  { key: "support", label: "Support Center", href: "/support", icon: "LifeBuoy", personas: ALL_PERSONAS },
  { key: "notifications", label: "Notifications", href: "/notifications", icon: "Bell", personas: ALL_PERSONAS },
  { key: "documentation", label: "Documentation", href: "/documentation", icon: "BookOpen", personas: ALL_PERSONAS },
  { key: "administration", label: "Administration", href: "/administration", icon: "Settings2", personas: [PM, TA] },
  { key: "versions", label: "Versioning", href: "/versions", icon: "GitBranch", personas: [PD, TA, PM] },
  { key: "profile", label: "User Profile", href: "/profile", icon: "UserCircle", personas: ALL_PERSONAS },
  { key: "settings", label: "Settings", href: "/settings", icon: "Settings", personas: ALL_PERSONAS },
];

export const PERSONA_LANDING: Record<PersonaId, string> = {
  partner_developer: "/dashboard",
  partner_business: "/dashboard",
  product_manager: "/dashboard",
  tech_admin: "/health",
  operations: "/health",
  management: "/dashboard",
};

export const STATUS_COLORS: Record<string, string> = {
  // generic
  Success: "text-success bg-success-light",
  Failed: "text-danger bg-danger-light",
  Pending: "text-warn bg-warn-light",
  Timeout: "text-warn bg-warn-light",
  Active: "text-success bg-success-light",
  Inactive: "text-muted bg-charcoal-100 dark:bg-charcoal-800",
  Suspended: "text-danger bg-danger-light",
  Published: "text-success bg-success-light",
  Draft: "text-muted bg-charcoal-100 dark:bg-charcoal-800",
  Deprecated: "text-warn bg-warn-light",
  Retired: "text-danger bg-danger-light",
  Approved: "text-success bg-success-light",
  Rejected: "text-danger bg-danger-light",
  "Under Review": "text-info bg-info-light",
  Submitted: "text-info bg-info-light",
  "Additional Information Required": "text-warn bg-warn-light",
  Expired: "text-danger bg-danger-light",
  Cancelled: "text-muted bg-charcoal-100 dark:bg-charcoal-800",
  Healthy: "text-success bg-success-light",
  Degraded: "text-warn bg-warn-light",
  "Partial Outage": "text-warn bg-warn-light",
  "Major Outage": "text-danger bg-danger-light",
  Maintenance: "text-info bg-info-light",
  Delivered: "text-success bg-success-light",
  Retrying: "text-warn bg-warn-light",
  Disabled: "text-muted bg-charcoal-100 dark:bg-charcoal-800",
  Open: "text-info bg-info-light",
  "In Progress": "text-info bg-info-light",
  "Waiting on Partner": "text-warn bg-warn-light",
  Resolved: "text-success bg-success-light",
  Closed: "text-muted bg-charcoal-100 dark:bg-charcoal-800",
  Valid: "text-success bg-success-light",
  "Expiring Soon": "text-warn bg-warn-light",
};

export const DEMO_DISCLAIMER =
  "Salik API Developer Portal Demo — All APIs, data, credentials, partners, transactions, pricing, SLA values, and commercial information shown in this application are fictional and intended for demonstration purposes only.";

export const CODE_LANGUAGES = [
  "cURL",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Go",
  "Kotlin",
  "Swift",
  "Flutter",
] as const;

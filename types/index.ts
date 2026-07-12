// Central type definitions for the Salik API Developer Portal demo.
// Everything here backs 100% mocked data — no live schema/back end exists.

export type PersonaId =
  | "partner_developer"
  | "partner_business"
  | "product_manager"
  | "tech_admin"
  | "operations"
  | "management";

export interface DemoUser {
  id: string;
  name: string;
  persona: PersonaId;
  personaLabel: string;
  organization: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  title: string;
}

export type Environment = "sandbox" | "production";

export type ApiCategory =
  | "Toll"
  | "Parking"
  | "Access Management"
  | "Wallet & Payments"
  | "Fuel"
  | "EV Charging"
  | "Car Wash"
  | "Vehicle Services"
  | "Customer"
  | "Subscription & Loyalty"
  | "AI & Data";

export type LifecycleStatus =
  | "Draft"
  | "Design"
  | "Development"
  | "Testing"
  | "Security Review"
  | "UAT"
  | "Approved"
  | "Published"
  | "Deprecated"
  | "Retired";

export type AuthType = "API Key" | "OAuth 2.0 Client Credentials" | "OAuth 2.0 Authorization Code" | "mTLS + API Key";

export interface ApiEndpointParam {
  name: string;
  in: "path" | "query" | "header";
  type: string;
  required: boolean;
  description: string;
  example?: string;
  enum?: string[];
}

export interface ApiSchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string | number | boolean;
  enum?: string[];
}

export interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  description: string;
  parameters: ApiEndpointParam[];
  requestBody?: ApiSchemaField[];
  responseSchema: ApiSchemaField[];
  successExample: Record<string, unknown>;
  errorExamples: { status: number; code: string; example: Record<string, unknown> }[];
  requiresIdempotencyKey?: boolean;
}

export interface ApiVersion {
  version: string;
  status: "current" | "beta" | "deprecated" | "sunset";
  releasedOn: string;
  sunsetOn?: string;
  changes: string[];
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  includedApiIds: string[];
  intendedPartnerType: string;
  plans: string[];
  monthlyFeeAed: number;
  transactionFeePercent: number;
  includedApiCalls: number;
  overageRatePer1000Aed: number;
  tpsLimit: number;
  sla: string;
  supportTier: "Community" | "Standard" | "Priority" | "Dedicated";
  sandboxAvailable: boolean;
  productionAvailable: boolean;
}

export interface ApiDefinition {
  id: string;
  name: string;
  shortDescription: string;
  category: ApiCategory;
  version: string;
  lifecycleStatus: LifecycleStatus;
  authType: AuthType;
  environments: Environment[];
  sla: string;
  rateLimitPerMin: number;
  dailyQuota: number;
  peakTps: number;
  pricingStatus: "Free" | "Metered" | "Subscription" | "Contact Sales";
  subscribers: number;
  popularity: number; // 0-100
  lastUpdated: string;
  owner: string;
  technicalOwner: string;
  tags: string[];
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  businessPurpose: string;
  keyUseCases: string[];
  intendedConsumers: string[];
  responseTimeTargetMs: number;
  dataClassification: "Public" | "Internal" | "Confidential" | "Restricted";
  productionReadiness: "Ready" | "Limited GA" | "Beta" | "Not Ready";
  dependencyServices: string[];
  avgLatencyMs: number;
  successRate: number;
  endpoints: ApiEndpoint[];
  versions: ApiVersion[];
}

export type SubscriptionStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Additional Information Required"
  | "Approved"
  | "Rejected"
  | "Suspended"
  | "Expired"
  | "Cancelled";

export interface ApprovalChecklistItem {
  key: string;
  label: string;
  done: boolean;
}

export interface Subscription {
  id: string;
  apiOrProductId: string;
  apiOrProductName: string;
  applicationId: string;
  applicationName: string;
  partnerId: string;
  partnerName: string;
  environment: Environment;
  plan: string;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
  approvalChecklist: ApprovalChecklistItem[];
}

export type AppStatus = "Active" | "Inactive" | "Pending" | "Suspended";

export interface Application {
  id: string;
  name: string;
  partnerId: string;
  partnerName: string;
  description: string;
  environment: Environment;
  status: AppStatus;
  clientId: string;
  clientSecret: string;
  apiKey: string;
  oauthScopes: string[];
  certificateStatus: "Valid" | "Expiring Soon" | "Expired" | "Not Configured";
  redirectUrls: string[];
  allowedIps: string[];
  webhookUrl?: string;
  subscribedApiIds: string[];
  createdAt: string;
  lastActivity: string;
  secretRotatedAt?: string;
}

export type PartnerCategory =
  | "Retail & Mall"
  | "Fuel Retailer"
  | "Utilities"
  | "Government"
  | "Aviation"
  | "Mobility"
  | "Parking Operator"
  | "Car Wash"
  | "Insurance"
  | "Fintech";

export type PartnerStatus = "Prospect" | "Onboarding" | "Active" | "Suspended" | "Rejected";

export interface Partner {
  id: string;
  name: string;
  category: PartnerCategory;
  status: PartnerStatus;
  environment: Environment;
  integrationStatus: "Not Started" | "In Progress" | "Live" | "Blocked";
  applicationsCount: number;
  subscribedApiIds: string[];
  monthlyApiCalls: number;
  revenueAed: number;
  slaCompliance: number;
  openTickets: number;
  securityStatus: "Compliant" | "Review Needed" | "Non-Compliant";
  onboardingProgress: number;
  commercialPlan: string;
  primaryContact: { name: string; email: string; phone: string };
  technicalContact: { name: string; email: string; phone: string };
  joinedAt: string;
  logoInitial: string;
  color: string;
}

export type TransactionCategory =
  | "Toll"
  | "Parking"
  | "Fuel"
  | "EV Charging"
  | "Car Wash"
  | "Wallet"
  | "Refund"
  | "Subscription"
  | "Vehicle Services";

export type TransactionStatus = "Success" | "Failed" | "Pending" | "Timeout";

export interface TransactionEvent {
  ts: string;
  label: string;
  detail: string;
}

export type Region = "Dubai" | "Abu Dhabi" | "Sharjah" | "Northern Emirates";

export interface Transaction {
  id: string;
  correlationId: string;
  timestamp: string;
  partnerId: string;
  partnerName: string;
  customerName: string;
  vehiclePlate: string;
  useCase: string;
  region: Region;
  apiId: string;
  apiName: string;
  category: TransactionCategory;
  amountAed: number;
  status: TransactionStatus;
  responseCode: number;
  latencyMs: number;
  environment: Environment;
  failureReason?: string;
  lifecycle: TransactionEvent[];
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
  retryCount: number;
}

export type ErrorCategory =
  | "Authentication"
  | "Authorization"
  | "Validation"
  | "Business Rule"
  | "Wallet"
  | "Partner"
  | "Timeout"
  | "Network"
  | "Gateway"
  | "Backend"
  | "Dependency Failure"
  | "Rate Limit"
  | "Duplicate Transaction"
  | "Fraud/Risk";

export interface ErrorRecord {
  id: string;
  timestamp: string;
  apiId: string;
  apiName: string;
  endpoint: string;
  partnerId: string;
  partnerName: string;
  applicationName: string;
  environment: Environment;
  httpStatus: number;
  category: ErrorCategory;
  message: string;
  impactedCustomers: number;
  rootCause: string;
  recommendedAction: string;
  mttrMinutes: number;
}

export type WebhookDeliveryStatus = "Delivered" | "Failed" | "Retrying" | "Disabled" | "Pending";

export interface WebhookEventType {
  id: string;
  name: string;
  category: TransactionCategory | "Account" | "Subscription" | "Vehicle";
  description: string;
}

export interface Webhook {
  id: string;
  applicationId: string;
  applicationName: string;
  url: string;
  events: string[];
  authType: "None" | "HMAC Signature" | "Bearer Token" | "Basic Auth";
  signingSecret: string;
  retryPolicy: "Linear" | "Exponential" | "None";
  timeoutSeconds: number;
  active: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  status: WebhookDeliveryStatus;
  attempt: number;
  timestamp: string;
  requestPayload: Record<string, unknown>;
  responseStatus: number | null;
  responseBody: string;
}

export type NotificationType =
  | "API Published"
  | "API Version Updated"
  | "API Deprecated"
  | "API Sunset Announced"
  | "Subscription Approved"
  | "Subscription Rejected"
  | "Key Expiring"
  | "Certificate Expiring"
  | "SLA Warning"
  | "Incident Started"
  | "Incident Resolved"
  | "Maintenance Scheduled"
  | "Quota Nearing Limit"
  | "Rate Limit Exceeded"
  | "Support Ticket Updated"
  | "Webhook Failed";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: "info" | "warning" | "critical" | "success";
  link?: string;
}

export type TicketStatus = "Open" | "In Progress" | "Waiting on Partner" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  severity: "SEV-1" | "SEV-2" | "SEV-3" | "SEV-4";
  status: TicketStatus;
  assignedTeam: string;
  partnerName: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  slaDueAt: string;
  comments: { author: string; timestamp: string; message: string }[];
  resolutionNotes?: string;
}

export interface MonitoringSnapshot {
  date: string;
  availability: number;
  uptimeMinutes: number;
  avgResponseMs: number;
  requestVolume: number;
  tps: number;
  failedTps: number;
  errorRate: number;
  timeoutRate: number;
  incidents: number;
}

export type ServiceHealthStatus = "Healthy" | "Degraded" | "Partial Outage" | "Major Outage" | "Maintenance";

export interface ServiceHealth {
  id: string;
  name: string;
  status: ServiceHealthStatus;
  availability: number;
  avgResponseMs: number;
  tps: number;
  failedTps: number;
  errorRate: number;
  lastDeployment: string;
  dependsOn: string[];
}

export interface MonthlyAnalytics {
  month: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgLatencyMs: number;
  p50: number;
  p95: number;
  p99: number;
  peakTps: number;
  failedTps: number;
  revenueAed: number;
}

export interface BundleBenefit {
  id: string;
  label: string;
  type: "Free Session" | "Discount" | "Cashback" | "Priority Access";
  totalAllowance: number;
  used: number;
}

export interface MobilityBundle {
  id: string;
  name: string;
  priceAed: number;
  billingCycle: "Monthly" | "Quarterly" | "Annual";
  benefits: BundleBenefit[];
  activeSubscribers: number;
  expiryDays: number;
  eligibility: string;
  partnerContribution: { partnerName: string; benefit: string }[];
}

export interface SdkItem {
  id: string;
  name: string;
  language: string;
  version: string;
  description: string;
  installCommand: string;
}

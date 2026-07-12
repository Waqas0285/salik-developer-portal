# Salik API Developer Portal — Demo

An enterprise-grade demo of a Salik API Developer Portal: a single Next.js application that lets partners, developers, and internal Salik teams discover, test, subscribe to, and monitor mobility APIs across toll, parking, wallet, fuel, EV charging, car wash, vehicle services, customer, subscription/loyalty, and AI/data domains.

**This is a demonstration application. There is no database, no real API gateway, no payment platform, no identity provider, and no backend server.** Every API response, transaction, credential, and metric is generated from local TypeScript/JSON data and in-memory React state. Nothing in this app makes a real network call to Salik or any third party.

---

## 1. Installation & running

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. You'll land on the login screen — pick any of the six demo personas and click **Enter Portal**.

Other scripts:

```bash
npm run build      # production build
npm run start       # run the production build
npm run lint        # ESLint (next/core-web-vitals)
npm run typecheck   # tsc --noEmit
```

> **Note on this build:** this codebase was generated in a sandboxed environment without access to the npm registry, so `npm install`, `next build`, `tsc`, and `eslint` could not be executed or verified here. The code was written and manually reviewed for correctness (import resolution, brace/paren balance, Tailwind class validity, etc.), but you should run `npm run typecheck` and `npm run lint` yourself after installing dependencies, as the final validation step, before treating it as production-ready.

Requires Node.js 18.18+ (Next.js 14 requirement).

---

## 2. Demo users

No authentication is required — select a persona on the login screen:

| Name | Persona | Organization | Default landing page |
|---|---|---|---|
| Ahmed Al Marzooqi | Partner Developer | ENOC Digital Services | Dashboard |
| Fatima Al Suwaidi | Partner Business Manager | Majid Al Futtaim | Dashboard |
| Sara Al Hashimi | Salik API Product Manager | Salik | Dashboard |
| Omar Al Zaabi | Salik Technology Administrator | Salik | API Health |
| Khalid Al Nuaimi | Salik Operations User | Salik | API Health |
| Maryam Al Balushi | Salik Management User | Salik | Dashboard |

Each persona sees a different set of sidebar items (defined in `lib/constants.ts` → `NAV_ITEMS[].personas`), and you can switch persona at any time from the account menu in the top bar — permissions and navigation update immediately.

---

## 3. Feature overview

- **Executive Dashboard** — 19 KPI cards, 12+ charts, and a 7-dimension filter bar (date range, API, partner, domain, environment, region, status), plus a period-comparison panel (MoM, YoY, quarter/half-year/full-year forecasts).
- **API Marketplace** — 30 seeded APIs across 11 categories, full-text search, category/sort filters, Featured/Trending/New/Recommended/Recently-Updated/Favorites views, side-by-side compare (up to 4 APIs), and a subscribe flow.
- **API detail pages** — 14-tab layout (Overview, Documentation, Try It, Authentication, Endpoints, Schemas, Examples, Errors, SLAs & Limits, Pricing, Versions, Changelog, SDKs, Support).
- **Swagger-style documentation viewer** — expandable endpoint groups, full parameter/schema/example tables, error catalogues, and a live-generated OpenAPI 3.0 spec with Visual/YAML/JSON toggle, copy, and download. 10 flagship APIs (Parking Payment, Parking Session, Salik Wallet, Toll Transaction, EV Charging Session, Fuel Payment, Refund, Customer Profile, Mobility Bundle, Congestion Prediction) have fully hand-authored, realistic endpoint definitions; the remaining 20 APIs get a representative generated endpoint.
- **API Explorer / Try-It-Out** — endpoint/environment/auth selection, path/query param and header editors, a Monaco-powered JSON body editor, an 11-scenario "Simulate Error" toggle, mock response viewer (status/body/headers/latency/size/correlation ID), code samples in 11 languages, request history, and saved requests (persisted to `localStorage`).
- **My Applications** — create/edit/delete applications, environment selection, redirect URLs, IP allow-listing, webhook URL, API assignment, credential view/rotate/revoke, and a per-application usage chart.
- **API Subscriptions** — full workflow (API/product → application → environment → plan → SLA review → terms → submit), 9 subscription statuses, and an 8-item production approval checklist with per-item toggle buttons.
- **Sandbox** — reference test entities (customers, vehicles, toll gates, parking, fuel stations, EV chargers, car wash locations, merchants) plus one-click actions (start/complete parking, toll passage, EV charging, fuel purchase, refund, wallet top-up, webhook trigger) that all append real rows to Transaction History.
- **Events & Webhooks** — 22-event catalog, webhook creation (URL, events, auth, signing secret, retry policy, timeout), activate/deactivate, send-test-event, and a delivery log with retry.
- **SDKs & Tools** — 11 language SDKs plus Postman/Insomnia collections, OpenAPI bundle, CLI, and signing/verification utilities — all downloadable as real local files (generated client-side, not fetched).
- **API Products** — 10 commercial bundles with plans, pricing, TPS limits, and included-API breakdowns (all explicitly marked as mock pricing).
- **Analytics** — 19 KPIs and 11 charts across a 7-filter bar (date, partner, API, environment, response code, region, use case).
- **Transactions** — searchable/sortable/paginated table across 9 categories, CSV/JSON export, and a detail page with full lifecycle, request/response payloads, related webhook events, and one-click refund.
- **Error Analytics** — grouping by API/partner/category/environment/status/endpoint, AI-style root-cause recommendations, and a full error log table.
- **API Health & Monitoring** — service status cards that auto-refresh every 5 seconds, a dependency map, and 30-day availability/volume trends.
- **SLA Management** — per-API and per-partner target-vs-actual tables for availability, latency, error rate, and TPS, with compliance/breach badges and mock service credits.
- **Security** — credential view/generate/rotate/revoke, certificate upload, IP allow-listing, OAuth scope configuration, suspicious-activity feed, and an audit log.
- **Partner Management** — 12 seeded partners with full profiles, approve/suspend/reject/activate actions, commercial plan changes, API product assignment, and a 5-dimension scorecard.
- **Revenue & Commercials** — total/subscription/transaction-fee revenue, revenue-by-partner/API/product/domain, and linear-regression forecasts for next month/quarter/half-year/full-year.
- **Support Center** — ticket creation with priority/category, SLA due-time, comment threads, resolution notes, and an FAQ/guides knowledge base.
- **Notification Center** — 16 notification types, mark-as-read/mark-all/delete/filter-by-type, and a preferences dialog.
- **API Administration** — lifecycle management (Draft → … → Retired) with inline status changes, OpenAPI import + JSON validation, and new-API creation.
- **Versioning** — per-API version history, side-by-side version compare, and a migration-guide panel.
- **Mobility Bundles** — 3 bundles with per-benefit usage bars, simulated consumption, renewal, and a 6-month utilization trend chart.
- **AI Assistant** — a floating, keyword-matched assistant (no external AI call) that answers the example questions from the spec with steps, links, and code snippets.
- **Dark mode**, **responsive layout**, and **localStorage-persisted** persona, theme, saved requests, and request history.

---

## 4. Project structure

```
app/
  login/                    Persona login screen
  (portal)/                 Route group sharing the authenticated shell
    dashboard/ marketplace/ apis/[id]/ api-products/ applications/[id]/
    subscriptions/ sandbox/ api-explorer/ webhooks/ sdks/ analytics/
    transactions/[id]/ errors/ health/ sla/ security/ partners/[id]/
    revenue/ bundles/ support/ notifications/ documentation/
    administration/ versions/ profile/ settings/
    layout.tsx               Renders <PortalShell>

components/
  layout/     Sidebar, Topbar, Footer, PortalShell
  common/     Providers (Persona, Notifications, AppData, Toast), KpiCard,
              PageHeader, EmptyState, Skeleton, CodeEditor, SalikLogo, ...
  charts/     Recharts wrappers (line/area/bar/pie) + ChartCard
  api/        ApiCard, SwaggerViewer, TryItPanel, SubscribeDialog
  forms/      React Hook Form + Zod forms (ApplicationForm, ...)
  tables/     Generic sortable/paginated DataTable
  ui/         Button, Card, Badge, Input/Select/Textarea, Dialog, Tabs
  ai/         Floating AI Assistant
  theme/      next-themes wrapper + toggle
  persona/    Persona context/provider

data/          All seed data (TypeScript, no JSON parsing needed):
               apis.ts, apiProducts.ts, partners.ts, applications.ts,
               subscriptions.ts, transactions.ts, errors.ts, webhooks.ts,
               notifications.ts, supportTickets.ts, users.ts, monitoring.ts,
               analytics.ts, revenue.ts, bundles.ts, sandboxEntities.ts, sdks.ts

services/      mockApiService, mockAuthService, mockAnalyticsService,
               mockTransactionService, mockWebhookService — every mock
               call goes through here and simulates latency via delay()

hooks/         useLocalStorage
lib/           utils.ts (formatting, seeded RNG), constants.ts (nav/status
               maps), icon-map.tsx, openapi.ts (spec generator)
types/         Every shared TypeScript interface/type
```

**Key architectural decision:** most interactive state (applications, subscriptions, webhooks, tickets, transactions, partners, favorites, compare list) lives in one `AppDataProvider` React context, seeded from the `data/` files. This is what makes actions cross-page-consistent — for example, a sandbox-simulated toll passage immediately shows up in Transaction History, and approving a subscription immediately updates its badge everywhere it's shown. State resets on page reload (there's no backend to persist it to), which is expected for a demo.

---

## 5. Implemented demo workflows

- Login → persona selection → persona-scoped navigation and dashboard.
- Browse Marketplace → filter/sort/search → view API detail → Try It → Subscribe → track status in Subscriptions → advance the production approval checklist → get a mock approval notification.
- Create Application → generate credentials → assign APIs → configure redirect URLs/IPs/webhook → rotate/revoke credentials.
- API Explorer: pick API/endpoint → configure request → toggle a failure scenario → execute → inspect response → copy a code sample → save/replay from history.
- Sandbox: create a test customer/vehicle → top up wallet → simulate a parking/toll/fuel/EV/refund transaction → see it appear in Transaction History → trigger a webhook and see the delivery in Webhooks → Delivery Logs.
- Partner Management: approve/suspend a partner → assign an API product → change commercial plan → view scorecard.
- Support: file a ticket → add comments → mark resolved/closed.
- Notifications: mark read/unread, filter, delete, configure preferences.
- Administration: change an API's lifecycle status, import/validate an OpenAPI JSON document, create a new draft API.
- Dark mode toggle, persona switch, and all saved preferences persist across reloads via `localStorage`.

---

## 6. What's mocked (and how)

- **All data** — 30 APIs, 10 API products, 12 partners, 15 applications, 20 subscriptions, 200 transactions, 50 errors, 20 webhook deliveries, 20 notifications, 20 support tickets, 12 months of analytics/revenue, 30 days of monitoring — generated with a seeded PRNG (`mulberry32`) so numbers are stable across renders (no hydration mismatches) but look realistic.
- **API responses** — `services/mockApiService.ts` simulates network latency (`delay()`) and returns one of 11 canned success/error payloads based on the "Simulate Error" scenario you pick.
- **Credentials** — generated client-side with a random string generator; nothing is a real secret and nothing is transmitted anywhere.
- **OpenAPI specs** — generated on the fly from the same endpoint data that powers the Swagger-style viewer (`lib/openapi.ts`), so the visual docs and the downloaded spec can never drift apart.
- **Forecasts** — a transparent least-squares linear regression over the trailing 12-month series (`lib/utils.ts` → `linearForecast`), not a black-box model.
- **Auto-refresh** on the Health page — a `setInterval` that jitters the seeded numbers every 5 seconds.
- **File downloads** (SDKs, Postman collections, OpenAPI bundles, transaction exports) — real `Blob`/`URL.createObjectURL` downloads of generated text/JSON, no server involved.

---

## 7. Known limitations

- **No persistence.** All create/edit/delete actions live in React state (`AppDataProvider`) and reset on a full page reload. There is no database, so this is expected demo behavior, not a bug.
- **"Same period last year" figures are illustrative.** The seed dataset covers a trailing 12-month window; quarter/half-year/full-year year-over-year comparisons use the earliest point in that same window as a stand-in for true prior-year data (this is called out in-app on the Dashboard and Revenue pages).
- **TPS/Failed TPS figures on Analytics are labeled "illustrative."** They're derived from a 200-row transaction sample scaled to the selected date range, not a real production-scale event stream.
- **Only 20 of 30 APIs have full, hand-authored endpoint definitions** (the 10 explicitly requested flagship APIs plus 10 more); the remaining APIs get one representative generated endpoint so every API is still fully usable in the Explorer and Swagger viewer.
- **Application-level analytics, "usage by endpoint," and "usage by application" charts are approximated** from the partner/API-level transaction sample, since the mock transaction log doesn't track per-application or per-endpoint granularity.
- **API Administration's lifecycle changes are local to that page's session** and don't propagate back to the Marketplace catalog, to avoid a much larger state-management refactor for what is fundamentally a demo of the workflow, not a production catalog sync.
- **No real authentication, authorization, or session security** — this is explicitly out of scope per the brief.
- **This build was not run through `npm install` / `next build` / `tsc` / `eslint`** in the environment that generated it (no npm registry access there). Please run `npm run typecheck` and `npm run lint` after installing dependencies as your own final check.

---

## 8. Screenshots

_Add screenshots here after running the app locally — e.g. `docs/screenshots/dashboard.png`, `marketplace.png`, `api-explorer.png`, `sandbox.png`._

---

## 9. Future integration recommendations

If this demo were to become a real product, the natural next steps would be:

- Replace `data/*.ts` with a real Postgres/Supabase schema and swap `services/mock*.ts` for actual HTTP calls to a real API gateway.
- Replace the local `AppDataProvider` state with server-persisted resources (a real REST/GraphQL API) plus optimistic UI updates.
- Wire real authentication (OAuth 2.0 / OIDC via an identity provider) in place of the persona selector.
- Wire the OpenAPI generator (`lib/openapi.ts`) to a real API gateway's route registry so the spec is always in sync with what's actually deployed.
- Replace the linear-regression forecasts with a real time-series model once enough historical data exists.
- Add real webhook delivery (with retries, dead-lettering, and signature verification) via a message queue.

---

**Disclaimer:** Salik API Developer Portal Demo — all APIs, data, credentials, partners, transactions, pricing, SLA values, and commercial information shown in this application are fictional and intended for demonstration purposes only.

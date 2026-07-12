"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Scale, GitBranch, LifeBuoy, Download } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Card, CardContent } from "@/components/ui/Card";
import { SwaggerViewer } from "@/components/api/SwaggerViewer";
import { TryItPanel } from "@/components/api/TryItPanel";
import { SubscribeDialog } from "@/components/api/SubscribeDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { useAppData } from "@/components/common/AppDataProvider";
import { getApiById } from "@/data/apis";
import { API_PRODUCTS } from "@/data/apiProducts";
import { SDKS } from "@/data/sdks";
import { FAQS } from "@/data/supportTickets";
import { downloadFile } from "@/services/mockTransactionService";
import { buildOpenApiSpec } from "@/lib/openapi";
import { formatDate } from "@/lib/utils";

export default function ApiDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const api = getApiById(params.id);
  const { favorites, toggleFavorite, compareList, toggleCompare } = useAppData();
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  if (!api) {
    return (
      <EmptyState icon={ArrowLeft} title="API not found" description="This API may have been retired or the link is incorrect."
        action={<Link href="/marketplace"><Button variant="outline" size="sm">Back to Marketplace</Button></Link>} />
    );
  }

  const includedInProducts = API_PRODUCTS.filter((p) => p.includedApiIds.includes(api.id) || p.includedApiIds.length === 0);
  const allErrors = Array.from(new Map(api.endpoints.flatMap((e) => e.errorExamples).map((e) => [`${e.status}-${e.code}`, e])).values());
  const allSchemaFields = Array.from(
    new Map(api.endpoints.flatMap((e) => [...(e.requestBody ?? []), ...e.responseSchema]).map((f) => [f.name, f])).values()
  );
  const changelog = api.versions.flatMap((v) => v.changes.map((c) => ({ version: v.version, date: v.releasedOn, change: c }))).reverse();

  return (
    <div>
      <button onClick={() => router.push("/marketplace")} className="mb-3 flex items-center gap-1 text-xs text-muted hover:text-current">
        <ArrowLeft size={13} /> Back to Marketplace
      </button>

      <PageHeader
        title={api.name}
        description={api.shortDescription}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toggleFavorite(api.id)}>
              <Heart size={14} fill={favorites.includes(api.id) ? "currentColor" : "none"} className={favorites.includes(api.id) ? "text-danger" : ""} />
              {favorites.includes(api.id) ? "Favorited" : "Favorite"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggleCompare(api.id)}>
              <Scale size={14} /> {compareList.includes(api.id) ? "Remove compare" : "Compare"}
            </Button>
            <Button size="sm" onClick={() => setSubscribeOpen(true)}>Subscribe</Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        <Badge label={api.category} className="bg-info-light text-info" />
        <Badge label={api.lifecycleStatus} status={api.lifecycleStatus} />
        <Badge label={`v${api.version.replace("v", "")}`} className="bg-charcoal-100 text-muted dark:bg-charcoal-800" />
        <Badge label={api.authType} className="bg-charcoal-100 text-muted dark:bg-charcoal-800" />
        {api.environments.map((e) => <Badge key={e} label={e} className="bg-salik-100 text-salik-700 dark:bg-salik-950/50 dark:text-salik-300" />)}
      </div>

      <Tabs
        defaultTab="overview"
        tabs={[
          {
            key: "overview", label: "Overview", content: (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardContent className="space-y-4">
                    <Section title="Business purpose" text={api.businessPurpose} />
                    <div>
                      <p className="mb-1.5 text-xs font-semibold">Key use cases</p>
                      <ul className="list-inside list-disc space-y-1 text-xs text-muted">{api.keyUseCases.map((u) => <li key={u}>{u}</li>)}</ul>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-semibold">Intended consumers</p>
                      <div className="flex flex-wrap gap-1.5">{api.intendedConsumers.map((c) => <Badge key={c} label={c} className="bg-charcoal-100 text-muted dark:bg-charcoal-800" />)}</div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-semibold">Dependency services</p>
                      <div className="flex flex-wrap gap-1.5">{api.dependencyServices.map((c) => <Badge key={c} label={c} className="bg-warn-light text-warn" />)}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-2.5 text-xs">
                    <Row k="API owner" v={api.owner} />
                    <Row k="Technical owner" v={api.technicalOwner} />
                    <Row k="Environments" v={api.environments.join(", ")} />
                    <Row k="Auth requirement" v={api.authType} />
                    <Row k="Rate limit" v={`${api.rateLimitPerMin} req/min`} />
                    <Row k="Daily quota" v={api.dailyQuota.toLocaleString()} />
                    <Row k="Peak TPS" v={String(api.peakTps)} />
                    <Row k="Response time target" v={`${api.responseTimeTargetMs} ms`} />
                    <Row k="Data classification" v={api.dataClassification} />
                    <Row k="Production readiness" v={api.productionReadiness} />
                    <Row k="Last updated" v={formatDate(api.lastUpdated)} />
                  </CardContent>
                </Card>
              </div>
            ),
          },
          { key: "documentation", label: "Documentation", content: <SwaggerViewer api={api} /> },
          { key: "tryit", label: "Try It", content: <TryItPanel api={api} /> },
          {
            key: "auth", label: "Authentication", content: (
              <Card><CardContent className="space-y-3 text-xs">
                <p className="text-sm font-semibold">{api.authType}</p>
                <p className="text-muted">
                  {api.authType.includes("OAuth")
                    ? "Exchange your application's Client ID and Client Secret for a short-lived access token at the token endpoint, then send it as a Bearer token."
                    : api.authType.includes("mTLS")
                    ? "Present a valid client certificate on the TLS handshake in addition to your API key header."
                    : "Send your application's API key on every request using the X-API-Key header (or ApiKey scheme in Authorization)."}
                </p>
                <pre className="scrollbar-thin overflow-auto rounded-lg bg-charcoal-950 p-3 text-[11px] text-charcoal-100">
{api.authType.includes("OAuth")
  ? `POST /oauth/token\nContent-Type: application/x-www-form-urlencoded\n\ngrant_type=client_credentials&client_id=...&client_secret=...`
  : `GET ${api.endpoints[0]?.path}\nAuthorization: ApiKey sk_live_51a9f9c2b6e94b0d\nX-Correlation-Id: corr_8f2a1c90`}
                </pre>
              </CardContent></Card>
            ),
          },
          {
            key: "endpoints", label: "Endpoints", content: (
              <Card><CardContent className="space-y-1.5">
                {api.endpoints.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-lg border border-charcoal-100 px-3 py-2 text-xs dark:border-charcoal-800">
                    <span className="w-16 rounded bg-charcoal-100 px-2 py-1 text-center font-bold dark:bg-charcoal-800">{e.method}</span>
                    <span className="flex-1 font-mono">{e.path}</span>
                    <span className="text-muted">{e.summary}</span>
                  </div>
                ))}
              </CardContent></Card>
            ),
          },
          {
            key: "schemas", label: "Schemas", content: (
              <Card><CardContent>
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-charcoal-100 text-muted dark:border-charcoal-800"><th className="py-1.5">Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                  <tbody>{allSchemaFields.map((f) => (
                    <tr key={f.name} className="border-b border-charcoal-50 dark:border-charcoal-800/60">
                      <td className="py-1.5 font-mono font-medium">{f.name}</td><td>{f.type}</td><td>{f.required ? "Yes" : "No"}</td><td className="text-muted">{f.description}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </CardContent></Card>
            ),
          },
          {
            key: "examples", label: "Examples", content: (
              <div className="space-y-3">
                {api.endpoints.map((e) => (
                  <Card key={e.id}><CardContent>
                    <p className="mb-2 text-xs font-semibold">{e.method} {e.path}</p>
                    <pre className="scrollbar-thin overflow-auto rounded-lg bg-charcoal-950 p-3 text-[11px] text-charcoal-100">{JSON.stringify(e.successExample, null, 2)}</pre>
                  </CardContent></Card>
                ))}
              </div>
            ),
          },
          {
            key: "errors", label: "Errors", content: (
              <Card><CardContent>
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-charcoal-100 text-muted dark:border-charcoal-800"><th className="py-1.5">Status</th><th>Code</th><th>Message</th></tr></thead>
                  <tbody>{allErrors.map((e) => (
                    <tr key={`${e.status}-${e.code}`} className="border-b border-charcoal-50 dark:border-charcoal-800/60">
                      <td className="py-1.5"><Badge label={String(e.status)} className={e.status < 500 ? "bg-warn-light text-warn" : "bg-danger-light text-danger"} /></td>
                      <td className="font-mono">{e.code}</td>
                      <td className="text-muted">{String((e.example as { message?: string }).message ?? "")}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </CardContent></Card>
            ),
          },
          {
            key: "sla", label: "SLAs and Limits", content: (
              <Card><CardContent className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                <Row k="SLA" v={api.sla} /><Row k="Rate limit" v={`${api.rateLimitPerMin}/min`} /><Row k="Daily quota" v={api.dailyQuota.toLocaleString()} />
                <Row k="Peak TPS" v={String(api.peakTps)} /><Row k="Success rate" v={`${api.successRate}%`} /><Row k="Avg latency" v={`${api.avgLatencyMs} ms`} />
              </CardContent></Card>
            ),
          },
          {
            key: "pricing", label: "Pricing", content: (
              <Card><CardContent className="space-y-3">
                <DisclaimerBanner />
                <p className="text-xs">Pricing status: <Badge label={api.pricingStatus} className="bg-info-light text-info" /></p>
                <p className="mb-1.5 text-xs font-semibold">Included in API products</p>
                <div className="space-y-2">
                  {includedInProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-charcoal-100 px-3 py-2 text-xs dark:border-charcoal-800">
                      <Link href="/api-products" className="font-medium hover:text-salik-600">{p.name}</Link>
                      <span className="text-muted">AED {p.monthlyFeeAed.toLocaleString()}/mo + {p.transactionFeePercent}% per txn</span>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            ),
          },
          {
            key: "versions", label: "Versions", content: (
              <div className="space-y-2">
                {[...api.versions].reverse().map((v) => (
                  <Card key={v.version}><CardContent className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{v.version} <Badge label={v.status} className="ml-1 bg-info-light text-info" /></p>
                      <p className="text-xs text-muted">Released {formatDate(v.releasedOn)}{v.sunsetOn ? ` · Sunsets ${formatDate(v.sunsetOn)}` : ""}</p>
                    </div>
                    <GitBranch size={16} className="text-muted" />
                  </CardContent></Card>
                ))}
              </div>
            ),
          },
          {
            key: "changelog", label: "Changelog", content: (
              <Card><CardContent className="space-y-2">
                {changelog.map((c, i) => (
                  <div key={i} className="flex gap-3 border-b border-charcoal-50 pb-2 text-xs last:border-0 dark:border-charcoal-800/60">
                    <Badge label={c.version} className="h-fit bg-charcoal-100 text-muted dark:bg-charcoal-800" />
                    <div><p>{c.change}</p><p className="text-muted">{formatDate(c.date)}</p></div>
                  </div>
                ))}
              </CardContent></Card>
            ),
          },
          {
            key: "sdks", label: "SDKs", content: (
              <Card><CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SDKS.map((s) => (
                  <button key={s.id} onClick={() => downloadFile(`${s.id}.txt`, `${s.name}\nInstall: ${s.installCommand}\n\nThis is a mock SDK placeholder for demonstration.`)} className="flex items-center justify-between rounded-lg border border-charcoal-100 px-3 py-2 text-left text-xs hover:border-salik-400 dark:border-charcoal-800">
                    {s.language} <Download size={13} className="text-muted" />
                  </button>
                ))}
              </CardContent></Card>
            ),
          },
          {
            key: "support", label: "Support", content: (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card><CardContent className="space-y-2">
                  <p className="mb-1 text-xs font-semibold">FAQs</p>
                  {FAQS.map((f) => (
                    <details key={f.q} className="rounded-lg border border-charcoal-100 p-2.5 text-xs dark:border-charcoal-800">
                      <summary className="cursor-pointer font-medium">{f.q}</summary>
                      <p className="mt-1.5 text-muted">{f.a}</p>
                    </details>
                  ))}
                </CardContent></Card>
                <Card><CardContent className="flex flex-col items-start gap-3">
                  <LifeBuoy size={20} className="text-salik-600" />
                  <p className="text-xs text-muted">Need help integrating {api.name}? Open a support ticket and our platform team will respond within your plan&apos;s SLA window.</p>
                  <Link href="/support"><Button size="sm">Open a support ticket</Button></Link>
                </CardContent></Card>
              </div>
            ),
          },
        ]}
      />

      <SubscribeDialog api={subscribeOpen ? api : null} open={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-charcoal-50 py-1.5 last:border-0 dark:border-charcoal-800/60">
      <span className="text-muted">{k}</span><span className="text-right font-medium">{v}</span>
    </div>
  );
}
function Section({ title, text }: { title: string; text: string }) {
  return <div><p className="mb-1 text-xs font-semibold">{title}</p><p className="text-xs leading-relaxed text-muted">{text}</p></div>;
}

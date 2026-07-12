"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Copy, RefreshCw, Ban, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Input, Label, Select } from "@/components/ui/Input";
import { ChartCard } from "@/components/charts/ChartCard";
import { SimpleBarChart } from "@/components/charts/Charts";
import { EmptyState } from "@/components/common/EmptyState";
import { useAppData } from "@/components/common/AppDataProvider";
import { useToast } from "@/components/common/Toast";
import { rotateSecret, revokeKey } from "@/services/mockAuthService";
import { APIS } from "@/data/apis";
import { formatDate, maskSecret, mulberry32 } from "@/lib/utils";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { applications, updateApplication, subscriptions } = useAppData();
  const { push } = useToast();
  const app = applications.find((a) => a.id === params.id);
  const [revealSecret, setRevealSecret] = useState(false);
  const [revealKey, setRevealKey] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [newRedirect, setNewRedirect] = useState("");
  const [addApiId, setAddApiId] = useState("");

  if (!app) {
    return <EmptyState icon={ArrowLeft} title="Application not found" description="It may have been deleted." action={<Button size="sm" onClick={() => router.push("/applications")}>Back to Applications</Button>} />;
  }

  const appSubs = subscriptions.filter((s) => s.applicationId === app.id);
  const rnd = mulberry32(app.id.length * 999);
  const usage = Array.from({ length: 6 }, (_, i) => ({
    week: `W${i + 1}`,
    calls: Math.round(1200 + rnd() * 4000),
    errors: Math.round(20 + rnd() * 150),
  }));

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    push("success", `${label} copied`, "");
  }

  async function handleRotate() {
    const newSecret = await rotateSecret();
    updateApplication(app!.id, { clientSecret: newSecret, secretRotatedAt: new Date().toISOString() });
    push("success", "Client secret rotated", "Update your integration with the new secret.");
  }

  async function handleRevoke() {
    await revokeKey();
    updateApplication(app!.id, { status: "Suspended" });
    push("warning", "API key revoked", "This application can no longer authenticate.");
  }

  function addRedirect() {
    if (!newRedirect) return;
    updateApplication(app!.id, { redirectUrls: [...app!.redirectUrls, newRedirect] });
    setNewRedirect("");
  }
  function removeRedirect(url: string) {
    updateApplication(app!.id, { redirectUrls: app!.redirectUrls.filter((u) => u !== url) });
  }
  function addIp() {
    if (!newIp) return;
    updateApplication(app!.id, { allowedIps: [...app!.allowedIps, newIp] });
    setNewIp("");
  }
  function removeIp(ip: string) {
    updateApplication(app!.id, { allowedIps: app!.allowedIps.filter((i) => i !== ip) });
  }
  function addApi() {
    if (!addApiId || app!.subscribedApiIds.includes(addApiId)) return;
    updateApplication(app!.id, { subscribedApiIds: [...app!.subscribedApiIds, addApiId] });
    push("success", "API assigned", "");
    setAddApiId("");
  }
  function removeApi(id: string) {
    updateApplication(app!.id, { subscribedApiIds: app!.subscribedApiIds.filter((a) => a !== id) });
  }

  return (
    <div>
      <button onClick={() => router.push("/applications")} className="mb-3 flex items-center gap-1 text-xs text-muted hover:text-current">
        <ArrowLeft size={13} /> Back to Applications
      </button>
      <PageHeader title={app.name} description={`${app.partnerName} · ${app.description}`} actions={<Badge status={app.status} />} />

      <Tabs
        defaultTab="overview"
        tabs={[
          {
            key: "overview", label: "Overview", content: (
              <Card><CardContent className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                <Row k="Partner" v={app.partnerName} />
                <Row k="Environment" v={app.environment} />
                <Row k="Status" v={app.status} />
                <Row k="Certificate status" v={app.certificateStatus} />
                <Row k="Created" v={formatDate(app.createdAt)} />
                <Row k="Last activity" v={formatDate(app.lastActivity)} />
                <Row k="OAuth scopes" v={app.oauthScopes.join(", ") || "None"} />
                <Row k="Subscribed APIs" v={String(app.subscribedApiIds.length)} />
              </CardContent></Card>
            ),
          },
          {
            key: "credentials", label: "Credentials", content: (
              <Card><CardContent className="space-y-4">
                <CredentialRow label="Client ID" value={app.clientId} onCopy={() => copy(app.clientId, "Client ID")} />
                <CredentialRow label="Client Secret" value={app.clientSecret} masked={!revealSecret} onToggle={() => setRevealSecret((v) => !v)} onCopy={() => copy(app.clientSecret, "Client Secret")} />
                <CredentialRow label="API Key" value={app.apiKey} masked={!revealKey} onToggle={() => setRevealKey((v) => !v)} onCopy={() => copy(app.apiKey, "API Key")} />
                {app.secretRotatedAt && <p className="text-[11px] text-muted">Last rotated {formatDate(app.secretRotatedAt, true)}</p>}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={handleRotate}><RefreshCw size={13} /> Rotate secret</Button>
                  <Button variant="danger" size="sm" onClick={handleRevoke}><Ban size={13} /> Revoke key</Button>
                </div>
              </CardContent></Card>
            ),
          },
          {
            key: "config", label: "Configuration", content: (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card><CardContent>
                  <p className="mb-2 text-xs font-semibold">Redirect URLs</p>
                  <div className="space-y-1.5">
                    {app.redirectUrls.map((u) => (
                      <div key={u} className="flex items-center justify-between rounded-lg border border-charcoal-100 px-2.5 py-1.5 text-xs dark:border-charcoal-800">
                        <span className="truncate font-mono">{u}</span>
                        <button onClick={() => removeRedirect(u)} aria-label="Remove"><X size={13} className="text-muted hover:text-danger" /></button>
                      </div>
                    ))}
                    {app.redirectUrls.length === 0 && <p className="text-xs text-muted">No redirect URLs configured.</p>}
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <Input value={newRedirect} onChange={(e) => setNewRedirect(e.target.value)} placeholder="https://…/callback" className="text-xs" />
                    <Button size="sm" onClick={addRedirect}><Plus size={13} /></Button>
                  </div>
                </CardContent></Card>
                <Card><CardContent>
                  <p className="mb-2 text-xs font-semibold">Allowed IP addresses</p>
                  <div className="space-y-1.5">
                    {app.allowedIps.map((ip) => (
                      <div key={ip} className="flex items-center justify-between rounded-lg border border-charcoal-100 px-2.5 py-1.5 text-xs dark:border-charcoal-800">
                        <span className="font-mono">{ip}</span>
                        <button onClick={() => removeIp(ip)} aria-label="Remove"><X size={13} className="text-muted hover:text-danger" /></button>
                      </div>
                    ))}
                    {app.allowedIps.length === 0 && <p className="text-xs text-muted">No IP restriction configured.</p>}
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <Input value={newIp} onChange={(e) => setNewIp(e.target.value)} placeholder="10.0.0.0/24" className="text-xs" />
                    <Button size="sm" onClick={addIp}><Plus size={13} /></Button>
                  </div>
                </CardContent></Card>
                <Card className="lg:col-span-2"><CardContent>
                  <p className="mb-2 text-xs font-semibold">Webhook endpoint</p>
                  <Input defaultValue={app.webhookUrl ?? ""} placeholder="https://…/webhooks/salik" onBlur={(e) => updateApplication(app.id, { webhookUrl: e.target.value || undefined })} className="text-xs" />
                  <p className="mt-1.5 text-[11px] text-muted">Manage event subscriptions and delivery logs under Events and Webhooks.</p>
                </CardContent></Card>
              </div>
            ),
          },
          {
            key: "apis", label: "Subscribed APIs", content: (
              <Card><CardContent>
                <div className="mb-3 flex gap-1.5">
                  <Select value={addApiId} onChange={(e) => setAddApiId(e.target.value)} className="max-w-xs">
                    <option value="">Add an API…</option>
                    {APIS.filter((a) => !app.subscribedApiIds.includes(a.id)).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </Select>
                  <Button size="sm" onClick={addApi} disabled={!addApiId}><Plus size={13} /> Assign</Button>
                </div>
                <div className="space-y-1.5">
                  {app.subscribedApiIds.map((id) => {
                    const api = APIS.find((a) => a.id === id);
                    if (!api) return null;
                    return (
                      <div key={id} className="flex items-center justify-between rounded-lg border border-charcoal-100 px-3 py-2 text-xs dark:border-charcoal-800">
                        <span className="font-medium">{api.name}</span>
                        <button onClick={() => removeApi(id)} className="text-muted hover:text-danger" aria-label="Unassign"><X size={13} /></button>
                      </div>
                    );
                  })}
                  {app.subscribedApiIds.length === 0 && <p className="text-xs text-muted">No APIs assigned yet.</p>}
                </div>
                {appSubs.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold">Subscription status</p>
                    {appSubs.map((s) => (
                      <div key={s.id} className="flex items-center justify-between border-b border-charcoal-50 py-1.5 text-xs last:border-0 dark:border-charcoal-800/60">
                        <span>{s.apiOrProductName}</span>
                        <Badge status={s.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent></Card>
            ),
          },
          {
            key: "analytics", label: "Analytics", content: (
              <ChartCard title="Application Usage" subtitle="Weekly API calls and errors (mock)">
                <SimpleBarChart data={usage} xKey="week" series={[{ key: "calls", color: "#26966b", name: "Calls" }, { key: "errors", color: "#dc2626", name: "Errors" }]} />
              </ChartCard>
            ),
          },
        ]}
      />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-charcoal-50 py-1.5 last:border-0 dark:border-charcoal-800/60"><span className="text-muted">{k}</span><span className="font-medium">{v}</span></div>;
}

function CredentialRow({ label, value, masked, onToggle, onCopy }: { label: string; value: string; masked?: boolean; onToggle?: () => void; onCopy: () => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-1.5">
        <Input value={masked ? maskSecret(value) : value} readOnly className="font-mono text-xs" />
        {onToggle && (
          <button onClick={onToggle} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-charcoal-200 text-muted dark:border-charcoal-700" aria-label="Toggle visibility">
            {masked ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        )}
        <button onClick={onCopy} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-charcoal-200 text-muted dark:border-charcoal-700" aria-label="Copy">
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

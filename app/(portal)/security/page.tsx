"use client";
import { useState } from "react";
import { Eye, EyeOff, Copy, RefreshCw, Ban, Upload, Plus, X, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAppData } from "@/components/common/AppDataProvider";
import { useToast } from "@/components/common/Toast";
import { generateCredentials, rotateSecret, revokeKey } from "@/services/mockAuthService";
import { maskSecret, formatDate, mulberry32, pick } from "@/lib/utils";

const OAUTH_SCOPE_OPTIONS = ["read:transactions", "write:payments", "read:profile", "write:wallet", "read:webhooks", "write:webhooks"];

const rnd = mulberry32(2323);
const AUDIT_ACTIONS = ["Credential generated", "Secret rotated", "Key revoked", "IP address added", "IP address removed", "OAuth scope updated", "Certificate uploaded", "Login succeeded", "Login failed"];
const AUDIT_LOG = Array.from({ length: 18 }, (_, i) => ({
  id: `audit_${i}`,
  action: pick(AUDIT_ACTIONS, rnd),
  actor: pick(["Ahmed Al Marzooqi", "Omar Al Zaabi", "Sara Al Hashimi", "System"], rnd),
  timestamp: new Date(Date.now() - i * 3.4 * 3600000).toISOString(),
  ip: `10.${Math.floor(rnd() * 255)}.${Math.floor(rnd() * 255)}.${Math.floor(rnd() * 255)}`,
}));

const SUSPICIOUS_ACTIVITY = [
  { id: 1, label: "Unusual request velocity from Mobility Super App", severity: "High", timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 2, label: "Sandbox key used against production endpoint", severity: "Medium", timestamp: new Date(Date.now() - 9 * 3600000).toISOString() },
  { id: 3, label: "5 failed authentication attempts from a single IP", severity: "High", timestamp: new Date(Date.now() - 26 * 3600000).toISOString() },
  { id: 4, label: "New IP address used for existing application", severity: "Low", timestamp: new Date(Date.now() - 40 * 3600000).toISOString() },
];

export default function SecurityPage() {
  const { applications, updateApplication } = useAppData();
  const { push } = useToast();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [newIp, setNewIp] = useState<Record<string, string>>({});

  function copy(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    push("success", "Copied to clipboard", "");
  }

  async function handleGenerate(appId: string, env: "sandbox" | "production") {
    const creds = await generateCredentials(env);
    updateApplication(appId, creds);
    push("success", "New credentials generated", "");
  }
  async function handleRotate(appId: string) {
    const secret = await rotateSecret();
    updateApplication(appId, { clientSecret: secret, secretRotatedAt: new Date().toISOString() });
    push("success", "Secret rotated", "");
  }
  async function handleRevoke(appId: string) {
    await revokeKey();
    updateApplication(appId, { status: "Suspended" });
    push("warning", "Key revoked", "");
  }
  function addIp(appId: string) {
    const ip = newIp[appId];
    if (!ip) return;
    const app = applications.find((a) => a.id === appId)!;
    updateApplication(appId, { allowedIps: [...app.allowedIps, ip] });
    setNewIp((prev) => ({ ...prev, [appId]: "" }));
  }
  function removeIp(appId: string, ip: string) {
    const app = applications.find((a) => a.id === appId)!;
    updateApplication(appId, { allowedIps: app.allowedIps.filter((i) => i !== ip) });
  }
  function toggleScope(appId: string, scope: string) {
    const app = applications.find((a) => a.id === appId)!;
    const scopes = app.oauthScopes.includes(scope) ? app.oauthScopes.filter((s) => s !== scope) : [...app.oauthScopes, scope];
    updateApplication(appId, { oauthScopes: scopes });
  }
  function uploadCertificate(appId: string) {
    updateApplication(appId, { certificateStatus: "Valid" });
    push("success", "Mock certificate uploaded", "Certificate status set to Valid.");
  }

  return (
    <div>
      <PageHeader title="Security" description="Credentials, certificates, IP allow-listing, and audit history across all applications." />

      <Tabs
        defaultTab="credentials"
        tabs={[
          {
            key: "credentials", label: "Credentials", content: (
              <div className="space-y-3">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <CardHeader><CardTitle>{app.name}</CardTitle><Badge label={app.environment} className="bg-info-light text-info" /></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <SecretField label="Client ID" value={app.clientId} onCopy={() => copy(app.clientId)} />
                        <SecretField label="Client Secret" value={app.clientSecret} masked={!revealed[app.id + "s"]} onToggle={() => setRevealed((r) => ({ ...r, [app.id + "s"]: !r[app.id + "s"] }))} onCopy={() => copy(app.clientSecret)} />
                        <SecretField label="API Key" value={app.apiKey} masked={!revealed[app.id + "k"]} onToggle={() => setRevealed((r) => ({ ...r, [app.id + "k"]: !r[app.id + "k"] }))} onCopy={() => copy(app.apiKey)} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleGenerate(app.id, app.environment)}><Plus size={12} /> Generate credential</Button>
                        <Button variant="outline" size="sm" onClick={() => handleRotate(app.id)}><RefreshCw size={12} /> Rotate secret</Button>
                        <Button variant="danger" size="sm" onClick={() => handleRevoke(app.id)}><Ban size={12} /> Revoke key</Button>
                      </div>
                      {app.secretRotatedAt && <p className="text-[11px] text-muted">Last rotated {formatDate(app.secretRotatedAt, true)}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: "certs", label: "Certificates & mTLS", content: (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{app.name}</p>
                        <p className="text-[11px] text-muted">mTLS certificate status</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge status={app.certificateStatus} />
                        <Button variant="outline" size="sm" onClick={() => uploadCertificate(app.id)}><Upload size={12} /> Upload mock cert</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: "ip", label: "IP Allow-list", content: (
              <div className="space-y-3">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <CardHeader><CardTitle>{app.name}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {app.allowedIps.map((ip) => (
                          <span key={ip} className="flex items-center gap-1.5 rounded-full bg-charcoal-100 px-2.5 py-1 font-mono text-[11px] dark:bg-charcoal-800">
                            {ip}<button onClick={() => removeIp(app.id, ip)} aria-label="Remove"><X size={11} className="text-muted hover:text-danger" /></button>
                          </span>
                        ))}
                        {app.allowedIps.length === 0 && <span className="text-xs text-muted">No IP restrictions — open to any source.</span>}
                      </div>
                      <div className="flex max-w-sm gap-1.5">
                        <Input value={newIp[app.id] ?? ""} onChange={(e) => setNewIp((p) => ({ ...p, [app.id]: e.target.value }))} placeholder="10.0.0.0/24" className="text-xs" />
                        <Button size="sm" onClick={() => addIp(app.id)}><Plus size={13} /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: "scopes", label: "OAuth Scopes", content: (
              <div className="space-y-3">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <CardHeader><CardTitle>{app.name}</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-1.5">
                      {OAUTH_SCOPE_OPTIONS.map((scope) => (
                        <button
                          key={scope}
                          onClick={() => toggleScope(app.id, scope)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${app.oauthScopes.includes(scope) ? "bg-salik-600 text-white" : "bg-charcoal-100 text-muted dark:bg-charcoal-800"}`}
                        >
                          {scope}
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: "activity", label: "Suspicious Activity", content: (
              <div className="space-y-2">
                {SUSPICIOUS_ACTIVITY.map((a) => (
                  <div key={a.id} className="surface-card flex items-center justify-between rounded-lg p-3 text-xs shadow-card">
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert size={16} className={a.severity === "High" ? "text-danger" : a.severity === "Medium" ? "text-warn" : "text-muted"} />
                      <div>
                        <p className="font-medium">{a.label}</p>
                        <p className="text-muted">{formatDate(a.timestamp, true)}</p>
                      </div>
                    </div>
                    <Badge label={a.severity} className={a.severity === "High" ? "bg-danger-light text-danger" : a.severity === "Medium" ? "bg-warn-light text-warn" : "bg-charcoal-100 text-muted dark:bg-charcoal-800"} />
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: "audit", label: "Audit Log", content: (
              <div className="surface-card divide-y divide-charcoal-100 rounded-xl shadow-card dark:divide-charcoal-800">
                {AUDIT_LOG.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
                    <span className="font-medium">{a.action}</span>
                    <span className="text-muted">{a.actor}</span>
                    <span className="font-mono text-muted">{a.ip}</span>
                    <span className="text-muted">{formatDate(a.timestamp, true)}</span>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

function SecretField({ label, value, masked, onToggle, onCopy }: { label: string; value: string; masked?: boolean; onToggle?: () => void; onCopy: () => void }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div className="flex items-center gap-1">
        <Input value={masked ? maskSecret(value) : value} readOnly className="font-mono text-[11px]" />
        {onToggle && <button onClick={onToggle} className="text-muted hover:text-current" aria-label="Toggle visibility">{masked ? <Eye size={13} /> : <EyeOff size={13} />}</button>}
        <button onClick={onCopy} className="text-muted hover:text-current" aria-label="Copy"><Copy size={13} /></button>
      </div>
    </div>
  );
}

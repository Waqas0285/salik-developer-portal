"use client";
import { useState } from "react";
import { Plus, Send, RotateCw, Power, Webhook as WebhookIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label, Select } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { useAppData, newId } from "@/components/common/AppDataProvider";
import { useToast } from "@/components/common/Toast";
import { sendTestEvent, retryDelivery } from "@/services/mockWebhookService";
import { WEBHOOK_EVENT_TYPES } from "@/data/webhooks";
import { relativeTime, seededId, mulberry32 } from "@/lib/utils";
import type { Webhook } from "@/types";

export default function WebhooksPage() {
  const { webhooks, addWebhook, updateWebhook, deliveries, addDelivery, updateDelivery, applications } = useAppData();
  const { push } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [authType, setAuthType] = useState<Webhook["authType"]>("HMAC Signature");
  const [retryPolicy, setRetryPolicy] = useState<Webhook["retryPolicy"]>("Exponential");
  const [timeout, setTimeoutS] = useState(10);
  const [appId, setAppId] = useState(applications[0]?.id ?? "");

  function toggleEvent(id: string) {
    setSelectedEvents((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  }

  function createWebhook() {
    if (!url || selectedEvents.length === 0) { push("error", "Missing fields", "Enter a URL and select at least one event."); return; }
    const app = applications.find((a) => a.id === appId);
    const rnd = mulberry32(Date.now() % 100000);
    const wh: Webhook = {
      id: newId("wh"), applicationId: appId, applicationName: app?.name ?? "Unnamed application",
      url, events: selectedEvents, authType, signingSecret: seededId(rnd, "whsec", 28),
      retryPolicy, timeoutSeconds: timeout, active: true, createdAt: new Date().toISOString(),
    };
    addWebhook(wh);
    push("success", "Webhook created", url);
    setCreateOpen(false);
    setUrl(""); setSelectedEvents([]);
  }

  async function testEvent(wh: Webhook) {
    const event = wh.events[0] ?? WEBHOOK_EVENT_TYPES[0].id;
    const delivery = await sendTestEvent(wh.id, event);
    addDelivery(delivery);
    push(delivery.status === "Delivered" ? "success" : "error", "Test event sent", `${event} → ${wh.url}`);
  }

  async function retry(id: string) {
    const d = deliveries.find((x) => x.id === id);
    if (!d) return;
    const updated = await retryDelivery(d);
    updateDelivery(id, updated);
    push(updated.status === "Delivered" ? "success" : "warning", "Retry attempted", `Status: ${updated.status}`);
  }

  return (
    <div>
      <PageHeader
        title="Events and Webhooks"
        description="Subscribe to platform events and manage webhook delivery."
        actions={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> Create webhook</Button>}
      />

      <Tabs
        defaultTab="webhooks"
        tabs={[
          {
            key: "webhooks", label: `My Webhooks (${webhooks.length})`, content: (
              webhooks.length === 0 ? <EmptyState icon={WebhookIcon} title="No webhooks configured" action={<Button size="sm" onClick={() => setCreateOpen(true)}>Create webhook</Button>} /> : (
                <div className="space-y-3">
                  {webhooks.map((wh) => (
                    <Card key={wh.id}>
                      <CardContent>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-mono text-xs font-semibold">{wh.url}</p>
                            <p className="mt-0.5 text-[11px] text-muted">{wh.applicationName} · {wh.authType} · {wh.retryPolicy} retry · {wh.timeoutSeconds}s timeout</p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {wh.events.map((e) => <Badge key={e} label={e} className="bg-charcoal-100 text-muted dark:bg-charcoal-800" />)}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge label={wh.active ? "Active" : "Inactive"} status={wh.active ? "Active" : "Inactive"} />
                            <Button variant="outline" size="sm" onClick={() => testEvent(wh)}><Send size={12} /> Test event</Button>
                            <button onClick={() => updateWebhook(wh.id, { active: !wh.active })} className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal-200 text-muted dark:border-charcoal-700" aria-label="Toggle active">
                              <Power size={13} />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ),
          },
          {
            key: "catalog", label: "Event Catalog", content: (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {WEBHOOK_EVENT_TYPES.map((e) => (
                  <div key={e.id} className="surface-card rounded-lg p-3 shadow-card">
                    <p className="font-mono text-[11px] font-semibold text-salik-700 dark:text-salik-400">{e.id}</p>
                    <p className="mt-0.5 text-xs font-medium">{e.name}</p>
                    <p className="mt-1 text-[11px] text-muted">{e.description}</p>
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: "deliveries", label: "Delivery Logs", content: (
              <div className="space-y-2">
                {deliveries.map((d) => (
                  <div key={d.id} className="surface-card flex flex-wrap items-center justify-between gap-2 rounded-lg p-3 text-xs shadow-card">
                    <div className="min-w-0">
                      <p className="font-mono font-medium">{d.eventType}</p>
                      <p className="text-muted">{relativeTime(d.timestamp)} · attempt {d.attempt} · {d.responseStatus ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={d.status} />
                      {(d.status === "Failed" || d.status === "Retrying") && (
                        <Button variant="outline" size="sm" onClick={() => retry(d.id)}><RotateCw size={12} /> Retry</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
      />

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create webhook">
        <div className="space-y-4">
          <div>
            <Label>Application</Label>
            <Select value={appId} onChange={(e) => setAppId(e.target.value)}>
              {applications.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>Webhook URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-app.example.com/webhooks/salik" />
          </div>
          <div>
            <Label>Events</Label>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-charcoal-100 p-2 dark:border-charcoal-800">
              {WEBHOOK_EVENT_TYPES.map((e) => (
                <label key={e.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-charcoal-50 dark:hover:bg-charcoal-800/50">
                  <input type="checkbox" checked={selectedEvents.includes(e.id)} onChange={() => toggleEvent(e.id)} />
                  {e.name}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Authentication</Label>
              <Select value={authType} onChange={(e) => setAuthType(e.target.value as Webhook["authType"])}>
                <option>HMAC Signature</option><option>Bearer Token</option><option>Basic Auth</option><option>None</option>
              </Select>
            </div>
            <div>
              <Label>Retry policy</Label>
              <Select value={retryPolicy} onChange={(e) => setRetryPolicy(e.target.value as Webhook["retryPolicy"])}>
                <option>Exponential</option><option>Linear</option><option>None</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Timeout (seconds)</Label>
            <Input type="number" value={timeout} onChange={(e) => setTimeoutS(Number(e.target.value))} />
          </div>
          <Button className="w-full" onClick={createWebhook}>Create webhook</Button>
        </div>
      </Dialog>
    </div>
  );
}

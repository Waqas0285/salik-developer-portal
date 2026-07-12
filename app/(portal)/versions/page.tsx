"use client";
import { useState } from "react";
import { BellRing, GitCompare } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { useToast } from "@/components/common/Toast";
import { APIS } from "@/data/apis";
import { formatDate } from "@/lib/utils";

export default function VersionsPage() {
  const { push } = useToast();
  const [apiId, setApiId] = useState(APIS[0].id);
  const api = APIS.find((a) => a.id === apiId)!;
  const [vA, setVA] = useState(api.versions[0]?.version);
  const [vB, setVB] = useState(api.versions[api.versions.length - 1]?.version);

  function onApiChange(id: string) {
    const a = APIS.find((x) => x.id === id)!;
    setApiId(id);
    setVA(a.versions[0]?.version);
    setVB(a.versions[a.versions.length - 1]?.version);
  }

  const versionA = api.versions.find((v) => v.version === vA);
  const versionB = api.versions.find((v) => v.version === vB);

  return (
    <div>
      <PageHeader title="API Versioning" description="Track version history, compare releases, and review migration guidance." />

      <Card className="mb-5">
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div><label className="mb-1 block text-[10px] font-semibold uppercase text-muted">API</label>
            <Select value={apiId} onChange={(e) => onApiChange(e.target.value)}>{APIS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>
          </div>
          <div><label className="mb-1 block text-[10px] font-semibold uppercase text-muted">Version A</label>
            <Select value={vA} onChange={(e) => setVA(e.target.value)}>{api.versions.map((v) => <option key={v.version} value={v.version}>{v.version}</option>)}</Select>
          </div>
          <div><label className="mb-1 block text-[10px] font-semibold uppercase text-muted">Version B</label>
            <Select value={vB} onChange={(e) => setVB(e.target.value)}>{api.versions.map((v) => <option key={v.version} value={v.version}>{v.version}</option>)}</Select>
          </div>
        </CardContent>
      </Card>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[versionA, versionB].map((v, i) => v && (
          <Card key={i}>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{v.version}</p>
                <Badge label={v.status} className="bg-info-light text-info" />
              </div>
              <p className="mt-1 text-[11px] text-muted">Released {formatDate(v.releasedOn)}{v.sunsetOn ? ` · Sunsets ${formatDate(v.sunsetOn)}` : ""}</p>
              <p className="mt-3 mb-1.5 text-xs font-semibold">Changes</p>
              <ul className="list-inside list-disc space-y-1 text-xs text-muted">{v.changes.map((c) => <li key={c}>{c}</li>)}</ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-5">
        <CardContent>
          <div className="mb-2 flex items-center gap-2"><GitCompare size={15} className="text-salik-600" /><p className="text-sm font-semibold">Migration guide: {vA} → {vB}</p></div>
          <p className="text-xs text-muted">
            Review the added fields and headers listed under {vB} above (e.g. idempotency-key support, correlation IDs), update your request signing if the
            authentication section changed, and re-run your integration tests against the {vB} sandbox base URL before switching production traffic.
            No fields were removed in this demo dataset — this is treated as an additive, non-breaking upgrade.
          </p>
        </CardContent>
      </Card>

      <Button variant="outline" size="sm" onClick={() => push("success", "Subscribed to version notifications", `You'll be notified about future ${api.name} releases.`)}>
        <BellRing size={14} /> Subscribe to version notifications
      </Button>
    </div>
  );
}

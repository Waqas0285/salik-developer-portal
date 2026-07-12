"use client";
import { useState } from "react";
import { Upload, CheckCircle2, Rocket, ArchiveX, Ban, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/common/Toast";
import { APIS } from "@/data/apis";
import { formatDate } from "@/lib/utils";
import type { ApiDefinition, LifecycleStatus } from "@/types";

const LIFECYCLE: LifecycleStatus[] = ["Draft", "Design", "Development", "Testing", "Security Review", "UAT", "Approved", "Published", "Deprecated", "Retired"];

export default function AdministrationPage() {
  const { push } = useToast();
  const [apis, setApis] = useState<ApiDefinition[]>(APIS);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('{\n  "openapi": "3.0.3",\n  "info": { "title": "New Partner API", "version": "1.0.0" },\n  "paths": {}\n}');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  function setLifecycle(id: string, status: LifecycleStatus) {
    setApis((prev) => prev.map((a) => (a.id === id ? { ...a, lifecycleStatus: status, lastUpdated: new Date().toISOString() } : a)));
    push("success", `API ${status.toLowerCase()}`, "");
  }

  function validateAndImport() {
    try {
      JSON.parse(importText);
      push("success", "OpenAPI spec validated", "Spec is well-formed JSON. Import queued for review (demo only).");
      setImportOpen(false);
    } catch {
      push("error", "Invalid OpenAPI JSON", "Fix the JSON syntax and try again.");
    }
  }

  function createApi() {
    if (!newName.trim()) return;
    const id = `${newName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    const draft: ApiDefinition = {
      ...APIS[0], id, name: newName, lifecycleStatus: "Draft", subscribers: 0, popularity: 0,
      lastUpdated: new Date().toISOString(), shortDescription: "New draft API — configure metadata before publishing.",
      endpoints: [], versions: [{ version: "v0.1", status: "beta", releasedOn: new Date().toISOString().slice(0, 10), changes: ["Initial draft"] }],
    };
    setApis((prev) => [draft, ...prev]);
    push("success", "API created as Draft", newName);
    setCreateOpen(false);
    setNewName("");
  }

  const columns: Column<ApiDefinition>[] = [
    { key: "name", header: "API", render: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
    { key: "category", header: "Category", render: (r) => r.category },
    { key: "version", header: "Version", render: (r) => r.version },
    { key: "owner", header: "Owner", render: (r) => r.owner },
    { key: "status", header: "Lifecycle", render: (r) => (
      <Select value={r.lifecycleStatus} onChange={(e) => setLifecycle(r.id, e.target.value as LifecycleStatus)} className="h-7 w-40 py-0 text-[11px]">
        {LIFECYCLE.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
    ) },
    { key: "updated", header: "Updated", render: (r) => formatDate(r.lastUpdated), sortValue: (r) => r.lastUpdated },
    { key: "actions", header: "Quick actions", render: (r) => (
      <div className="flex gap-1">
        <button title="Publish" onClick={() => setLifecycle(r.id, "Published")} className="text-muted hover:text-success"><Rocket size={14} /></button>
        <button title="Deprecate" onClick={() => setLifecycle(r.id, "Deprecated")} className="text-muted hover:text-warn"><ArchiveX size={14} /></button>
        <button title="Retire" onClick={() => setLifecycle(r.id, "Retired")} className="text-muted hover:text-danger"><Ban size={14} /></button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader
        title="API Administration"
        description="Manage the API lifecycle from draft through retirement — internal Salik view."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Upload size={14} /> Import OpenAPI</Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> Create API</Button>
          </>
        }
      />

      <div className="surface-card rounded-xl p-2 shadow-card">
        <DataTable columns={columns} rows={apis} rowKey={(r) => r.id} pageSize={12} />
      </div>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} title="Import OpenAPI specification" description="Paste an OpenAPI JSON document to validate and queue it for import.">
        <div className="space-y-3">
          <Textarea rows={10} value={importText} onChange={(e) => setImportText(e.target.value)} className="font-mono text-[11px]" />
          <Button className="w-full" onClick={validateAndImport}><CheckCircle2 size={14} /> Validate & import</Button>
        </div>
      </Dialog>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create new API">
        <div className="space-y-3">
          <div><Label>API name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Drive-Through Order API" /></div>
          <p className="text-[11px] text-muted">New APIs start in Draft status. Configure endpoints, owner, SLA, and rate limits before moving to Design.</p>
          <Button className="w-full" onClick={createApi}>Create as draft</Button>
        </div>
      </Dialog>
    </div>
  );
}

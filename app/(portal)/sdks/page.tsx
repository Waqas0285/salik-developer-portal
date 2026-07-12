"use client";
import { Download, FileJson, FileCode, Terminal, ShieldCheck, KeySquare, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { downloadFile } from "@/services/mockTransactionService";
import { useToast } from "@/components/common/Toast";
import { SDKS, DEV_TOOLS } from "@/data/sdks";
import { APIS } from "@/data/apis";
import { buildOpenApiSpec } from "@/lib/openapi";

const TOOL_ICONS: Record<string, LucideIcon> = {
  postman: FileJson, insomnia: FileJson, "openapi-yaml": FileCode, "openapi-json": FileCode,
  "sample-apps": FileCode, quickstart: FileCode, cli: Terminal, "webhook-verify": ShieldCheck, "signature-gen": KeySquare,
};

export default function SdksPage() {
  const { push } = useToast();

  function downloadSdk(id: string, name: string, installCommand: string) {
    downloadFile(`${id}.txt`, `${name}\n\nInstall:\n  ${installCommand}\n\nThis is a mock SDK placeholder generated for demonstration purposes only — it contains no real client code.`);
    push("success", "Download started", `${name} placeholder saved.`);
  }

  function downloadTool(id: string, name: string) {
    if (id === "postman" || id === "insomnia") {
      const collection = {
        info: { name: "Salik API Developer Portal — Demo Collection", schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
        item: APIS.slice(0, 10).map((a) => ({ name: a.name, request: { method: a.endpoints[0]?.method ?? "GET", url: `{{baseUrl}}${a.endpoints[0]?.path ?? "/"}` } })),
      };
      downloadFile(`${id}-collection.json`, JSON.stringify(collection, null, 2), "application/json");
    } else if (id === "openapi-yaml" || id === "openapi-json") {
      const specs = APIS.map((a) => buildOpenApiSpec(a));
      downloadFile(`salik-apis.${id === "openapi-yaml" ? "yaml" : "json"}`, JSON.stringify(specs, null, 2), "application/json");
    } else {
      downloadFile(`${id}.txt`, `${name}\n\nMock utility placeholder for demonstration purposes only.`);
    }
    push("success", "Download started", `${name} saved.`);
  }

  return (
    <div>
      <PageHeader title="SDKs and Tools" description="Client SDKs, collections, and developer utilities for integrating with Salik APIs." />

      <h2 className="mb-3 text-sm font-semibold">SDKs</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SDKS.map((s) => (
          <Card key={s.id}>
            <CardContent>
              <p className="text-sm font-semibold">{s.language}</p>
              <p className="mt-0.5 text-[11px] text-muted">v{s.version}</p>
              <p className="mt-2 line-clamp-2 text-[11px] text-muted">{s.description}</p>
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => downloadSdk(s.id, s.name, s.installCommand)}>
                <Download size={12} /> Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-semibold">Developer Tools</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DEV_TOOLS.map((t) => {
          const Icon = TOOL_ICONS[t.id] ?? FileCode;
          return (
            <Card key={t.id}>
              <CardContent className="flex items-start gap-3">
                <Icon size={20} className="mt-0.5 shrink-0 text-salik-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{t.description}</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => downloadTool(t.id, t.name)}>
                    <Download size={12} /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

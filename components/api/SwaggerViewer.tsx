"use client";
import { useState } from "react";
import { ChevronDown, Copy, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { buildOpenApiSpec } from "@/lib/openapi";
import { downloadFile } from "@/services/mockTransactionService";
import type { ApiDefinition, ApiEndpoint } from "@/types";

const METHOD_COLOR: Record<string, string> = {
  GET: "bg-info-light text-info",
  POST: "bg-success-light text-success",
  PUT: "bg-warn-light text-warn",
  PATCH: "bg-warn-light text-warn",
  DELETE: "bg-danger-light text-danger",
};

type ViewMode = "visual" | "yaml" | "json";

export function SwaggerViewer({ api }: { api: ApiDefinition }) {
  const [mode, setMode] = useState<ViewMode>("visual");
  const [expanded, setExpanded] = useState<string | null>(api.endpoints[0]?.id ?? null);
  const [copied, setCopied] = useState(false);

  const spec = buildOpenApiSpec(api);
  const jsonStr = JSON.stringify(spec, null, 2);

  async function getYaml() {
    const yaml = await import("js-yaml");
    return yaml.dump(spec);
  }

  const [yamlStr, setYamlStr] = useState("");
  if (mode === "yaml" && !yamlStr) {
    getYaml().then(setYamlStr);
  }

  function copySpec() {
    const text = mode === "yaml" ? yamlStr : jsonStr;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    if (mode === "yaml") downloadFile(`${api.id}.openapi.yaml`, yamlStr, "text/yaml");
    else downloadFile(`${api.id}.openapi.json`, jsonStr, "application/json");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg bg-charcoal-100 p-1 dark:bg-charcoal-800">
          {(["visual", "yaml", "json"] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn("rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition", mode === m ? "bg-white shadow-card dark:bg-charcoal-900" : "text-muted")}
            >
              {m === "visual" ? "Swagger view" : m.toUpperCase()}
            </button>
          ))}
        </div>
        {mode !== "visual" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copySpec}>{copied ? <Check size={13} /> : <Copy size={13} />} Copy</Button>
            <Button variant="outline" size="sm" onClick={download}><Download size={13} /> Download</Button>
          </div>
        )}
      </div>

      {mode === "visual" && (
        <div className="space-y-2.5">
          {api.endpoints.map((ep) => (
            <EndpointRow key={ep.id} endpoint={ep} open={expanded === ep.id} onToggle={() => setExpanded(expanded === ep.id ? null : ep.id)} />
          ))}
        </div>
      )}
      {mode === "json" && (
        <pre className="scrollbar-thin max-h-[560px] overflow-auto rounded-lg bg-charcoal-950 p-4 text-[11px] leading-relaxed text-charcoal-100">{jsonStr}</pre>
      )}
      {mode === "yaml" && (
        <pre className="scrollbar-thin max-h-[560px] overflow-auto rounded-lg bg-charcoal-950 p-4 text-[11px] leading-relaxed text-charcoal-100">{yamlStr || "Loading…"}</pre>
      )}
    </div>
  );
}

function EndpointRow({ endpoint, open, onToggle }: { endpoint: ApiEndpoint; open: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-charcoal-100 dark:border-charcoal-800">
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-charcoal-50 dark:hover:bg-charcoal-800/50">
        <span className={cn("w-16 shrink-0 rounded px-2 py-1 text-center text-[11px] font-bold", METHOD_COLOR[endpoint.method])}>{endpoint.method}</span>
        <span className="flex-1 truncate font-mono text-xs">{endpoint.path}</span>
        <span className="hidden shrink-0 text-xs text-muted sm:block">{endpoint.summary}</span>
        <ChevronDown size={16} className={cn("shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-4 border-t border-charcoal-100 p-4 dark:border-charcoal-800">
          <p className="text-xs text-muted">{endpoint.description}</p>
          {endpoint.requiresIdempotencyKey && (
            <p className="rounded-lg bg-info-light px-3 py-2 text-[11px] text-info">This endpoint requires an <code>Idempotency-Key</code> header to safely retry requests without duplicating side effects.</p>
          )}

          {endpoint.parameters.length > 0 && (
            <FieldTable
              title="Parameters"
              rows={endpoint.parameters.map((p) => [p.name, p.in, p.type, p.required ? "Required" : "Optional", p.description, p.example ?? "—"])}
              headers={["Name", "In", "Type", "", "Description", "Example"]}
            />
          )}

          {endpoint.requestBody && (
            <FieldTable
              title="Request body schema"
              rows={endpoint.requestBody.map((f) => [f.name, f.type, f.required ? "Required" : "Optional", f.description, f.enum ? f.enum.join(" | ") : String(f.example ?? "—")])}
              headers={["Field", "Type", "", "Description", "Enum / Example"]}
            />
          )}

          <div>
            <p className="mb-1.5 text-xs font-semibold">Success response example</p>
            <pre className="scrollbar-thin overflow-auto rounded-lg bg-charcoal-950 p-3 text-[11px] text-charcoal-100">{JSON.stringify(endpoint.successExample, null, 2)}</pre>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold">Error examples</p>
            <div className="space-y-1.5">
              {endpoint.errorExamples.map((err) => (
                <details key={err.status} className="rounded-lg border border-charcoal-100 dark:border-charcoal-800">
                  <summary className="cursor-pointer px-3 py-2 text-xs font-medium">
                    <span className="mr-2 rounded bg-danger-light px-1.5 py-0.5 text-danger">{err.status}</span>{err.code}
                  </summary>
                  <pre className="scrollbar-thin overflow-auto border-t border-charcoal-100 bg-charcoal-950 p-3 text-[11px] text-charcoal-100 dark:border-charcoal-800">{JSON.stringify(err.example, null, 2)}</pre>
                </details>
              ))}
            </div>
          </div>

          <FieldTable
            title="Response schema"
            rows={endpoint.responseSchema.map((f) => [f.name, f.type, f.required ? "Required" : "Optional", f.description, f.enum ? f.enum.join(" | ") : String(f.example ?? "—")])}
            headers={["Field", "Type", "", "Description", "Enum / Example"]}
          />
        </div>
      )}
    </div>
  );
}

function FieldTable({ title, headers, rows }: { title: string; headers: string[]; rows: (string | undefined)[][] }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold">{title}</p>
      <div className="scrollbar-thin overflow-x-auto rounded-lg border border-charcoal-100 dark:border-charcoal-800">
        <table className="w-full min-w-[480px] text-left text-[11px]">
          <thead>
            <tr className="bg-charcoal-50 dark:bg-charcoal-800/60">
              {headers.map((h, i) => <th key={i} className="px-2.5 py-1.5 font-semibold text-muted">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-t border-charcoal-100 dark:border-charcoal-800">
                {row.map((cell, ci) => <td key={ci} className={cn("px-2.5 py-1.5 align-top", ci === 0 && "font-mono font-medium")}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

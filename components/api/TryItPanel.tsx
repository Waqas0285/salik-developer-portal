"use client";
import { useMemo, useState } from "react";
import { Play, RotateCcw, Save, History, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select, Label, Input } from "@/components/ui/Input";
import { CodeEditor } from "@/components/common/CodeEditor";
import { useToast } from "@/components/common/Toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { executeMockRequest, codeSample, type SimulatedScenario, type MockResponseResult } from "@/services/mockApiService";
import { CODE_LANGUAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ApiDefinition, Environment } from "@/types";

const SCENARIOS: { value: SimulatedScenario; label: string }[] = [
  { value: "success", label: "Success" },
  { value: "invalid_auth", label: "Invalid authentication (401)" },
  { value: "missing_field", label: "Missing field (400)" },
  { value: "invalid_vehicle", label: "Invalid vehicle (400)" },
  { value: "insufficient_balance", label: "Insufficient wallet balance (402)" },
  { value: "duplicate_transaction", label: "Duplicate transaction (409)" },
  { value: "partner_not_authorized", label: "Partner not authorized (403)" },
  { value: "rate_limit_exceeded", label: "Rate limit exceeded (429)" },
  { value: "timeout", label: "Timeout (504)" },
  { value: "internal_server_error", label: "Internal server error (500)" },
  { value: "service_unavailable", label: "Service unavailable (503)" },
];

interface SavedRequest {
  id: string;
  apiId: string;
  endpointId: string;
  environment: Environment;
  savedAt: string;
}
interface HistoryEntry {
  id: string;
  endpointId: string;
  method: string;
  path: string;
  status: number;
  timestamp: string;
  latencyMs: number;
}

export function TryItPanel({ api, defaultEndpointId }: { api: ApiDefinition; defaultEndpointId?: string }) {
  const { push } = useToast();
  const [endpointId, setEndpointId] = useState(defaultEndpointId ?? api.endpoints[0]?.id);
  const endpoint = useMemo(() => api.endpoints.find((e) => e.id === endpointId) ?? api.endpoints[0], [api, endpointId]);

  const [environment, setEnvironment] = useState<Environment>("sandbox");
  const [authMethod, setAuthMethod] = useState("API Key");
  const [scenario, setScenario] = useState<SimulatedScenario>("success");
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [headerValues, setHeaderValues] = useState<Record<string, string>>({ "Content-Type": "application/json" });
  const [body, setBody] = useState(() => JSON.stringify(defaultBody(api.endpoints[0]), null, 2));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MockResponseResult | null>(null);
  const [language, setLanguage] = useState<(typeof CODE_LANGUAGES)[number]>("cURL");
  const [copied, setCopied] = useState(false);

  const [savedRequests, setSavedRequests] = useLocalStorage<SavedRequest[]>("salik_saved_requests", []);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>("salik_request_history", []);
  const [showHistory, setShowHistory] = useState(false);

  function defaultBody(ep = endpoint) {
    if (!ep?.requestBody) return {};
    const obj: Record<string, unknown> = {};
    ep.requestBody.forEach((f) => { obj[f.name] = f.example ?? ""; });
    return obj;
  }

  function selectEndpoint(id: string) {
    setEndpointId(id);
    const ep = api.endpoints.find((e) => e.id === id);
    setPathValues(Object.fromEntries((ep?.parameters ?? []).filter((p) => p.in === "path").map((p) => [p.name, p.example ?? ""])));
    setQueryValues(Object.fromEntries((ep?.parameters ?? []).filter((p) => p.in === "query").map((p) => [p.name, p.example ?? ""])));
    setBody(JSON.stringify(defaultBody(ep), null, 2));
    setResult(null);
  }

  function resetRequest() {
    selectEndpoint(endpoint!.id);
    setScenario("success");
    push("info", "Request reset", "Fields restored to defaults for this endpoint.");
  }

  function buildUrl() {
    let path = endpoint?.path ?? "";
    Object.entries(pathValues).forEach(([k, v]) => { path = path.replace(`{${k}}`, v || `{${k}}`); });
    const base = environment === "sandbox" ? "https://sandbox-api.salik-demo.ae" : "https://api.salik-demo.ae";
    const qs = Object.entries(queryValues).filter(([, v]) => v).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
    return `${base}${path}${qs ? `?${qs}` : ""}`;
  }

  async function execute() {
    if (!endpoint) return;
    setLoading(true);
    setResult(null);
    let parsedBody: unknown = undefined;
    if (endpoint.requestBody) {
      try { parsedBody = JSON.parse(body); } catch { push("error", "Invalid JSON body", "Fix the request body before executing."); setLoading(false); return; }
    }
    const headers = { ...headerValues, Authorization: authMethod === "API Key" ? "ApiKey sk_test_***" : "Bearer eyJhbGciOi***" };
    const res = await executeMockRequest({ endpoint, environment, headers, pathParams: pathValues, queryParams: queryValues, body: parsedBody, scenario });
    setResult(res);
    setLoading(false);
    setHistory((prev) => [{ id: res.correlationId, endpointId: endpoint.id, method: endpoint.method, path: endpoint.path, status: res.status, timestamp: res.timestamp, latencyMs: res.latencyMs }, ...prev].slice(0, 25));
    push(res.ok ? "success" : "warning", `${res.status} ${res.ok ? "response received" : "error simulated"}`, `${endpoint.method} ${endpoint.path}`);
  }

  function saveRequest() {
    if (!endpoint) return;
    setSavedRequests((prev) => [{ id: `${Date.now()}`, apiId: api.id, endpointId: endpoint.id, environment, savedAt: new Date().toISOString() }, ...prev].slice(0, 20));
    push("success", "Request saved", "You can find it under Request History.");
  }

  function copySnippet(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!endpoint) return <p className="text-sm text-muted">No endpoints defined for this API.</p>;

  const sample = codeSample(language, endpoint.method, buildUrl(), headerValues, endpoint.requestBody ? JSON.parse(body || "{}") : undefined);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label>Endpoint</Label>
          <Select value={endpointId} onChange={(e) => selectEndpoint(e.target.value)}>
            {api.endpoints.map((e) => <option key={e.id} value={e.id}>{e.method} {e.path}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Environment</Label>
            <Select value={environment} onChange={(e) => setEnvironment(e.target.value as Environment)}>
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </Select>
          </div>
          <div>
            <Label>Authentication</Label>
            <Select value={authMethod} onChange={(e) => setAuthMethod(e.target.value)}>
              <option>API Key</option>
              <option>OAuth 2.0 Bearer Token</option>
              <option>mTLS + API Key</option>
            </Select>
          </div>
        </div>

        {endpoint.parameters.some((p) => p.in === "path") && (
          <ParamGroup title="Path parameters" params={endpoint.parameters.filter((p) => p.in === "path")} values={pathValues} onChange={(k, v) => setPathValues((s) => ({ ...s, [k]: v }))} />
        )}
        {endpoint.parameters.some((p) => p.in === "query") && (
          <ParamGroup title="Query parameters" params={endpoint.parameters.filter((p) => p.in === "query")} values={queryValues} onChange={(k, v) => setQueryValues((s) => ({ ...s, [k]: v }))} />
        )}

        <div>
          <Label>Headers</Label>
          <div className="space-y-1.5">
            {Object.entries(headerValues).map(([k, v]) => (
              <div key={k} className="flex gap-1.5">
                <Input value={k} disabled className="w-1/3 text-xs" />
                <Input value={v} onChange={(e) => setHeaderValues((s) => ({ ...s, [k]: e.target.value }))} className="flex-1 text-xs" />
              </div>
            ))}
          </div>
        </div>

        {endpoint.requestBody && (
          <div>
            <Label>Request body (JSON)</Label>
            <CodeEditor value={body} onChange={setBody} language="json" height={180} />
          </div>
        )}

        <div>
          <Label>Simulate Error</Label>
          <Select value={scenario} onChange={(e) => setScenario(e.target.value as SimulatedScenario)}>
            {SCENARIOS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={execute} disabled={loading}>
            <Play size={14} /> {loading ? "Executing…" : "Execute request"}
          </Button>
          <Button variant="outline" onClick={resetRequest}><RotateCcw size={14} /> Reset</Button>
          <Button variant="outline" onClick={saveRequest}><Save size={14} /> Save request</Button>
          <Button variant="outline" onClick={() => setShowHistory((v) => !v)}><History size={14} /> History ({history.length})</Button>
        </div>

        {showHistory && (
          <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-charcoal-100 p-2 text-xs dark:border-charcoal-800">
            {history.length === 0 && <p className="p-2 text-muted">No requests executed yet.</p>}
            {history.map((h) => (
              <div key={h.id + h.timestamp} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-charcoal-50 dark:hover:bg-charcoal-800/60">
                <span className="font-mono">{h.method} {h.path}</span>
                <span className={cn("font-semibold", h.status < 400 ? "text-success" : "text-danger")}>{h.status}</span>
                <span className="text-muted">{h.latencyMs}ms</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">Response</Label>
            {result && (
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", result.ok ? "bg-success-light text-success" : "bg-danger-light text-danger")}>
                {result.status}
              </span>
            )}
          </div>
          {!result && !loading && <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-charcoal-200 text-xs text-muted dark:border-charcoal-700">Execute a request to see the mock response</div>}
          {loading && <div className="skeleton h-40 rounded-lg" />}
          {result && (
            <div className="space-y-2">
              <CodeEditor value={JSON.stringify(result.body, null, 2)} language="json" height={180} readOnly />
              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted sm:grid-cols-3">
                <span>Time: <b className="text-current">{result.latencyMs}ms</b></span>
                <span>Size: <b className="text-current">{result.sizeBytes}B</b></span>
                <span>Env: <b className="text-current">{result.environment}</b></span>
                <span className="col-span-2 truncate">Correlation: <b className="text-current">{result.correlationId}</b></span>
                <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
              </div>
              <details className="text-[11px]">
                <summary className="cursor-pointer text-muted">Response headers</summary>
                <pre className="mt-1 rounded-lg bg-charcoal-950 p-2 text-charcoal-100">{JSON.stringify(result.headers, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">Code sample</Label>
            <div className="flex items-center gap-2">
              <Select value={language} onChange={(e) => setLanguage(e.target.value as (typeof CODE_LANGUAGES)[number])} className="h-7 w-28 py-0 text-[11px]">
                {CODE_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
              <button onClick={() => copySnippet(sample)} className="text-muted hover:text-current" aria-label="Copy code sample">
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <pre className="scrollbar-thin max-h-56 overflow-auto rounded-lg bg-charcoal-950 p-3 text-[11px] leading-relaxed text-charcoal-100">
            <code>{sample}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function ParamGroup({
  title, params, values, onChange,
}: { title: string; params: { name: string; required: boolean; description: string }[]; values: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div>
      <Label>{title}</Label>
      <div className="space-y-1.5">
        {params.map((p) => (
          <div key={p.name}>
            <Input
              value={values[p.name] ?? ""}
              onChange={(e) => onChange(p.name, e.target.value)}
              placeholder={`${p.name}${p.required ? " *" : ""}`}
              aria-label={p.name}
              className="text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

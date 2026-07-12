import { delay, randomId } from "@/lib/utils";
import type { ApiEndpoint } from "@/types";

export type SimulatedScenario =
  | "success" | "invalid_auth" | "missing_field" | "invalid_vehicle" | "insufficient_balance"
  | "duplicate_transaction" | "partner_not_authorized" | "rate_limit_exceeded" | "timeout"
  | "internal_server_error" | "service_unavailable";

export interface MockRequestInput {
  endpoint: ApiEndpoint;
  environment: "sandbox" | "production";
  headers: Record<string, string>;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  body?: unknown;
  scenario: SimulatedScenario;
}

export interface MockResponseResult {
  status: number;
  ok: boolean;
  body: Record<string, unknown>;
  headers: Record<string, string>;
  latencyMs: number;
  sizeBytes: number;
  correlationId: string;
  timestamp: string;
  environment: string;
}

const SCENARIO_MAP: Record<SimulatedScenario, { status: number; body: (ep: ApiEndpoint) => Record<string, unknown> } | null> = {
  success: null,
  invalid_auth: { status: 401, body: () => ({ error: "UNAUTHENTICATED", message: "Invalid or expired credentials." }) },
  missing_field: { status: 400, body: () => ({ error: "VALIDATION_ERROR", message: "Missing required field in request body." }) },
  invalid_vehicle: { status: 400, body: () => ({ error: "VALIDATION_ERROR", message: "vehiclePlate does not match a known UAE plate format." }) },
  insufficient_balance: { status: 402, body: () => ({ error: "INSUFFICIENT_BALANCE", message: "Wallet balance is insufficient to complete this payment." }) },
  duplicate_transaction: { status: 409, body: () => ({ error: "DUPLICATE_TRANSACTION", message: "A request with this idempotency key was already processed." }) },
  partner_not_authorized: { status: 403, body: () => ({ error: "PARTNER_NOT_AUTHORIZED", message: "Application is not subscribed to this API in this environment." }) },
  rate_limit_exceeded: { status: 429, body: () => ({ error: "RATE_LIMIT_EXCEEDED", message: "Too many requests — retry after the interval in Retry-After." }) },
  timeout: { status: 504, body: () => ({ error: "TIMEOUT", message: "Downstream dependency did not respond within the SLA window." }) },
  internal_server_error: { status: 500, body: () => ({ error: "INTERNAL_ERROR", message: "Unexpected server error." }) },
  service_unavailable: { status: 503, body: () => ({ error: "SERVICE_UNAVAILABLE", message: "Downstream dependency temporarily unavailable." }) },
};

/** Simulates executing an API request against the mock gateway — no network call is made. */
export async function executeMockRequest(input: MockRequestInput): Promise<MockResponseResult> {
  const latencyMs = input.scenario === "timeout" ? 4200 + Math.round(Math.random() * 800) : 90 + Math.round(Math.random() * 260);
  await delay(Math.min(latencyMs, 1800)); // cap the actual UI wait so demos stay snappy

  const correlationId = randomId("corr", 10);
  const scenario = SCENARIO_MAP[input.scenario];
  const body = scenario ? scenario.body(input.endpoint) : { ...input.endpoint.successExample };
  const status = scenario ? scenario.status : input.endpoint.method === "POST" ? 201 : 200;

  const responseHeaders: Record<string, string> = {
    "content-type": "application/json",
    "x-correlation-id": correlationId,
    "x-environment": input.environment,
  };
  if (input.scenario === "rate_limit_exceeded") responseHeaders["retry-after"] = "30";

  return {
    status,
    ok: status < 400,
    body,
    headers: responseHeaders,
    latencyMs,
    sizeBytes: JSON.stringify(body).length,
    correlationId,
    timestamp: new Date().toISOString(),
    environment: input.environment,
  };
}

export function codeSample(language: string, method: string, url: string, headers: Record<string, string>, body?: unknown): string {
  const bodyStr = body ? JSON.stringify(body, null, 2) : undefined;
  switch (language) {
    case "cURL":
      return `curl -X ${method} "${url}" \\\n${Object.entries(headers).map(([k, v]) => `  -H "${k}: ${v}" \\\n`).join("")}${bodyStr ? `  -d '${JSON.stringify(body)}'` : ""}`.trim();
    case "JavaScript":
      return `const res = await fetch("${url}", {\n  method: "${method}",\n  headers: ${JSON.stringify(headers, null, 2)},\n${bodyStr ? `  body: JSON.stringify(${bodyStr}),\n` : ""}});\nconst data = await res.json();`;
    case "Node.js":
      return `import fetch from "node-fetch";\n\nconst res = await fetch("${url}", {\n  method: "${method}",\n  headers: ${JSON.stringify(headers, null, 2)},\n${bodyStr ? `  body: JSON.stringify(${bodyStr}),\n` : ""}});\nconst data = await res.json();`;
    case "Python":
      return `import requests\n\nresp = requests.request(\n    "${method}", "${url}",\n    headers=${JSON.stringify(headers)},\n${bodyStr ? `    json=${bodyStr},\n` : ""})\nprint(resp.json())`;
    case "Java":
      return `HttpRequest request = HttpRequest.newBuilder()\n    .uri(URI.create("${url}"))\n${Object.entries(headers).map(([k, v]) => `    .header("${k}", "${v}")\n`).join("")}    .method("${method}", ${bodyStr ? `HttpRequest.BodyPublishers.ofString(${JSON.stringify(JSON.stringify(body))})` : "HttpRequest.BodyPublishers.noBody()"})\n    .build();`;
    case "C#":
      return `var client = new HttpClient();\nvar request = new HttpRequestMessage(HttpMethod.${method[0]}${method.slice(1).toLowerCase()}, "${url}");\n${Object.entries(headers).map(([k, v]) => `request.Headers.Add("${k}", "${v}");\n`).join("")}${bodyStr ? `request.Content = new StringContent(${JSON.stringify(JSON.stringify(body))}, Encoding.UTF8, "application/json");\n` : ""}var response = await client.SendAsync(request);`;
    case "PHP":
      return `$ch = curl_init("${url}");\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ${JSON.stringify(Object.entries(headers).map(([k, v]) => `${k}: ${v}`))});\n${bodyStr ? `curl_setopt($ch, CURLOPT_POSTFIELDS, '${JSON.stringify(body)}');\n` : ""}$response = curl_exec($ch);`;
    case "Go":
      return `req, _ := http.NewRequest("${method}", "${url}", ${bodyStr ? `bytes.NewBuffer([]byte(\`${JSON.stringify(body)}\`))` : "nil"})\n${Object.entries(headers).map(([k, v]) => `req.Header.Set("${k}", "${v}")\n`).join("")}resp, _ := http.DefaultClient.Do(req)`;
    case "Kotlin":
      return `val client = OkHttpClient()\nval request = Request.Builder()\n    .url("${url}")\n${Object.entries(headers).map(([k, v]) => `    .addHeader("${k}", "${v}")\n`).join("")}    .method("${method}", ${bodyStr ? `"${JSON.stringify(body)}".toRequestBody("application/json".toMediaType())` : "null"})\n    .build()\nval response = client.newCall(request).execute()`;
    case "Swift":
      return `var request = URLRequest(url: URL(string: "${url}")!)\nrequest.httpMethod = "${method}"\n${Object.entries(headers).map(([k, v]) => `request.setValue("${v}", forHTTPHeaderField: "${k}")\n`).join("")}${bodyStr ? `request.httpBody = try? JSONSerialization.data(withJSONObject: ${JSON.stringify(body)})\n` : ""}let (data, response) = try await URLSession.shared.data(for: request)`;
    case "Flutter":
      return `final response = await http.${method.toLowerCase()}(\n  Uri.parse("${url}"),\n  headers: ${JSON.stringify(headers)},\n${bodyStr ? `  body: jsonEncode(${bodyStr}),\n` : ""});`;
    default:
      return "// Select a language to see a code sample.";
  }
}

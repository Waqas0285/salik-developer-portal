import type { ApiDefinition, ApiEndpoint, ApiSchemaField } from "@/types";

// Converts our internal ApiDefinition/ApiEndpoint model into a realistic
// OpenAPI 3.0 document object, used to power the JSON/YAML toggle views and
// the "Download specification" action on the API detail page. Building this
// from the same structure the Swagger-style viewer renders (rather than
// maintaining separate hand-written spec files) keeps both views guaranteed
// to match.

function schemaFromFields(fields: ApiSchemaField[] = []): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const f of fields) {
    properties[f.name] = {
      type: f.type.startsWith("array") ? "array" : f.type.includes("integer") ? "integer" : f.type.includes("number") ? "number" : f.type.includes("boolean") ? "boolean" : "string",
      description: f.description,
      ...(f.example !== undefined ? { example: f.example } : {}),
      ...(f.enum ? { enum: f.enum } : {}),
    };
    if (f.required) required.push(f.name);
  }
  return { type: "object", properties, ...(required.length ? { required } : {}) };
}

function pathItemFor(endpoint: ApiEndpoint) {
  const method = endpoint.method.toLowerCase();
  const parameters = endpoint.parameters
    .filter((p) => p.in !== "header" || p.name.startsWith("X-") || p.required === false)
    .map((p) => ({
      name: p.name,
      in: p.in,
      required: p.required,
      description: p.description,
      schema: { type: p.type.includes("integer") ? "integer" : "string", ...(p.enum ? { enum: p.enum } : {}) },
      example: p.example,
    }));

  const responses: Record<string, unknown> = {
    [endpoint.method === "POST" ? "201" : "200"]: {
      description: "Successful response",
      content: { "application/json": { schema: schemaFromFields(endpoint.responseSchema), example: endpoint.successExample } },
    },
  };
  for (const err of endpoint.errorExamples) {
    responses[String(err.status)] = {
      description: err.code,
      content: { "application/json": { example: err.example } },
    };
  }

  return {
    [method]: {
      summary: endpoint.summary,
      description: endpoint.description,
      operationId: endpoint.id,
      parameters,
      ...(endpoint.requestBody
        ? { requestBody: { required: true, content: { "application/json": { schema: schemaFromFields(endpoint.requestBody) } } } }
        : {}),
      responses,
    },
  };
}

export function buildOpenApiSpec(api: ApiDefinition): Record<string, unknown> {
  const paths: Record<string, unknown> = {};
  for (const ep of api.endpoints) {
    paths[ep.path] = { ...((paths[ep.path] as object) ?? {}), ...pathItemFor(ep) };
  }
  return {
    openapi: "3.0.3",
    info: {
      title: api.name,
      description: api.businessPurpose,
      version: api.version,
      contact: { name: api.owner, email: `${api.owner.toLowerCase().replace(/\s+/g, ".")}@salik-demo.ae` },
    },
    servers: [
      { url: "https://sandbox-api.salik-demo.ae", description: "Sandbox" },
      { url: "https://api.salik-demo.ae", description: "Production" },
    ],
    tags: [{ name: api.category }],
    paths,
  };
}

import { delay, randomId } from "@/lib/utils";

export interface GeneratedCredentials {
  clientId: string;
  clientSecret: string;
  apiKey: string;
}

/** Simulates a credential-generation round trip to a backend (there is none — purely local). */
export async function generateCredentials(environment: "sandbox" | "production"): Promise<GeneratedCredentials> {
  await delay(600);
  return {
    clientId: randomId("client", 16),
    clientSecret: randomId("secret", 32),
    apiKey: randomId(environment === "production" ? "sk_live" : "sk_test", 24),
  };
}

export async function rotateSecret(): Promise<string> {
  await delay(500);
  return randomId("secret", 32);
}

export async function revokeKey(): Promise<{ revoked: boolean }> {
  await delay(400);
  return { revoked: true };
}

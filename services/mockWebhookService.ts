import { delay, randomId } from "@/lib/utils";
import type { WebhookDelivery } from "@/types";

export async function sendTestEvent(webhookId: string, eventType: string): Promise<WebhookDelivery> {
  await delay(700);
  const success = Math.random() > 0.2;
  return {
    id: randomId("whd", 12),
    webhookId,
    eventType,
    status: success ? "Delivered" : "Failed",
    attempt: 1,
    timestamp: new Date().toISOString(),
    requestPayload: { event: eventType, id: randomId("evt", 10), timestamp: new Date().toISOString(), test: true },
    responseStatus: success ? 200 : 503,
    responseBody: success ? '{"received":true}' : '{"error":"endpoint unreachable"}',
  };
}

export async function retryDelivery(delivery: WebhookDelivery): Promise<WebhookDelivery> {
  await delay(600);
  const success = Math.random() > 0.3;
  return { ...delivery, status: success ? "Delivered" : "Retrying", attempt: delivery.attempt + 1, timestamp: new Date().toISOString(), responseStatus: success ? 200 : null };
}

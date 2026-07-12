"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bot, Send, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg {
  id: number;
  role: "user" | "assistant";
  text: string;
  links?: { label: string; href: string }[];
  code?: string;
}

interface Rule {
  keywords: string[];
  respond: () => Omit<Msg, "id" | "role">;
}

const RULES: Rule[] = [
  {
    keywords: ["integrate", "parking payment"],
    respond: () => ({
      text:
        "To integrate Parking Payment API: 1) Create an application in My Applications, 2) Subscribe to the API in Sandbox, 3) Generate credentials, 4) Call POST /v1/parking/payments with an Idempotency-Key header, sessionId, vehiclePlate, amountAed and paymentMethod. Test it live in API Explorer before moving to production.",
      links: [{ label: "Try it in API Explorer", href: "/api-explorer" }, { label: "Parking Payment API docs", href: "/apis/parking-payment-api" }],
      code: `curl -X POST https://sandbox-api.salik-demo.ae/v1/parking/payments \\\n  -H "Authorization: Bearer $SALIK_API_KEY" \\\n  -H "Idempotency-Key: idem_7f3a9c21" \\\n  -H "Content-Type: application/json" \\\n  -d '{"sessionId":"psn_7QK2M9XZ","vehiclePlate":"A 12345","amountAed":12.5,"paymentMethod":"WALLET"}'`,
    }),
  },
  {
    keywords: ["sandbox api key", "sandbox key", "get a key", "obtain"],
    respond: () => ({
      text:
        "Go to My Applications → Create Application → select Sandbox environment → assign the APIs you need → Save. Your Client ID, Client Secret, and API Key are generated instantly and viewable (masked) under Credentials.",
      links: [{ label: "Open My Applications", href: "/applications" }],
    }),
  },
  {
    keywords: ["401", "unauthenticated", "unauthorized"],
    respond: () => ({
      text:
        "HTTP 401 means your credentials are missing, malformed, or expired. Check that: the Authorization header is present, the API key/token matches the environment you're calling (sandbox keys don't work against production), and the key hasn't been rotated or revoked recently.",
      links: [{ label: "Check Security → Credentials", href: "/security" }],
    }),
  },
  {
    keywords: ["429", "rate limit"],
    respond: () => ({
      text:
        "HTTP 429 means you've exceeded the per-minute rate limit for your plan. Back off using the Retry-After header, and consider batching requests. You can see your current rate limit and TPS usage on the API's detail page under SLAs and Limits.",
      links: [{ label: "View Analytics → TPS", href: "/analytics" }],
    }),
  },
  {
    keywords: ["webhook", "configure a webhook"],
    respond: () => ({
      text:
        "Go to Events and Webhooks → Create Webhook. Enter your endpoint URL, pick the events to subscribe to (e.g. parking.session.expired), choose HMAC Signature auth, and set a retry policy. Use 'Send test event' to verify delivery before going live.",
      links: [{ label: "Open Webhooks", href: "/webhooks" }],
    }),
  },
  {
    keywords: ["ev charging provider", "ev provider", "which apis should an ev"],
    respond: () => ({
      text:
        "For an EV charging provider we recommend: EV Charger Discovery API, EV Charging Session API, Charging Reservation, Salik Wallet API, Payment API, and the Charging Completion Event via Webhooks.",
      links: [{ label: "EV Charging Session API", href: "/apis/ev-charging-session-api" }],
    }),
  },
  {
    keywords: ["parking operator", "which apis should a parking"],
    respond: () => ({
      text:
        "For a parking operator we recommend: Parking Session API, Parking Payment API, Parking Availability API, Refund API, Salik Wallet API, and Customer Profile API (with consent).",
      links: [{ label: "Parking Session API", href: "/apis/parking-session-api" }],
    }),
  },
  {
    keywords: ["process a refund", "how do i refund", "issue a refund"],
    respond: () => ({
      text:
        "Call POST /v1/refunds with the originalTransactionId, amountAed (up to the original amount), and a reason code. Refunds are typically settled within minutes in sandbox. You can also trigger refunds from Transactions → select a transaction → Refund.",
      links: [{ label: "Refund API docs", href: "/apis/refund-api" }, { label: "Transactions", href: "/transactions" }],
    }),
  },
  {
    keywords: ["sandbox to production", "move to production", "go live"],
    respond: () => ({
      text:
        "Open your subscription and complete the production approval checklist: NDA accepted, trade license verified, security review completed, technical certification passed, UAT completed, SLA accepted, commercial agreement signed. Once all items are checked, production credentials are issued automatically in this demo.",
      links: [{ label: "API Subscriptions", href: "/subscriptions" }],
    }),
  },
  {
    keywords: ["failed tps", "what does failed tps"],
    respond: () => ({
      text:
        "Failed TPS is the number of transactions per second that returned a non-success response (4xx/5xx, timeout). It's tracked separately from total TPS so you can see reliability degrade even when raw throughput looks healthy.",
      links: [{ label: "View Health dashboard", href: "/health" }],
    }),
  },
  {
    keywords: ["vehicle payments", "apis that support vehicle payments"],
    respond: () => ({
      text:
        "APIs supporting vehicle-linked payments: Parking Payment API, Fuel Payment API, Toll Transaction API, EV Charging Payment (via EV Charging Session API), Car Wash Payment API, and the underlying Salik Wallet API.",
      links: [{ label: "Browse API Marketplace", href: "/marketplace" }],
    }),
  },
  {
    keywords: ["oauth client credentials", "explain oauth"],
    respond: () => ({
      text:
        "OAuth 2.0 Client Credentials is a machine-to-machine flow: your application exchanges its Client ID and Client Secret for a short-lived access token at the token endpoint, then sends that token as a Bearer token on subsequent API calls. No end-user login is involved — used for server-to-server integrations like AI & Data APIs.",
    }),
  },
  {
    keywords: ["sample parking request", "generate a sample", "example parking"],
    respond: () => ({
      text: "Here's a sample Parking Payment request body:",
      code: `{\n  "sessionId": "psn_7QK2M9XZ",\n  "vehiclePlate": "A 12345",\n  "amountAed": 12.5,\n  "paymentMethod": "WALLET",\n  "locationId": "zone_dxb_mall_l2"\n}`,
      links: [{ label: "Open in API Explorer", href: "/api-explorer" }],
    }),
  },
];

const FALLBACK = () => ({
  text:
    "I can help with integration steps, error codes (401/429/etc.), webhook setup, API recommendations by partner type, refunds, sandbox→production migration, and sample requests. Try asking something like \"How do I integrate the Parking Payment API?\"",
  links: [{ label: "Browse documentation", href: "/documentation" }],
});

let msgId = 0;

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: ++msgId, role: "assistant", text: "Hi, I'm the Salik API Assistant (demo). Ask me about integrations, errors, webhooks, or API recommendations." },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { id: ++msgId, role: "user", text };
    const lower = text.toLowerCase();
    const rule = RULES.find((r) => r.keywords.some((k) => lower.includes(k)));
    const reply = (rule ?? { respond: FALLBACK }).respond();
    const assistantMsg: Msg = { id: ++msgId, role: "assistant", ...reply };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-salik-600 text-white shadow-popover transition hover:bg-salik-700"
        aria-label="Open AI Assistant"
      >
        {open ? <X size={20} /> : <Bot size={20} />}
      </button>

      {open && (
        <div className="surface-card fixed bottom-20 right-5 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col rounded-2xl shadow-popover">
          <div className="flex items-center gap-2 rounded-t-2xl bg-charcoal-950 px-4 py-3 text-white">
            <Sparkles size={16} className="text-salik-400" />
            <div>
              <p className="text-sm font-semibold">Salik API Assistant</p>
              <p className="text-[10px] text-charcoal-400">Demo assistant · keyword-matched, no external AI call</p>
            </div>
          </div>

          <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-3.5">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed",
                    m.role === "user" ? "bg-salik-600 text-white" : "bg-charcoal-100 dark:bg-charcoal-800"
                  )}
                >
                  <p>{m.text}</p>
                  {m.code && (
                    <pre className="scrollbar-thin mt-2 overflow-x-auto rounded-lg bg-charcoal-950 p-2 text-[10.5px] text-charcoal-100">
                      <code>{m.code}</code>
                    </pre>
                  )}
                  {m.links && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-salik-700 shadow-card dark:bg-charcoal-900 dark:text-salik-300"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-charcoal-100 p-2.5 dark:border-charcoal-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about integration, errors, webhooks…"
              aria-label="Ask the AI assistant"
              className="flex-1 rounded-lg border border-charcoal-200 bg-transparent px-3 py-2 text-xs outline-none focus:border-salik-500 dark:border-charcoal-700"
            />
            <button onClick={send} className="flex h-8 w-8 items-center justify-center rounded-lg bg-salik-600 text-white" aria-label="Send">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

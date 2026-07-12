"use client";
import Link from "next/link";
import { BookOpen, Rocket, Webhook, ShieldCheck, LifeBuoy, Boxes } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { FAQS } from "@/data/supportTickets";

const GUIDES = [
  { icon: Rocket, title: "Getting started", body: "Create an application, generate sandbox credentials, and make your first API call in under 10 minutes.", href: "/applications" },
  { icon: BookOpen, title: "API reference", body: "Browse the full API Marketplace with interactive Swagger-style documentation for every published API.", href: "/marketplace" },
  { icon: Webhook, title: "Events & webhooks", body: "Learn the event catalog, webhook signing, retry policy, and delivery log format.", href: "/webhooks" },
  { icon: ShieldCheck, title: "Authentication & security", body: "API keys, OAuth 2.0 client credentials, mTLS, and credential rotation best practices.", href: "/security" },
  { icon: Boxes, title: "SDKs & tools", body: "Download SDKs, Postman/Insomnia collections, and CLI tooling for your platform.", href: "/sdks" },
  { icon: LifeBuoy, title: "Support", body: "FAQs, troubleshooting guides, and how to open a support ticket.", href: "/support" },
];

export default function DocumentationPage() {
  return (
    <div>
      <PageHeader title="Documentation" description="Everything you need to integrate with the Salik API platform." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {GUIDES.map((g) => (
          <Link key={g.title} href={g.href}>
            <Card className="h-full transition hover:shadow-popover">
              <CardContent>
                <g.icon size={20} className="text-salik-600" />
                <p className="mt-2 text-sm font-semibold">{g.title}</p>
                <p className="mt-1 text-xs text-muted">{g.body}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-semibold">Frequently asked questions</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {FAQS.map((f) => (
          <details key={f.q} className="surface-card rounded-lg p-3 text-xs shadow-card">
            <summary className="cursor-pointer font-medium">{f.q}</summary>
            <p className="mt-1.5 text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

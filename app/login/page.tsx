"use client";
import { useState } from "react";
import { CheckCircle2, ArrowRight, Radio, Fuel, ParkingSquare, Zap } from "lucide-react";
import { SalikLogo } from "@/components/common/SalikLogo";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { DEMO_USERS, usePersona } from "@/components/persona/PersonaProvider";

const PERSONA_BLURB: Record<string, string> = {
  partner_developer: "Build and test integrations against Salik APIs in a full sandbox.",
  partner_business: "Track subscriptions, revenue share, and partner performance.",
  product_manager: "Own the API catalogue, lifecycle, and adoption metrics.",
  tech_admin: "Administer platform security, credentials, and system health.",
  operations: "Monitor live traffic, incidents, and SLA compliance.",
  management: "Executive view of partners, revenue, and platform KPIs.",
};

export default function LoginPage() {
  const { login } = usePersona();
  const [selected, setSelected] = useState(DEMO_USERS[0].id);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-salik-hero px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-road-lines opacity-40" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-salik-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-salik-400/10 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-charcoal-950/60 shadow-popover backdrop-blur-xl lg:grid-cols-5">
        {/* Left brand panel */}
        <div className="relative hidden flex-col justify-between p-10 lg:col-span-2 lg:flex">
          <div>
            <SalikLogo className="text-white" />
            <p className="mt-8 text-3xl font-bold leading-tight text-white">
              One platform for the UAE&apos;s connected mobility ecosystem
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Toll, parking, wallet, fuel, EV charging, and vehicle-service APIs — discoverable,
              testable, and monitorable from a single developer portal.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Radio, label: "Toll & Access APIs" },
              { icon: ParkingSquare, label: "Parking APIs" },
              { icon: Fuel, label: "Fuel & EV APIs" },
              { icon: Zap, label: "AI & Data APIs" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                <Icon size={16} className="text-salik-300" />
                <span className="text-xs text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right login panel */}
        <div className="col-span-1 bg-white p-8 dark:bg-charcoal-900 lg:col-span-3 lg:p-12">
          <div className="mb-2 flex items-center gap-2 lg:hidden">
            <SalikLogo />
          </div>
          <h1 className="text-2xl font-bold">Enter the portal</h1>
          <p className="mt-1 text-sm text-muted">
            This is a demonstration environment. Select a demo persona below — no password required.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DEMO_USERS.map((u) => {
              const active = selected === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelected(u.id)}
                  className={`group relative flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                    active
                      ? "border-salik-500 bg-salik-50 dark:bg-salik-950/40"
                      : "border-charcoal-200 hover:border-salik-300 dark:border-charcoal-700"
                  }`}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: u.avatarColor }}
                  >
                    {u.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{u.name}</p>
                    <p className="truncate text-xs font-medium text-salik-600 dark:text-salik-400">{u.personaLabel}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted">{PERSONA_BLURB[u.persona]}</p>
                  </div>
                  {active && (
                    <CheckCircle2 size={16} className="absolute right-3 top-3 text-salik-500" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => login(selected)}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-salik-600 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-salik-700"
          >
            Enter Portal <ArrowRight size={16} />
          </button>

          <div className="mt-6 border-t border-charcoal-100 pt-4 dark:border-charcoal-800">
            <DisclaimerBanner />
          </div>
        </div>
      </div>
    </div>
  );
}

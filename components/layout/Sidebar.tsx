"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { ICON_MAP } from "@/lib/icon-map";
import { usePersona } from "@/components/persona/PersonaProvider";
import { SalikLogo } from "@/components/common/SalikLogo";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = usePersona();
  const items = NAV_ITEMS.filter((item) => !user || item.personas.includes(user.persona));

  const body = (
    <div className="flex h-full flex-col bg-charcoal-950 text-charcoal-100">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <SalikLogo mark className="text-white" />
        <button onClick={onClose} className="text-white/60 hover:text-white lg:hidden" aria-label="Close menu">
          <X size={20} />
        </button>
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2.5 py-3">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onClose}
              className={cn(
                "mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition",
                active
                  ? "bg-salik-600 text-white shadow-card"
                  : "text-charcoal-300 hover:bg-white/5 hover:text-white"
              )}
            >
              {Icon && <Icon size={16} className="shrink-0" />}
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <p className="text-[10px] leading-relaxed text-charcoal-400">
          Demo environment · v1.0.0 · All data fictional
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">{body}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-64">{body}</div>
        </div>
      )}
    </>
  );
}

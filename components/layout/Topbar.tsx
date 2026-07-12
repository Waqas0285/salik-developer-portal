"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Bell, ChevronDown, LogOut, UserCog, Search } from "lucide-react";
import { usePersona, DEMO_USERS } from "@/components/persona/PersonaProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useNotifications } from "@/components/common/NotificationsProvider";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout, switchPersona } = usePersona();
  const { unreadCount } = useNotifications();
  const [personaOpen, setPersonaOpen] = useState(false);
  const [envMenu, setEnvMenu] = useState<"sandbox" | "production">("sandbox");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setPersonaOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  return (
    <header className="surface-card sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b px-4">
      <button onClick={onMenuClick} className="text-muted hover:text-current lg:hidden" aria-label="Open menu">
        <Menu size={22} />
      </button>

      <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-lg border border-charcoal-200 px-3 py-1.5 text-sm text-muted dark:border-charcoal-700 md:flex">
        <Search size={15} />
        <span className="truncate">Search APIs, partners, transactions…</span>
      </div>

      <div className="flex-1" />

      <button
        onClick={() => setEnvMenu(envMenu === "sandbox" ? "production" : "sandbox")}
        className={`hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold sm:flex ${
          envMenu === "sandbox" ? "bg-info-light text-info" : "bg-success-light text-success"
        }`}
        title="Toggle demo environment context"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {envMenu === "sandbox" ? "Sandbox" : "Production"}
      </button>

      <Link
        href="/notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

      <ThemeToggle />

      <div className="relative" ref={ref}>
        <button
          onClick={() => setPersonaOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-charcoal-200 py-1 pl-1 pr-2 transition hover:bg-charcoal-100 dark:border-charcoal-700 dark:hover:bg-charcoal-800"
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.avatarInitials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold leading-tight">{user.name}</p>
            <p className="text-[10px] leading-tight text-muted">{user.personaLabel}</p>
          </div>
          <ChevronDown size={14} className="text-muted" />
        </button>

        {personaOpen && (
          <div className="surface-card absolute right-0 top-11 w-72 rounded-xl p-2 shadow-popover">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Switch demo persona
            </p>
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  switchPersona(u.id);
                  setPersonaOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-charcoal-100 dark:hover:bg-charcoal-800 ${
                  u.id === user.id ? "bg-salik-50 dark:bg-salik-950/40" : ""
                }`}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: u.avatarColor }}
                >
                  {u.avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{u.name}</p>
                  <p className="truncate text-[11px] text-muted">{u.personaLabel}</p>
                </div>
              </button>
            ))}
            <div className="my-1.5 border-t border-charcoal-100 dark:border-charcoal-800" />
            <Link
              href="/profile"
              onClick={() => setPersonaOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-current hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
            >
              <UserCog size={15} /> View profile
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-danger hover:bg-danger-light"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

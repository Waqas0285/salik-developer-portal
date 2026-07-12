"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/components/persona/PersonaProvider";
import { NotificationsProvider } from "@/components/common/NotificationsProvider";
import { AppDataProvider } from "@/components/common/AppDataProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Footer } from "@/components/layout/Footer";
import { AiAssistant } from "@/components/ai/AiAssistant";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = usePersona();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-salik-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <NotificationsProvider>
      <AppDataProvider>
        <div className="flex min-h-screen">
          <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
          <div className="flex min-h-screen flex-1 flex-col">
            <Topbar onMenuClick={() => setMobileOpen(true)} />
            <main className="flex-1 bg-[rgb(var(--bg))] p-4 sm:p-6">{children}</main>
            <Footer />
          </div>
        </div>
        <AiAssistant />
      </AppDataProvider>
    </NotificationsProvider>
  );
}

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/components/persona/PersonaProvider";
import { PERSONA_LANDING } from "@/lib/constants";

export default function RootPage() {
  const router = useRouter();
  const { user, hydrated } = usePersona();

  useEffect(() => {
    if (!hydrated) return;
    if (user) router.replace(PERSONA_LANDING[user.persona]);
    else router.replace("/login");
  }, [hydrated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-salik-500 border-t-transparent" />
    </div>
  );
}

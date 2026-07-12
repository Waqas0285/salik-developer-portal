"use client";
import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEMO_USERS, getUserById } from "@/data/users";
import { PERSONA_LANDING } from "@/lib/constants";
import type { DemoUser } from "@/types";

interface PersonaContextValue {
  user: DemoUser | null;
  hydrated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  switchPersona: (userId: string) => void;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId, hydrated] = useLocalStorage<string | null>("salik_portal_user", null);
  const router = useRouter();

  const login = useCallback(
    (id: string) => {
      setUserId(id);
      const u = getUserById(id);
      router.push(u ? PERSONA_LANDING[u.persona] : "/dashboard");
    },
    [router, setUserId]
  );

  const logout = useCallback(() => {
    setUserId(null);
    router.push("/login");
  }, [router, setUserId]);

  const switchPersona = useCallback(
    (id: string) => {
      setUserId(id);
      const u = getUserById(id);
      router.push(u ? PERSONA_LANDING[u.persona] : "/dashboard");
    },
    [router, setUserId]
  );

  const user = useMemo(() => (userId ? getUserById(userId) ?? null : null), [userId]);

  const value = useMemo(
    () => ({ user, hydrated, login, logout, switchPersona }),
    [user, hydrated, login, logout, switchPersona]
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersona must be used within PersonaProvider");
  return ctx;
}

export { DEMO_USERS };

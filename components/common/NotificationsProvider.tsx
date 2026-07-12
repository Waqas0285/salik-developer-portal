"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { NOTIFICATIONS as SEED } from "@/data/notifications";
import type { AppNotification, NotificationType } from "@/types";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  push: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  filterType: NotificationType | "All";
  setFilterType: (t: NotificationType | "All") => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED);
  const [filterType, setFilterType] = useState<NotificationType | "All">("All");

  const markAsRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const remove = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const push: NotificationsContextValue["push"] = (n) =>
    setNotifications((prev) => [
      { ...n, id: `ntf_${Date.now()}`, timestamp: new Date().toISOString(), read: false },
      ...prev,
    ]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllRead, remove, push, filterType, setFilterType }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

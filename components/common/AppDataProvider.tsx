"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { SUBSCRIPTIONS } from "@/data/subscriptions";
import { APPLICATIONS } from "@/data/applications";
import { WEBHOOKS, WEBHOOK_DELIVERIES } from "@/data/webhooks";
import { SUPPORT_TICKETS } from "@/data/supportTickets";
import { TRANSACTIONS } from "@/data/transactions";
import { PARTNERS } from "@/data/partners";
import { useNotifications } from "@/components/common/NotificationsProvider";
import { randomId } from "@/lib/utils";
import type {
  Subscription, Application, Webhook, WebhookDelivery, SupportTicket, Transaction, Partner,
  ApprovalChecklistItem, SubscriptionStatus,
} from "@/types";

interface AppDataContextValue {
  subscriptions: Subscription[];
  addSubscription: (s: Subscription) => void;
  updateSubscriptionStatus: (id: string, status: SubscriptionStatus) => void;
  toggleChecklistItem: (subscriptionId: string, key: string) => void;

  applications: Application[];
  addApplication: (a: Application) => void;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  deleteApplication: (id: string) => void;

  webhooks: Webhook[];
  addWebhook: (w: Webhook) => void;
  updateWebhook: (id: string, patch: Partial<Webhook>) => void;
  deliveries: WebhookDelivery[];
  addDelivery: (d: WebhookDelivery) => void;
  updateDelivery: (id: string, patch: Partial<WebhookDelivery>) => void;

  tickets: SupportTicket[];
  addTicket: (t: SupportTicket) => void;
  updateTicket: (id: string, patch: Partial<SupportTicket>) => void;

  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;

  partners: Partner[];
  updatePartner: (id: string, patch: Partial<Partner>) => void;

  favorites: string[];
  toggleFavorite: (apiId: string) => void;
  compareList: string[];
  toggleCompare: (apiId: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { push } = useNotifications();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(SUBSCRIPTIONS);
  const [applications, setApplications] = useState<Application[]>(APPLICATIONS);
  const [webhooks, setWebhooks] = useState<Webhook[]>(WEBHOOKS);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>(WEBHOOK_DELIVERIES);
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);
  const [partners, setPartners] = useState<Partner[]>(PARTNERS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);

  const addSubscription = useCallback((s: Subscription) => setSubscriptions((prev) => [s, ...prev]), []);

  const updateSubscriptionStatus = useCallback(
    (id: string, status: SubscriptionStatus) => {
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s)));
      const sub = subscriptions.find((s) => s.id === id);
      if (status === "Approved") {
        push("success", "Subscription approved", `${sub?.apiOrProductName ?? "API"} subscription is now approved.`, );
      } else if (status === "Rejected") {
        push("warning", "Subscription rejected", `${sub?.apiOrProductName ?? "API"} subscription was rejected.`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subscriptions]
  );

  const toggleChecklistItem = useCallback((subscriptionId: string, key: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== subscriptionId) return s;
        const checklist: ApprovalChecklistItem[] = s.approvalChecklist.map((c) => (c.key === key ? { ...c, done: !c.done } : c));
        const allDone = checklist.length > 0 && checklist.every((c) => c.done);
        return { ...s, approvalChecklist: checklist, status: allDone ? "Approved" : s.status, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const addApplication = useCallback((a: Application) => setApplications((prev) => [a, ...prev]), []);
  const updateApplication = useCallback((id: string, patch: Partial<Application>) => setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))), []);
  const deleteApplication = useCallback((id: string) => setApplications((prev) => prev.filter((a) => a.id !== id)), []);

  const addWebhook = useCallback((w: Webhook) => setWebhooks((prev) => [w, ...prev]), []);
  const updateWebhook = useCallback((id: string, patch: Partial<Webhook>) => setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w))), []);
  const addDelivery = useCallback((d: WebhookDelivery) => setDeliveries((prev) => [d, ...prev]), []);
  const updateDelivery = useCallback((id: string, patch: Partial<WebhookDelivery>) => setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d))), []);

  const addTicket = useCallback((t: SupportTicket) => setTickets((prev) => [t, ...prev]), []);
  const updateTicket = useCallback((id: string, patch: Partial<SupportTicket>) => setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))), []);

  const addTransaction = useCallback((t: Transaction) => setTransactions((prev) => [t, ...prev]), []);

  const updatePartner = useCallback((id: string, patch: Partial<Partner>) => setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))), []);

  const toggleFavorite = useCallback((apiId: string) => setFavorites((prev) => (prev.includes(apiId) ? prev.filter((id) => id !== apiId) : [...prev, apiId])), []);
  const toggleCompare = useCallback(
    (apiId: string) =>
      setCompareList((prev) => (prev.includes(apiId) ? prev.filter((id) => id !== apiId) : prev.length >= 4 ? prev : [...prev, apiId])),
    []
  );

  return (
    <AppDataContext.Provider
      value={{
        subscriptions, addSubscription, updateSubscriptionStatus, toggleChecklistItem,
        applications, addApplication, updateApplication, deleteApplication,
        webhooks, addWebhook, updateWebhook, deliveries, addDelivery, updateDelivery,
        tickets, addTicket, updateTicket,
        transactions, addTransaction,
        partners, updatePartner,
        favorites, toggleFavorite, compareList, toggleCompare,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function newId(prefix: string) {
  return randomId(prefix, 12);
}

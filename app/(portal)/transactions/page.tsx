"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Download, FileJson } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useAppData } from "@/components/common/AppDataProvider";
import { toCsv, downloadFile } from "@/services/mockTransactionService";
import { formatAED, formatDate } from "@/lib/utils";
import type { Transaction, TransactionCategory, TransactionStatus } from "@/types";

const CATEGORIES: TransactionCategory[] = ["Toll", "Parking", "Fuel", "EV Charging", "Car Wash", "Wallet", "Refund", "Subscription", "Vehicle Services"];
const STATUSES: TransactionStatus[] = ["Success", "Failed", "Pending", "Timeout"];

export default function TransactionsPage() {
  const { transactions } = useAppData();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TransactionCategory | "all">("all");
  const [status, setStatus] = useState<TransactionStatus | "all">("all");
  const [environment, setEnvironment] = useState<"sandbox" | "production" | "all">("all");

  const rows = useMemo(() => {
    return transactions.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (status !== "all" && t.status !== status) return false;
      if (environment !== "all" && t.environment !== environment) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (![t.id, t.correlationId, t.customerName, t.vehiclePlate, t.partnerName, t.apiName].some((v) => v.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [transactions, query, category, status, environment]);

  const columns: Column<Transaction>[] = [
    { key: "id", header: "Transaction ID", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: "ts", header: "Date & Time", render: (r) => formatDate(r.timestamp, true), sortValue: (r) => r.timestamp },
    { key: "partner", header: "Partner", render: (r) => r.partnerName, sortValue: (r) => r.partnerName },
    { key: "customer", header: "Customer", render: (r) => r.customerName },
    { key: "vehicle", header: "Vehicle", render: (r) => <span className="font-mono">{r.vehiclePlate}</span> },
    { key: "category", header: "Category", render: (r) => <Badge label={r.category} className="bg-charcoal-100 text-muted dark:bg-charcoal-800" /> },
    { key: "amount", header: "Amount", render: (r) => formatAED(r.amountAed), sortValue: (r) => r.amountAed },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} />, sortValue: (r) => r.status },
    { key: "env", header: "Env", render: (r) => r.environment },
    { key: "latency", header: "Latency", render: (r) => `${r.latencyMs}ms`, sortValue: (r) => r.latencyMs },
  ];

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Search and drill into every mobility transaction — including live sandbox activity."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => downloadFile("transactions.csv", toCsv(rows), "text/csv")}><Download size={13} /> CSV</Button>
            <Button variant="outline" size="sm" onClick={() => downloadFile("transactions.json", JSON.stringify(rows, null, 2), "application/json")}><FileJson size={13} /> JSON</Button>
          </>
        }
      />

      <div className="surface-card mb-4 flex flex-col gap-3 rounded-xl p-3.5 shadow-card sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-[220px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by ID, customer, plate, partner…" className="pl-9" aria-label="Search transactions" />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value as TransactionCategory | "all")} className="sm:w-44">
          <option value="all">All categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value as TransactionStatus | "all")} className="sm:w-40">
          <option value="all">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={environment} onChange={(e) => setEnvironment(e.target.value as "sandbox" | "production" | "all")} className="sm:w-40">
          <option value="all">All environments</option><option value="sandbox">Sandbox</option><option value="production">Production</option>
        </Select>
      </div>

      <p className="mb-2 text-xs text-muted">{rows.length} transactions</p>
      <div className="surface-card rounded-xl p-2 shadow-card">
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={12} onRowClick={(r) => router.push(`/transactions/${r.id}`)} />
      </div>
    </div>
  );
}

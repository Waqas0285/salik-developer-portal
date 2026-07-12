"use client";
import { useState } from "react";
import { RotateCcw, Plus, Wallet, ParkingSquare, Radio, Zap, Fuel, Undo2, Webhook, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { useAppData, newId } from "@/components/common/AppDataProvider";
import { useToast } from "@/components/common/Toast";
import { sendTestEvent } from "@/services/mockWebhookService";
import {
  SEED_TEST_CUSTOMERS, SEED_TEST_VEHICLES, SEED_TEST_TOLL_GATES, SEED_TEST_PARKING,
  SEED_TEST_FUEL_STATIONS, SEED_TEST_EV_CHARGERS, SEED_TEST_CARWASH, SEED_TEST_MERCHANTS,
} from "@/data/sandboxEntities";
import { WEBHOOK_EVENT_TYPES, WEBHOOKS } from "@/data/webhooks";
import type { Transaction, TransactionCategory } from "@/types";

interface CreatedCustomer { id: string; name: string; balanceAed: number; }
interface CreatedVehicle { plate: string; make: string; model: string; }
interface CreatedVoucher { code: string; benefit: string; }

const PARTNER_ID = "ptn_dubai-mall";
const PARTNER_NAME = "Dubai Mall";

export default function SandboxPage() {
  const { addTransaction, addDelivery } = useAppData();
  const { push } = useToast();

  const [customers, setCustomers] = useState<CreatedCustomer[]>(SEED_TEST_CUSTOMERS.map((c) => ({ id: c.id, name: c.name, balanceAed: 200 })));
  const [vehicles, setVehicles] = useState<CreatedVehicle[]>(SEED_TEST_VEHICLES.map((v) => ({ plate: v.plate, make: v.make, model: v.model })));
  const [vouchers, setVouchers] = useState<CreatedVoucher[]>([{ code: "SALIK-WELCOME10", benefit: "10% off first fuel payment" }]);
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.id ?? "");
  const [topupAmount, setTopupAmount] = useState("50");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newVehiclePlate, setNewVehiclePlate] = useState("");

  function mkTxn(category: TransactionCategory, useCase: string, amountAed: number, apiId: string, apiName: string): Transaction {
    const now = new Date().toISOString();
    return {
      id: newId("txn"), correlationId: newId("corr"), timestamp: now,
      partnerId: PARTNER_ID, partnerName: PARTNER_NAME,
      customerName: customers.find((c) => c.id === selectedCustomer)?.name ?? "Sandbox Customer",
      vehiclePlate: vehicles[0]?.plate ?? "A 00000",
      useCase, region: "Dubai", apiId, apiName, category, amountAed, status: "Success", responseCode: 200,
      latencyMs: Math.round(80 + Math.random() * 150), environment: "sandbox",
      lifecycle: [
        { ts: now, label: "Request received", detail: "Sandbox request accepted." },
        { ts: now, label: "Payment settled", detail: "Ledger updated (sandbox)." },
      ],
      requestPayload: { source: "sandbox", amountAed }, responsePayload: { status: "SUCCESS", amountAed }, retryCount: 0,
    };
  }

  function addBalance() {
    const amt = Number(topupAmount) || 0;
    setCustomers((prev) => prev.map((c) => (c.id === selectedCustomer ? { ...c, balanceAed: c.balanceAed + amt } : c)));
    addTransaction(mkTxn("Wallet", "Wallet top-up", amt, "salik-wallet-api", "Salik Wallet API"));
    push("success", "Wallet balance added", `AED ${amt} credited (sandbox).`);
  }

  function createCustomer() {
    if (!newCustomerName.trim()) return;
    const id = newId("cus");
    setCustomers((prev) => [...prev, { id, name: newCustomerName, balanceAed: 100 }]);
    setNewCustomerName("");
    push("success", "Test customer created", `${newCustomerName} added with AED 100 starting balance.`);
  }

  function createVehicle() {
    if (!newVehiclePlate.trim()) return;
    setVehicles((prev) => [...prev, { plate: newVehiclePlate, make: "Generic", model: "Sandbox Vehicle" }]);
    setNewVehiclePlate("");
    push("success", "Test vehicle created", newVehiclePlate);
  }

  function startParkingSession() {
    addTransaction(mkTxn("Parking", "Parking session started", 0, "parking-session-api", "Parking Session API"));
    push("info", "Parking session started", "Session psn_" + Math.random().toString(36).slice(2, 8));
  }
  function completeParkingPayment() {
    addTransaction(mkTxn("Parking", "Parking payment", 15, "parking-payment-api", "Parking Payment API"));
    push("success", "Parking payment completed", "AED 15.00 charged (sandbox).");
  }
  function simulateToll() {
    addTransaction(mkTxn("Toll", "Toll passage", 4, "toll-transaction-api", "Toll Transaction API"));
    push("success", "Toll passage simulated", "AED 4.00 charged at sandbox gate.");
  }
  function startEvCharging() {
    addTransaction(mkTxn("EV Charging", "EV charging session", 35, "ev-charging-session-api", "EV Charging Session API"));
    push("info", "EV charging session started", "Energy delivery in progress (sandbox).");
  }
  function simulateFuel() {
    addTransaction(mkTxn("Fuel", "Fuel purchase", 100, "fuel-payment-api", "Fuel Payment API"));
    push("success", "Fuel purchase simulated", "AED 100.00 charged (sandbox).");
  }
  function createRefund() {
    addTransaction(mkTxn("Refund", "Refund issued", -15, "refund-api", "Refund API"));
    push("success", "Refund created", "AED 15.00 refunded (sandbox).");
  }
  async function triggerWebhook() {
    const wh = WEBHOOKS[0];
    if (!wh) { push("warning", "No webhooks configured", "Create a webhook under Events and Webhooks first."); return; }
    const event = WEBHOOK_EVENT_TYPES[Math.floor(Math.random() * WEBHOOK_EVENT_TYPES.length)];
    const delivery = await sendTestEvent(wh.id, event.id);
    addDelivery(delivery);
    push(delivery.status === "Delivered" ? "success" : "warning", "Webhook event triggered", `${event.name} → ${wh.url}`);
  }

  function resetSandbox() {
    setCustomers(SEED_TEST_CUSTOMERS.map((c) => ({ id: c.id, name: c.name, balanceAed: 200 })));
    setVehicles(SEED_TEST_VEHICLES.map((v) => ({ plate: v.plate, make: v.make, model: v.model })));
    setVouchers([{ code: "SALIK-WELCOME10", benefit: "10% off first fuel payment" }]);
    push("info", "Sandbox data reset", "Test customers, vehicles, and vouchers restored to defaults.");
  }

  return (
    <div>
      <PageHeader
        title="Sandbox"
        description="Create test entities and simulate mobility transactions — everything here is local to your session and feeds Transaction History."
        actions={<Button variant="outline" size="sm" onClick={resetSandbox}><RotateCcw size={14} /> Reset sandbox data</Button>}
      />
      <DisclaimerBanner className="mb-4" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Simulate a transaction</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <SandboxActionButton icon={ParkingSquare} label="Start parking session" onClick={startParkingSession} />
              <SandboxActionButton icon={ParkingSquare} label="Complete parking payment" onClick={completeParkingPayment} />
              <SandboxActionButton icon={Radio} label="Simulate toll passage" onClick={simulateToll} />
              <SandboxActionButton icon={Zap} label="Start EV charging session" onClick={startEvCharging} />
              <SandboxActionButton icon={Fuel} label="Simulate fuel purchase" onClick={simulateFuel} />
              <SandboxActionButton icon={Undo2} label="Create refund" onClick={createRefund} />
            </div>
            <div className="rounded-lg border border-dashed border-charcoal-200 p-3 text-xs text-muted dark:border-charcoal-700">
              Every action above appends a sandbox transaction to <b className="text-current">Transaction History</b> with a mock lifecycle, correlation ID, and response payload.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Wallet & webhook</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Test customer</Label>
              <Select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — AED {c.balanceAed.toFixed(2)}</option>)}
              </Select>
            </div>
            <div className="flex gap-1.5">
              <Input type="number" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} className="text-xs" />
              <Button size="sm" onClick={addBalance}><Wallet size={13} /> Add balance</Button>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={triggerWebhook}><Webhook size={13} /> Trigger webhook event</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Create test customer</CardTitle></CardHeader>
          <CardContent className="flex gap-1.5">
            <Input value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder="Full name" className="text-xs" />
            <Button size="sm" onClick={createCustomer}><Plus size={13} /></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Create test vehicle</CardTitle></CardHeader>
          <CardContent className="flex gap-1.5">
            <Input value={newVehiclePlate} onChange={(e) => setNewVehiclePlate(e.target.value)} placeholder="e.g. B 40218" className="text-xs" />
            <Button size="sm" onClick={createVehicle}><Plus size={13} /></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Test vouchers</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {vouchers.map((v) => (
              <div key={v.code} className="flex items-center justify-between rounded-lg border border-charcoal-100 px-2.5 py-1.5 text-xs dark:border-charcoal-800">
                <span className="font-mono">{v.code}</span><span className="text-muted">{v.benefit}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <EntityList title="Test customers" items={customers.map((c) => `${c.name} — AED ${c.balanceAed.toFixed(2)}`)} />
        <EntityList title="Test vehicles / plates" items={vehicles.map((v) => `${v.plate} · ${v.make} ${v.model}`)} />
        <EntityList title="Toll gates" items={SEED_TEST_TOLL_GATES.map((g) => g.name)} />
        <EntityList title="Parking locations" items={SEED_TEST_PARKING.map((g) => g.name)} />
        <EntityList title="Fuel stations" items={SEED_TEST_FUEL_STATIONS.map((g) => g.name)} />
        <EntityList title="EV chargers" items={SEED_TEST_EV_CHARGERS.map((g) => g.name)} />
        <EntityList title="Car wash locations" items={SEED_TEST_CARWASH.map((g) => g.name)} />
        <EntityList title="Merchants" items={SEED_TEST_MERCHANTS.map((g) => `${g.name} · ${g.category}`)} />
      </div>
    </div>
  );
}

function SandboxActionButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 rounded-xl border border-charcoal-100 p-3 text-center text-[11px] font-medium transition hover:border-salik-400 hover:bg-salik-50 dark:border-charcoal-800 dark:hover:bg-salik-950/30">
      <Icon size={18} />
      {label}
    </button>
  );
}

function EntityList({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle><Badge label={String(items.length)} className="bg-charcoal-100 text-muted dark:bg-charcoal-800" /></CardHeader>
      <CardContent className="max-h-40 space-y-1 overflow-y-auto scrollbar-thin">
        {items.map((it) => <p key={it} className="truncate text-xs text-muted">{it}</p>)}
      </CardContent>
    </Card>
  );
}

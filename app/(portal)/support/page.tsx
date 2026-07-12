"use client";
import { useState } from "react";
import { Plus, Clock, Send } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useAppData, newId } from "@/components/common/AppDataProvider";
import { useToast } from "@/components/common/Toast";
import { FAQS } from "@/data/supportTickets";
import { formatDate, relativeTime } from "@/lib/utils";
import type { SupportTicket, TicketPriority } from "@/types";

const CATEGORIES = ["Integration support", "Authentication", "API error", "Payment issue", "Refund issue", "Sandbox issue", "Production incident", "Subscription issue", "Credential issue", "Webhook issue", "Commercial query"];
const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Urgent"];
const GUIDES = [
  { title: "Quick-start integration guide", body: "1) Create an application in Sandbox. 2) Subscribe to your first API. 3) Test it in API Explorer. 4) Complete the production checklist under Subscriptions." },
  { title: "Webhook troubleshooting guide", body: "Verify your endpoint returns 2xx within the configured timeout, and that your HMAC signature check uses the raw request body." },
  { title: "Moving from sandbox to production", body: "Complete all 8 items on the production approval checklist under API Subscriptions, then production credentials are issued automatically in this demo." },
];

export default function SupportPage() {
  const { tickets, addTicket, updateTicket } = useAppData();
  const { push } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [comment, setComment] = useState("");

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [description, setDescription] = useState("");

  function createTicket() {
    if (!subject.trim() || !description.trim()) { push("error", "Missing fields", "Subject and description are required."); return; }
    const now = new Date();
    const ticket: SupportTicket = {
      id: `TCK-${Math.floor(2300 + Math.random() * 700)}`,
      subject, category, priority,
      severity: priority === "Urgent" ? "SEV-1" : priority === "High" ? "SEV-2" : priority === "Medium" ? "SEV-3" : "SEV-4",
      status: "Open", assignedTeam: "Platform Support", partnerName: "Your Organization", createdBy: "You",
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
      slaDueAt: new Date(now.getTime() + (priority === "Urgent" ? 4 : priority === "High" ? 8 : 24) * 3600000).toISOString(),
      comments: [{ author: "You", timestamp: now.toISOString(), message: description }],
    };
    addTicket(ticket);
    push("success", "Ticket created", ticket.id);
    setCreateOpen(false);
    setSubject(""); setDescription("");
  }

  function addComment() {
    if (!selected || !comment.trim()) return;
    const updated = [...selected.comments, { author: "You", timestamp: new Date().toISOString(), message: comment }];
    updateTicket(selected.id, { comments: updated, updatedAt: new Date().toISOString() });
    setSelected({ ...selected, comments: updated });
    setComment("");
  }

  const columns: Column<SupportTicket>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-mono">{r.id}</span> },
    { key: "subject", header: "Subject", render: (r) => r.subject },
    { key: "category", header: "Category", render: (r) => r.category },
    { key: "priority", header: "Priority", render: (r) => <Badge label={r.priority} className={r.priority === "Urgent" || r.priority === "High" ? "bg-danger-light text-danger" : "bg-charcoal-100 text-muted dark:bg-charcoal-800"} /> },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} />, sortValue: (r) => r.status },
    { key: "team", header: "Team", render: (r) => r.assignedTeam },
    { key: "updated", header: "Updated", render: (r) => relativeTime(r.updatedAt), sortValue: (r) => r.updatedAt },
  ];

  return (
    <div>
      <PageHeader title="Support Center" description="Track integration issues, incidents, and commercial queries." actions={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> Create ticket</Button>} />

      <Tabs
        defaultTab="tickets"
        tabs={[
          { key: "tickets", label: `Tickets (${tickets.length})`, content: <div className="surface-card rounded-xl p-2 shadow-card"><DataTable columns={columns} rows={tickets} rowKey={(r) => r.id} pageSize={12} onRowClick={setSelected} /></div> },
          {
            key: "kb", label: "Knowledge Base", content: (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold">FAQs</p>
                  <div className="space-y-2">
                    {FAQS.map((f) => (
                      <details key={f.q} className="surface-card rounded-lg p-3 text-xs shadow-card">
                        <summary className="cursor-pointer font-medium">{f.q}</summary>
                        <p className="mt-1.5 text-muted">{f.a}</p>
                      </details>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold">Integration guides</p>
                  <div className="space-y-2">
                    {GUIDES.map((g) => (
                      <div key={g.title} className="surface-card rounded-lg p-3 text-xs shadow-card">
                        <p className="font-medium">{g.title}</p>
                        <p className="mt-1 text-muted">{g.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create support ticket">
        <div className="space-y-4">
          <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of the issue" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Category</Label><Select value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select></div>
            <div><Label>Priority</Label><Select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</Select></div>
          </div>
          <div><Label>Description</Label><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Steps to reproduce, expected vs actual behavior, correlation IDs if available…" /></div>
          <div className="rounded-lg bg-charcoal-50 p-2.5 text-[11px] text-muted dark:bg-charcoal-800">Attachments are not supported in this demo — describe relevant payloads in the text field.</div>
          <Button className="w-full" onClick={createTicket}>Submit ticket</Button>
        </div>
      </Dialog>

      <Dialog open={!!selected} onClose={() => setSelected(null)} title={selected?.subject ?? ""} description={selected?.id}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
              <Row k="Priority" v={selected.priority} /><Row k="Severity" v={selected.severity} /><Row k="Status" v={selected.status} />
              <Row k="Category" v={selected.category} /><Row k="Team" v={selected.assignedTeam} /><Row k="Partner" v={selected.partnerName} />
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-warn-light px-3 py-2 text-[11px] text-warn">
              <Clock size={12} /> SLA due {formatDate(selected.slaDueAt, true)}
            </div>
            <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-charcoal-100 p-2.5 dark:border-charcoal-800">
              {selected.comments.map((c, i) => (
                <div key={i} className="text-xs">
                  <p className="font-semibold">{c.author} <span className="font-normal text-muted">· {relativeTime(c.timestamp)}</span></p>
                  <p className="text-muted">{c.message}</p>
                </div>
              ))}
            </div>
            {selected.resolutionNotes && <div className="rounded-lg bg-success-light p-2.5 text-xs text-success"><b>Resolution:</b> {selected.resolutionNotes}</div>}
            <div className="flex gap-1.5">
              <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" className="text-xs" />
              <Button size="sm" onClick={addComment}><Send size={13} /></Button>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-charcoal-100 pt-3 dark:border-charcoal-800">
              {selected.status !== "Resolved" && <Button size="sm" onClick={() => { updateTicket(selected.id, { status: "Resolved", resolutionNotes: "Resolved by support team." }); setSelected(null); }}>Mark resolved</Button>}
              {selected.status !== "Closed" && <Button size="sm" variant="outline" onClick={() => { updateTicket(selected.id, { status: "Closed" }); setSelected(null); }}>Close ticket</Button>}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between rounded-lg bg-charcoal-50 px-2 py-1.5 dark:bg-charcoal-800"><span className="text-muted">{k}</span><span className="font-medium">{v}</span></div>;
}

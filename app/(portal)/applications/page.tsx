"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, AppWindow, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/common/EmptyState";
import { ApplicationForm, buildNewApplication, type ApplicationFormValues } from "@/components/forms/ApplicationForm";
import { useAppData, newId } from "@/components/common/AppDataProvider";
import { useToast } from "@/components/common/Toast";
import { generateCredentials } from "@/services/mockAuthService";
import { formatDate } from "@/lib/utils";

export default function ApplicationsPage() {
  const { applications, addApplication, deleteApplication } = useAppData();
  const { push } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function handleCreate(values: ApplicationFormValues) {
    const creds = await generateCredentials(values.environment as "sandbox" | "production");
    const app = buildNewApplication(values, newId("app"), creds);
    addApplication(app);
    setCreateOpen(false);
    push("success", "Application created", `${app.name} is ready with generated sandbox credentials.`);
  }

  return (
    <div>
      <PageHeader
        title="My Applications"
        description="Applications represent an integration between a partner and Salik APIs — each has its own credentials, subscriptions, and configuration."
        actions={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> Create application</Button>}
      />

      {applications.length === 0 ? (
        <EmptyState icon={AppWindow} title="No applications yet" description="Create your first application to get sandbox credentials." action={<Button size="sm" onClick={() => setCreateOpen(true)}>Create application</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {applications.map((app) => (
            <div key={app.id} className="surface-card flex flex-col rounded-xl p-4 shadow-card transition hover:shadow-popover">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/applications/${app.id}`} className="block truncate text-sm font-semibold hover:text-salik-600">{app.name}</Link>
                  <p className="truncate text-xs text-muted">{app.partnerName}</p>
                </div>
                <Badge status={app.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted">{app.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge label={app.environment} className="bg-info-light text-info" />
                <Badge label={`${app.subscribedApiIds.length} APIs`} className="bg-charcoal-100 text-muted dark:bg-charcoal-800" />
              </div>
              <p className="mt-2 text-[11px] text-muted">Created {formatDate(app.createdAt)} · Last active {formatDate(app.lastActivity)}</p>
              <div className="mt-3 flex gap-2">
                <Link href={`/applications/${app.id}`} className="flex-1"><Button variant="outline" size="sm" className="w-full">View details</Button></Link>
                <button onClick={() => setConfirmDelete(app.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal-200 text-muted hover:border-danger hover:text-danger dark:border-charcoal-700" aria-label="Delete application">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create application" description="Credentials are generated instantly for the sandbox environment.">
        <ApplicationForm onSubmit={handleCreate} />
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete application?" description="This action cannot be undone in a real environment (demo state resets on reload).">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => { if (confirmDelete) { deleteApplication(confirmDelete); push("info", "Application deleted", ""); } setConfirmDelete(null); }}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

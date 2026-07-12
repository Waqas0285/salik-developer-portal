"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PARTNERS } from "@/data/partners";
import type { Application, Environment } from "@/types";

const schema = z.object({
  name: z.string().min(3, "Application name must be at least 3 characters"),
  partnerId: z.string().min(1, "Select a partner organization"),
  description: z.string().min(10, "Please provide a short description (10+ characters)"),
  environment: z.enum(["sandbox", "production"]),
  redirectUrl: z.string().url("Enter a valid https:// URL").optional().or(z.literal("")),
  allowedIp: z.string().optional().or(z.literal("")),
});

export type ApplicationFormValues = z.infer<typeof schema>;

export function ApplicationForm({
  defaultValues,
  onSubmit,
  submitLabel = "Create application",
}: {
  defaultValues?: Partial<ApplicationFormValues>;
  onSubmit: (values: ApplicationFormValues) => void;
  submitLabel?: string;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { environment: "sandbox", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Application name</Label>
        <Input {...register("name")} placeholder="e.g. Dubai Mall Smart Parking" aria-invalid={!!errors.name} />
        {errors.name && <p className="mt-1 text-[11px] text-danger">{errors.name.message}</p>}
      </div>
      <div>
        <Label>Partner organization</Label>
        <Select {...register("partnerId")} aria-invalid={!!errors.partnerId}>
          <option value="">Select a partner…</option>
          {PARTNERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        {errors.partnerId && <p className="mt-1 text-[11px] text-danger">{errors.partnerId.message}</p>}
      </div>
      <div>
        <Label>Description</Label>
        <Textarea {...register("description")} rows={2} placeholder="What does this application do?" aria-invalid={!!errors.description} />
        {errors.description && <p className="mt-1 text-[11px] text-danger">{errors.description.message}</p>}
      </div>
      <div>
        <Label>Environment</Label>
        <Select {...register("environment")}>
          <option value="sandbox">Sandbox</option>
          <option value="production">Production</option>
        </Select>
      </div>
      <div>
        <Label>Redirect URL (optional)</Label>
        <Input {...register("redirectUrl")} placeholder="https://your-app.example.com/callback" aria-invalid={!!errors.redirectUrl} />
        {errors.redirectUrl && <p className="mt-1 text-[11px] text-danger">{errors.redirectUrl.message}</p>}
      </div>
      <div>
        <Label>Allowed IP / CIDR (optional)</Label>
        <Input {...register("allowedIp")} placeholder="10.0.0.0/24" />
      </div>
      <Button type="submit" className="w-full">{submitLabel}</Button>
    </form>
  );
}

export function buildNewApplication(values: ApplicationFormValues, id: string, creds: { clientId: string; clientSecret: string; apiKey: string }): Application {
  const partner = PARTNERS.find((p) => p.id === values.partnerId)!;
  return {
    id,
    name: values.name,
    partnerId: partner.id,
    partnerName: partner.name,
    description: values.description,
    environment: values.environment as Environment,
    status: "Pending",
    clientId: creds.clientId,
    clientSecret: creds.clientSecret,
    apiKey: creds.apiKey,
    oauthScopes: ["read:transactions"],
    certificateStatus: "Not Configured",
    redirectUrls: values.redirectUrl ? [values.redirectUrl] : [],
    allowedIps: values.allowedIp ? [values.allowedIp] : [],
    subscribedApiIds: [],
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };
}

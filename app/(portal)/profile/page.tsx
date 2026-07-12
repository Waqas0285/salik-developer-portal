"use client";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { usePersona } from "@/components/persona/PersonaProvider";
import { useToast } from "@/components/common/Toast";

export default function ProfilePage() {
  const { user } = usePersona();
  const { push } = useToast();
  if (!user) return null;

  return (
    <div>
      <PageHeader title="User Profile" description="Your demo identity and persona details." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white" style={{ backgroundColor: user.avatarColor }}>{user.avatarInitials}</div>
            <p className="mt-3 text-base font-semibold">{user.name}</p>
            <p className="text-xs text-muted">{user.title}</p>
            <Badge label={user.personaLabel} className="mt-2 bg-salik-100 text-salik-700 dark:bg-salik-950/50 dark:text-salik-300" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4">
            <div><Label>Full name</Label><Input defaultValue={user.name} /></div>
            <div><Label>Email</Label><Input defaultValue={user.email} /></div>
            <div><Label>Organization</Label><Input defaultValue={user.organization} readOnly /></div>
            <div><Label>Persona</Label><Input defaultValue={user.personaLabel} readOnly /></div>
            <Button onClick={() => push("success", "Profile updated", "Changes are demo-only and reset on reload.")}>Save changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

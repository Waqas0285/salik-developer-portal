"use client";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function SettingsPage() {
  const [defaultEnv, setDefaultEnv] = useLocalStorage("salik_default_env", "sandbox");
  const [region, setRegion] = useLocalStorage("salik_default_region", "Dubai");

  return (
    <div>
      <PageHeader title="Settings" description="Demo preferences, retained via local storage on this device." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-xs text-muted">Dark mode</span>
            <ThemeToggle />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Defaults</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Default environment</label>
              <Select value={defaultEnv} onChange={(e) => setDefaultEnv(e.target.value)}>
                <option value="sandbox">Sandbox</option><option value="production">Production</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Default region</label>
              <Select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option>Dubai</option><option>Abu Dhabi</option><option>Sharjah</option><option>Northern Emirates</option>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>About this demo</CardTitle></CardHeader>
          <CardContent><DisclaimerBanner /></CardContent>
        </Card>
      </div>
    </div>
  );
}

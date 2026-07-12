"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Label, Select } from "@/components/ui/Input";
import { TryItPanel } from "@/components/api/TryItPanel";
import { APIS } from "@/data/apis";

export default function ApiExplorerPage() {
  return (
    <div>
      <PageHeader title="API Explorer" description="Select an API and endpoint, configure a request, and execute it against a fully simulated mock gateway — no real network call is made." />
      <Suspense fallback={<div className="skeleton h-64 rounded-xl" />}>
        <ApiExplorerBody />
      </Suspense>
    </div>
  );
}

function ApiExplorerBody() {
  const searchParams = useSearchParams();
  const preselect = searchParams.get("api");
  const [apiId, setApiId] = useState(preselect && APIS.some((a) => a.id === preselect) ? preselect : APIS[0].id);
  const api = APIS.find((a) => a.id === apiId)!;

  return (
    <>
      <Card className="mb-5">
        <CardContent>
          <div className="max-w-sm">
            <Label>API</Label>
            <Select value={apiId} onChange={(e) => setApiId(e.target.value)}>
              {APIS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TryItPanel key={apiId} api={api} />
        </CardContent>
      </Card>
    </>
  );
}

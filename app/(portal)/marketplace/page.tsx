"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, Scale } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ApiCard } from "@/components/api/ApiCard";
import { SubscribeDialog } from "@/components/api/SubscribeDialog";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { useAppData } from "@/components/common/AppDataProvider";
import { APIS } from "@/data/apis";
import type { ApiCategory, ApiDefinition } from "@/types";

const CATEGORIES = Array.from(new Set(APIS.map((a) => a.category))) as ApiCategory[];
const SORTS = ["Popularity", "Most subscribers", "Recently updated", "Name (A–Z)"] as const;
type SortKey = (typeof SORTS)[number];
type View = "all" | "featured" | "trending" | "new" | "recommended" | "recent" | "favorites";

export default function MarketplacePage() {
  const { favorites, compareList, toggleCompare } = useAppData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ApiCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("Popularity");
  const [view, setView] = useState<View>("all");
  const [subscribeApi, setSubscribeApi] = useState<ApiDefinition | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const results = useMemo(() => {
    let rows = [...APIS];
    if (view === "featured") rows = rows.filter((a) => a.featured);
    if (view === "trending") rows = rows.filter((a) => a.trending);
    if (view === "new") rows = rows.filter((a) => a.isNew);
    if (view === "favorites") rows = rows.filter((a) => favorites.includes(a.id));
    if (view === "recommended") rows = rows.filter((a) => a.popularity >= 70);
    if (view === "recent") rows = [...rows].sort((a, b) => +new Date(b.lastUpdated) - +new Date(a.lastUpdated)).slice(0, 8);

    if (category !== "all") rows = rows.filter((a) => a.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (a) => a.name.toLowerCase().includes(q) || a.shortDescription.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q))
      );
    }

    switch (sort) {
      case "Popularity": rows.sort((a, b) => b.popularity - a.popularity); break;
      case "Most subscribers": rows.sort((a, b) => b.subscribers - a.subscribers); break;
      case "Recently updated": rows.sort((a, b) => +new Date(b.lastUpdated) - +new Date(a.lastUpdated)); break;
      case "Name (A–Z)": rows.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return rows;
  }, [query, category, sort, view, favorites]);

  const compareApis = APIS.filter((a) => compareList.includes(a.id));

  return (
    <div>
      <PageHeader
        title="API Marketplace"
        description="Discover, compare, and subscribe to Salik mobility APIs across toll, parking, wallet, fuel, EV, and AI domains."
        actions={
          compareList.length > 0 ? (
            <Button variant="outline" size="sm" onClick={() => setShowCompare(true)}>
              <Scale size={14} /> Compare ({compareList.length})
            </Button>
          ) : undefined
        }
      />

      <div className="surface-card mb-4 flex flex-col gap-3 rounded-xl p-3.5 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search APIs by name, description, or tag…"
            className="pl-9"
            aria-label="Search APIs"
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value as ApiCategory | "all")} className="sm:w-56">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="sm:w-48">
          {SORTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      <div className="scrollbar-thin mb-4 flex gap-1.5 overflow-x-auto">
        {([
          ["all", "All APIs"], ["featured", "Featured"], ["trending", "Trending"], ["new", "New"],
          ["recommended", "Recommended"], ["recent", "Recently Updated"], ["favorites", `Favorites (${favorites.length})`],
        ] as [View, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              view === key ? "bg-salik-600 text-white" : "bg-charcoal-100 text-muted hover:text-current dark:bg-charcoal-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mb-3 text-xs text-muted">{results.length} API{results.length !== 1 ? "s" : ""} found</p>

      {results.length === 0 ? (
        <EmptyState icon={Search} title="No APIs match your filters" description="Try a different search term or clear filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((api) => (
            <ApiCard key={api.id} api={api} onSubscribe={setSubscribeApi} />
          ))}
        </div>
      )}

      <SubscribeDialog api={subscribeApi} open={!!subscribeApi} onClose={() => setSubscribeApi(null)} />

      {showCompare && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCompare(false)} />
          <div className="surface-card relative z-10 max-h-[80vh] w-full max-w-4xl overflow-auto rounded-2xl p-5 shadow-popover">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Compare APIs</h2>
              <button onClick={() => setShowCompare(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-100 dark:border-charcoal-800">
                    <th className="py-2 pr-3 text-muted">Field</th>
                    {compareApis.map((a) => (
                      <th key={a.id} className="px-3 py-2">
                        <Link href={`/apis/${a.id}`} className="font-semibold hover:text-salik-600">{a.name}</Link>
                        <button onClick={() => toggleCompare(a.id)} className="ml-2 text-[10px] text-muted hover:text-danger">remove</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Category", (a: ApiDefinition) => a.category],
                    ["Version", (a: ApiDefinition) => a.version],
                    ["Auth type", (a: ApiDefinition) => a.authType],
                    ["SLA", (a: ApiDefinition) => a.sla],
                    ["Rate limit", (a: ApiDefinition) => `${a.rateLimitPerMin}/min`],
                    ["Peak TPS", (a: ApiDefinition) => String(a.peakTps)],
                    ["Pricing", (a: ApiDefinition) => a.pricingStatus],
                    ["Subscribers", (a: ApiDefinition) => String(a.subscribers)],
                    ["Popularity", (a: ApiDefinition) => `${a.popularity}%`],
                    ["Success rate", (a: ApiDefinition) => `${a.successRate}%`],
                    ["Avg latency", (a: ApiDefinition) => `${a.avgLatencyMs} ms`],
                  ].map(([label, getter]) => (
                    <tr key={label as string} className="border-b border-charcoal-50 dark:border-charcoal-800/60">
                      <td className="py-2 pr-3 font-medium text-muted">{label as string}</td>
                      {compareApis.map((a) => (
                        <td key={a.id} className="px-3 py-2">{(getter as (a: ApiDefinition) => string)(a)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

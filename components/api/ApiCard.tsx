"use client";
import Link from "next/link";
import { Heart, Scale, Users, TrendingUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, relativeTime } from "@/lib/utils";
import { useAppData } from "@/components/common/AppDataProvider";
import type { ApiDefinition } from "@/types";

export function ApiCard({ api, onSubscribe }: { api: ApiDefinition; onSubscribe: (api: ApiDefinition) => void }) {
  const { favorites, toggleFavorite, compareList, toggleCompare } = useAppData();
  const isFavorite = favorites.includes(api.id);
  const inCompare = compareList.includes(api.id);

  return (
    <div className="surface-card group flex flex-col rounded-xl p-4 shadow-card transition hover:shadow-popover">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge label={api.category} className="bg-info-light text-info" />
            {api.featured && <Badge label="Featured" className="bg-salik-100 text-salik-700 dark:bg-salik-950 dark:text-salik-300" />}
            {api.trending && <Badge label="Trending" className="bg-warn-light text-warn" />}
            {api.isNew && <Badge label="New" className="bg-success-light text-success" />}
          </div>
          <Link href={`/apis/${api.id}`} className="mt-1.5 block truncate text-sm font-semibold hover:text-salik-600">
            {api.name}
          </Link>
        </div>
        <button onClick={() => toggleFavorite(api.id)} aria-label="Toggle favorite" className={cn("shrink-0", isFavorite ? "text-danger" : "text-muted hover:text-danger")}>
          <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted">{api.shortDescription}</p>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted">
        <div className="flex items-center gap-1"><Users size={12} /> {api.subscribers}</div>
        <div className="flex items-center gap-1"><TrendingUp size={12} /> {api.popularity}%</div>
        <div className="flex items-center gap-1"><Clock size={12} /> {relativeTime(api.lastUpdated)}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {api.tags.slice(0, 3).map((t) => (
          <span key={t} className="rounded-full bg-charcoal-100 px-2 py-0.5 text-[10px] text-muted dark:bg-charcoal-800">#{t}</span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link href={`/apis/${api.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">View details</Button>
        </Link>
        <Button variant="primary" size="sm" onClick={() => onSubscribe(api)}>Subscribe</Button>
        <button
          onClick={() => toggleCompare(api.id)}
          title="Add to compare"
          className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", inCompare ? "border-salik-500 bg-salik-50 text-salik-700 dark:bg-salik-950/40" : "border-charcoal-200 text-muted dark:border-charcoal-700")}
        >
          <Scale size={14} />
        </button>
      </div>
    </div>
  );
}

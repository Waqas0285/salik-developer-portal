"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  defaultTab,
  onChange,
}: {
  tabs: { key: string; label: string; content: React.ReactNode }[];
  defaultTab?: string;
  onChange?: (key: string) => void;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div>
      <div className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-charcoal-100 dark:border-charcoal-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActive(t.key);
              onChange?.(t.key);
            }}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-medium transition",
              active === t.key
                ? "border-salik-600 text-salik-700 dark:text-salik-400"
                : "border-transparent text-muted hover:text-current"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{activeTab?.content}</div>
    </div>
  );
}

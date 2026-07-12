"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  pageSize = 10,
  onRowClick,
  emptyMessage = "No records match your filters.",
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  rowKey: (row: T) => string;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  }

  if (rows.length === 0) {
    return <div className="py-14 text-center text-sm text-muted">{emptyMessage}</div>;
  }

  return (
    <div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-charcoal-100 dark:border-charcoal-800">
              {columns.map((col) => (
                <th key={col.key} className={cn("whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-muted", col.className)}>
                  {col.sortValue ? (
                    <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-current">
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ChevronsUpDown size={12} className="opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-charcoal-50 dark:border-charcoal-800/60",
                  onRowClick && "cursor-pointer hover:bg-charcoal-50 dark:hover:bg-charcoal-800/40"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("whitespace-nowrap px-3 py-2.5", col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>
            Page {page} of {totalPages} · {rows.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-charcoal-200 disabled:opacity-40 dark:border-charcoal-700"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-charcoal-200 disabled:opacity-40 dark:border-charcoal-700"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

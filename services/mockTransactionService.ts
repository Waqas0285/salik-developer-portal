import type { Transaction } from "@/types";

export function toCsv(rows: Transaction[]): string {
  const headers = ["id", "correlationId", "timestamp", "partnerName", "customerName", "vehiclePlate", "category", "apiName", "amountAed", "status", "responseCode", "latencyMs", "environment"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      headers
        .map((h) => {
          const v = (r as unknown as Record<string, unknown>)[h];
          const s = String(v ?? "");
          return s.includes(",") ? `"${s}"` : s;
        })
        .join(",")
    );
  }
  return lines.join("\n");
}

export function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

"use client";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

// Monaco must be loaded client-side only (it touches `window`/`self` at
// import time), so it's dynamically imported with ssr disabled. A simple
// textarea fallback renders while the editor chunk is loading.
const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((m) => m.default), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full rounded-lg" />,
});

export function CodeEditor({
  value,
  onChange,
  language = "json",
  height = 220,
  readOnly = false,
}: {
  value: string;
  onChange?: (value: string) => void;
  language?: "json" | "yaml";
  height?: number | string;
  readOnly?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <div className="overflow-hidden rounded-lg border border-charcoal-200 dark:border-charcoal-700" style={{ height }}>
      <MonacoEditor
        height="100%"
        language={language}
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 12.5,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          folding: true,
          padding: { top: 10 },
        }}
      />
    </div>
  );
}

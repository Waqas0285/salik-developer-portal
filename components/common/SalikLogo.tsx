import { cn } from "@/lib/utils";

export function SalikLogo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <rect width="30" height="30" rx="8" fill="#26966B" />
        <path d="M7 19.5 13 8h3.4L10.4 19.5H7Z" fill="white" />
        <path d="M14.6 19.5 20.6 8H24l-6 11.5h-3.4Z" fill="white" fillOpacity="0.55" />
      </svg>
      {!mark && (
        <span className="text-lg font-bold tracking-tight">
          Salik <span className="font-normal text-muted">Developer Portal</span>
        </span>
      )}
    </div>
  );
}

import { DEMO_DISCLAIMER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function DisclaimerBanner({ className }: { className?: string }) {
  return (
    <p className={cn("text-[11px] leading-relaxed text-muted", className)}>{DEMO_DISCLAIMER}</p>
  );
}

import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";

export function Footer() {
  return (
    <footer className="border-t border-charcoal-100 px-6 py-4 dark:border-charcoal-800">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">© 2026 Salik. Developer Portal Demo.</p>
        <DisclaimerBanner className="sm:max-w-xl sm:text-right" />
      </div>
    </footer>
  );
}

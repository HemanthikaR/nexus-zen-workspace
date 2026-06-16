import { ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(sessionStorage.getItem("nexusai:disclaimer") === "1");
  }, []);
  if (dismissed) return null;
  return (
    <div className="sticky top-0 z-50 border-b border-amber-200/60 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-xs sm:text-sm">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <p className="flex-1">
          <span className="font-semibold">Responsible AI:</span> NexusAI may produce inaccurate or
          incomplete information. Verify critical outputs before acting on them.
        </p>
        <button
          aria-label="Dismiss disclaimer"
          onClick={() => {
            sessionStorage.setItem("nexusai:disclaimer", "1");
            setDismissed(true);
          }}
          className="rounded p-1 transition hover:bg-amber-100 dark:hover:bg-amber-900/40"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

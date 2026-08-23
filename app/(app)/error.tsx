"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600"><AlertTriangle className="h-6 w-6" /></div>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">Something broke.</h1>
      <p className="mt-2 max-w-md text-center text-sm text-ink-soft">A page-level error was caught. Your session is safe. Retry or head back to the dashboard.</p>
      {error.digest && <p className="mt-2 font-mono text-[11px] text-ink-muted">Digest: {error.digest}</p>}
      <div className="mt-6 flex gap-2">
        <button onClick={reset} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
          <RotateCw className="h-3.5 w-3.5" /> Retry
        </button>
        <a href="/app" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">Back to Dashboard</a>
      </div>
    </div>
  );
}

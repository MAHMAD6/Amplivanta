"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

export default function SuperError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-cta/10 text-orange-cta">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-admin-navy">This screen could not be loaded</h1>
      <p className="mt-2 max-w-md text-center text-[13.5px] leading-relaxed text-ink-soft">
        Your Super Admin session is still active. No data was changed by this error.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[11.5px] text-ink-muted">Reference: {error.digest}</p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <button
          onClick={reset}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-royal-blue px-4 text-[13.5px] font-bold text-white transition hover:bg-royal-soft"
        >
          <RotateCw className="h-4 w-4" /> Retry
        </button>
        <a
          href="/admin"
          className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-admin-navy hover:bg-bg-soft"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}

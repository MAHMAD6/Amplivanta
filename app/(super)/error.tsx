"use client";

import { ShieldAlert, RotateCw } from "lucide-react";

export default function SuperError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600"><ShieldAlert className="h-6 w-6" /></div>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">Super Admin error.</h1>
      <p className="mt-2 max-w-md text-center text-sm text-ink-soft">Cross-tenant view failed to load. Session preserved. Every retry is audit-logged.</p>
      <div className="mt-6 flex gap-2">
        <button onClick={reset} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-500 px-4 text-[13px] font-bold text-white shadow"><RotateCw className="h-3.5 w-3.5" /> Retry</button>
        <a href="/super" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">Back to Super Dashboard</a>
      </div>
    </div>
  );
}

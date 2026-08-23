"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2, Check } from "lucide-react";

/** Runs a workflow via the engine (/api/workflows/:id/run) and shows the result. */
export function WorkflowRunButton({ workflowId, live }: { workflowId: string; live: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "done">("idle");

  async function run() {
    if (!live || state === "running") return;
    setState("running");
    try {
      const res = await fetch(`/api/workflows/${workflowId}/run`, { method: "POST" });
      if (res.ok) {
        setState("done");
        router.refresh();
        setTimeout(() => setState("idle"), 2500);
      } else {
        setState("idle");
      }
    } catch {
      setState("idle");
    }
  }

  return (
    <button
      onClick={run}
      disabled={!live}
      title={live ? "Run this workflow now" : "Connect data to run"}
      className="rounded-lg p-1.5 text-ink-muted transition hover:bg-bg-soft disabled:opacity-40"
    >
      {state === "running" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-violet" />
      ) : state === "done" ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Play className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

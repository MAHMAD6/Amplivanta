"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { toastResult } from "@/lib/action-toast";
import { recommendationToTask, setRecommendationStatus } from "@/app/(app)/app/strategy/actions";

type Result = { ok: true; message: string; id?: string } | { ok: false; error: string };

/**
 * One-click control for a bound server action (e.g. `deleteGoal.bind(null, id)`).
 * `goTo` navigates to `${goTo}${id}` when the action returns a created id.
 */
export function ActButton({
  action,
  children,
  className,
  confirm,
  goTo,
  disabled,
  title,
}: {
  action: () => Promise<Result>;
  children: React.ReactNode;
  className?: string;
  confirm?: string;
  goTo?: string;
  disabled?: boolean;
  title?: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      title={title}
      disabled={disabled || pending}
      className={cn("inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-50", className)}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          const r = await action();
          if (toastResult(r)) {
            if (goTo && r.ok && r.id) router.push(`${goTo}${r.id}`);
            else router.refresh();
          }
        });
      }}
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

/** Form bound to a server action taking FormData; resets on success. */
export function ActionForm({ action, children, className, goTo }: { action: (fd: FormData) => Promise<Result>; children: React.ReactNode; className?: string; goTo?: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      className={className}
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          const r = await action(fd);
          if (toastResult(r)) {
            form.reset();
            if (goTo && r.ok && r.id) router.push(`${goTo}${r.id}`);
            else router.refresh();
          }
        });
      }}
    >
      <fieldset disabled={pending} className="contents">{children}</fieldset>
    </form>
  );
}

export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="submit" className={cn("inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#0B5CFF] px-4 text-[12.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50", className)}>
      {children}
    </button>
  );
}

/** Ask About Growth: sends a question to the AI Advisor chat endpoint. */
export function AskAdvisor({ available, canUse, conversationId, onReplyRefresh }: { available: boolean; canUse: boolean; conversationId?: string; onReplyRefresh?: boolean }) {
  const [q, setQ] = useState("");
  const [reply, setReply] = useState<{ text: string; conversationId: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const disabled = !available || !canUse;
  const send = (message: string) =>
    start(async () => {
      try {
        const res = await fetch("/api/ai/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message, ...(conversationId ? { conversationId } : {}) }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error || "AI Advisor could not answer right now.");
          return;
        }
        if (onReplyRefresh) {
          setQ("");
          router.push(`/app/ai-advisor/ask?c=${data.conversationId}`);
          router.refresh();
          return;
        }
        setReply({ text: data.reply, conversationId: data.conversationId });
      } catch {
        toast.error("AI Advisor could not answer right now.");
      }
    });
  return (
    <div>
      <textarea
        value={q}
        onChange={(e) => setQ(e.target.value)}
        rows={5}
        maxLength={4000}
        aria-label="Ask about growth"
        disabled={disabled}
        placeholder="Ask a growth question, describe a goal, or request a plan…"
        className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[13.5px] text-deep-navy placeholder:text-ink-muted focus:border-[#0B5CFF] focus:outline-none disabled:bg-bg-soft/60"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11.5px] text-ink-muted">{available ? "Only your question and this conversation are sent to the AI provider." : "AI Advisor is not available yet: no AI provider is configured."}</p>
        <button type="button" disabled={disabled || pending || q.trim().length < 3} onClick={() => send(q.trim())} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#0B5CFF] px-4 text-[12.5px] font-semibold text-white disabled:opacity-50">
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Analyze
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Find my next opportunity", "Where is conversion being lost?", "Build a 90-day plan"].map((s) => (
          <button key={s} type="button" disabled={disabled} onClick={() => setQ(s)} className="rounded-full border border-line bg-bg-soft/60 px-3 py-1 text-[11.5px] text-ink-soft hover:text-deep-navy disabled:opacity-60">{s}</button>
        ))}
      </div>
      {reply && (
        <div className="mt-4 rounded-lg border border-line bg-bg-soft/40 p-3">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-deep-navy">{reply.text}</p>
          <Link href={`/app/ai-advisor/ask?c=${reply.conversationId}`} className="mt-2 inline-block text-[12px] font-semibold text-[#0B5CFF]">Saved to conversation history</Link>
        </div>
      )}
    </div>
  );
}

/** Runs the growth_recommendations task over aggregate workspace facts. */
export function GenerateRecommendations({ available, canUse, className, children }: { available: boolean; canUse: boolean; className?: string; children: React.ReactNode }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={!available || !canUse || pending}
      title={available ? undefined : "No AI provider is configured"}
      className={className}
      onClick={() =>
        start(async () => {
          const res = await fetch("/api/ai/recommendations", { method: "POST" });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) toast.error(data.error || "Recommendations could not be generated.");
          else {
            toast.success(`${data.recommendations?.length ?? 0} recommendations added.`);
            router.refresh();
          }
        })
      }
    >
      {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function PrintButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      {children}
    </button>
  );
}

/** Opportunity controls: open the affected screen, turn it into a task, or dismiss it. */
export function OpportunityActions({ id, href, canEdit }: { id: string; href: string | null; canEdit: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {href && (
        <Link href={href} className="inline-flex items-center rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-[#0B5CFF] hover:bg-bg-soft">
          Open
        </Link>
      )}
      <ActButton action={recommendationToTask.bind(null, id)} disabled={!canEdit} title={canEdit ? "Create a task from this opportunity" : "Viewers cannot create tasks"}>
        Create task
      </ActButton>
      <ActButton action={setRecommendationStatus.bind(null, id, "dismissed")} disabled={!canEdit} confirm="Dismiss this opportunity? It comes back only if the data changes and it is detected again.">
        Dismiss
      </ActButton>
    </div>
  );
}

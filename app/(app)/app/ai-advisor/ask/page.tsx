import type { Metadata } from "next";
import { Clock, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { AdvisorTabs } from "@/components/amplivanta/advisor-tabs";
import { AskAdvisorClient } from "@/components/amplivanta/ask-advisor-client";
import { ASK_HISTORY, ASK_SUGGESTED } from "@/lib/advisor-data";

export const metadata: Metadata = { title: "Ask AI Advisor — Amplivanta" };

export default function AskAdvisorPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-violet">AI Advisor</div>
      <PageHeader
        title={<span className="inline-flex items-center gap-2"><Sparkles className="h-6 w-6 text-violet" /> Ask AI Advisor</span>}
        subtitle="Ask anything about your data, performance, or growth strategy — get a scored answer with sources."
      />

      <AdvisorTabs />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <AskAdvisorClient suggested={ASK_SUGGESTED} />
        </div>

        {/* Recent questions */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="mb-4 text-[14px] font-bold text-ink">Recent Questions</h2>
            <ul className="space-y-2">
              {ASK_HISTORY.map((h) => (
                <li key={h.q} className="flex items-start gap-2.5 rounded-xl border border-line p-3">
                  <Clock className="mt-0.5 h-4 w-4 text-ink-muted" />
                  <span>
                    <span className="block text-[12.5px] font-semibold text-ink">{h.q}</span>
                    <span className="block text-[11px] text-ink-muted">{h.when}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.07] to-orange-brand/[0.05] p-5">
            <h2 className="text-[14px] font-bold text-ink">Pro tip</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
              Ask follow-ups like &quot;show me by channel&quot; or &quot;compare to last quarter&quot; — the Advisor keeps
              your question&apos;s context.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

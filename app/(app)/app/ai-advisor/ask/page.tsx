import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { isAiConfigured } from "@/lib/ai";
import { EmptyState, ScreenHeader, TabBar, fmtDateTime } from "@/components/amplivanta/screen-kit";
import { PanelTitle, giPanel } from "@/components/amplivanta/growth-kit";
import { AskAdvisor } from "@/components/amplivanta/growth-ui";
import { growthContext } from "@/lib/server/growth-screens";
import { ADVISOR_TABS } from "@/lib/growth/advisor-tabs";

export const metadata: Metadata = { title: "Ask AI Advisor" };
export const dynamic = "force-dynamic";

export default async function AskAdvisorPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const sp = await searchParams;
  const ctx = await growthContext();
  const ai = isAiConfigured();
  let conversations: { id: string; title: string; updatedAt: Date; _count: { messages: number } }[] = [];
  let thread: { id: string; role: string; content: string; createdAt: Date }[] = [];
  let active: string | undefined;
  if (ctx) {
    try {
      const aiw = await db.aiWorkspace.findFirst({ where: { workspaceId: ctx.workspaceId }, select: { id: true } });
      if (aiw) {
        conversations = await db.aiConversation.findMany({ where: { aiWorkspaceId: aiw.id }, orderBy: { updatedAt: "desc" }, take: 30, select: { id: true, title: true, updatedAt: true, _count: { select: { messages: true } } } });
        active = conversations.find((c) => c.id === sp.c)?.id;
        if (active) thread = await db.aiMessage.findMany({ where: { conversationId: active }, orderBy: { createdAt: "asc" }, take: 200, select: { id: true, role: true, content: true, createdAt: true } });
      }
    } catch {
      conversations = [];
    }
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["AI Advisor", "/app/ai-advisor"], ["Ask AI Advisor"]]} title="Ask AI Advisor" subtitle="Ask growth questions and keep every answer in your conversation history." />
      <TabBar tabs={ADVISOR_TABS} active="/app/ai-advisor/ask" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={giPanel}>
          <PanelTitle action={active ? <Link href="/app/ai-advisor/ask" className="text-[12px] font-semibold text-[#0B5CFF]">New</Link> : undefined}>Conversations</PanelTitle>
          {conversations.length ? (
            <ul className="space-y-1">
              {conversations.map((c) => (
                <li key={c.id}>
                  <Link href={`/app/ai-advisor/ask?c=${c.id}`} className={cn("block rounded-md px-2.5 py-2 text-[12.5px]", c.id === active ? "bg-royal-tint text-[#0B5CFF]" : "text-deep-navy hover:bg-bg-soft")}>
                    <div className="truncate font-semibold">{c.title}</div>
                    <div className="text-[11px] text-ink-muted">{c._count.messages} messages · {fmtDateTime(c.updatedAt)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12.5px] text-ink-soft">No conversations yet.</p>
          )}
        </aside>
        <section className={giPanel}>
          <PanelTitle>{active ? conversations.find((c) => c.id === active)?.title : "New conversation"}</PanelTitle>
          {thread.length ? (
            <ol className="mb-4 space-y-3">
              {thread.map((m) => (
                <li key={m.id} className={cn("max-w-[85%] rounded-lg px-3 py-2.5 text-[13px]", m.role === "user" ? "ml-auto bg-[#0B5CFF] text-white" : "bg-bg-soft/70 text-deep-navy")}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  <div className={cn("mt-1 text-[10.5px]", m.role === "user" ? "text-white/70" : "text-ink-muted")}>{fmtDateTime(m.createdAt)}</div>
                </li>
              ))}
            </ol>
          ) : (
            !active && <EmptyState compact icon={MessageSquare} title="Ask your first question" body={ai ? "Answers use only your question and this conversation." : "AI Advisor is not available yet: no AI provider is configured."} />
          )}
          <AskAdvisor available={ai} canUse={Boolean(ctx)} conversationId={active} onReplyRefresh />
        </section>
      </div>
    </div>
  );
}

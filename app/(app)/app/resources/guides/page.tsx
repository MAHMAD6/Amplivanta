import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pill, ScreenHeader, kitOutline, kitPrimary } from "@/components/amplivanta/screen-kit";
import { resourceCrumbs } from "@/components/amplivanta/resources-ui";
import { setupGuides } from "@/lib/server/resources-hub";
import { workspaceContext } from "@/lib/server/workspace-screens";

export const metadata: Metadata = { title: "Guides" };
export const dynamic = "force-dynamic";

export default async function GuidesPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const c = await workspaceContext();
  const guides = await setupGuides(c?.workspaceId ?? null);
  const known = guides.every((g) => g.done !== null);
  const done = guides.filter((g) => g.done).length;
  const filter = show === "open" ? "open" : "all";
  const shown = filter === "open" ? guides.filter((g) => !g.done) : guides;
  const modules = [...new Set(shown.map((g) => g.module))];

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={resourceCrumbs("Guides")}
        title="Setup Guides"
        subtitle="Step-by-step setup for the core of Amplivanta. Progress is read from this workspace."
        actions={
          <nav className="flex gap-2" aria-label="Guide filter">
            <Link href="/app/resources/guides" className={cn(filter === "all" ? kitPrimary : kitOutline)}>All guides</Link>
            <Link href="/app/resources/guides?show=open" className={cn(filter === "open" ? kitPrimary : kitOutline)}>Not done yet</Link>
          </nav>
        }
      />

      {known ? (
        <section className="mb-5 rounded-xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[16.5px] font-semibold text-deep-navy">{done === guides.length ? "Setup complete" : `${done} of ${guides.length} complete`}</h2>
            <span className="text-[12.5px] text-ink-soft">{Math.round((done / guides.length) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-bg-soft"><div className="h-2 rounded-full bg-[#0B5CFF]" style={{ width: `${Math.round((done / guides.length) * 100)}%` }} /></div>
        </section>
      ) : (
        <p className="mb-5 rounded-md bg-bg-soft px-3 py-2 text-[12.5px] text-ink-soft">Workspace progress is unavailable right now, so completion is not shown.</p>
      )}

      {shown.length === 0 ? (
        <section className="rounded-xl border border-line bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
          <p className="mt-2 text-[15px] font-semibold text-deep-navy">Every setup guide is complete.</p>
        </section>
      ) : (
        <div className="space-y-6">
          {modules.map((m) => (
            <section key={m}>
              <h2 className="mb-2 text-[14px] font-semibold uppercase tracking-wide text-ink-soft">{m}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {shown.filter((g) => g.module === m).map((g) => (
                  <article key={g.key} className="flex flex-col rounded-xl border border-line bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="flex items-start gap-2 text-[15px] font-semibold text-deep-navy">
                        {g.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />}
                        {g.title}
                      </h3>
                      {g.done !== null && <Pill tone={g.done ? "green" : "gray"}>{g.done ? "Done" : "To do"}</Pill>}
                    </div>
                    <p className="mt-2 flex-1 text-[13px] text-ink-soft">{g.body}</p>
                    <Link href={g.href} className={cn(g.done ? kitOutline : kitPrimary, "mt-4 self-start")}>{g.cta}</Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

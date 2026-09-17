import type { Metadata } from "next";
import Link from "next/link";
import { LayoutTemplate } from "lucide-react";
import { DataTable, EmptyState, Pill, ScreenHeader } from "@/components/amplivanta/screen-kit";
import { ResourceSearch, TopicChips, resourceCrumbs } from "@/components/amplivanta/resources-ui";
import { matches, productTemplates } from "@/lib/server/resources-hub";
import { workspaceContext } from "@/lib/server/workspace-screens";
import { RESOURCE_TEMPLATES } from "@/lib/site-resource-items";

export const metadata: Metadata = { title: "Templates" };
export const dynamic = "force-dynamic";

export default async function ResourceTemplatesPage({ searchParams }: { searchParams: Promise<{ q?: string; topic?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const c = await workspaceContext();
  const { items, workspaceReachable } = await productTemplates(c?.workspaceId ?? null);
  const published = RESOURCE_TEMPLATES.map((t) => ({ source: "Published", name: t.title, description: t.summary, category: t.format ?? "template", href: t.moduleHref ?? `/resources/templates/${t.slug}` }));
  const all = [...items, ...published];
  const sources = [...new Set(all.map((t) => t.source))];
  const source = sources.includes(sp.topic ?? "") ? sp.topic : undefined;
  const shown = all.filter((t) => (!source || t.source === source) && (!q || matches(q, t.name, t.description, t.category, t.source)));

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={resourceCrumbs("Templates")} title="Templates" subtitle="Every template you can use in Amplivanta: built-in automation and landing page templates, plus templates saved in this workspace." />
      <ResourceSearch action="/app/resources/templates" q={q} placeholder="Search templates">{source && <input type="hidden" name="topic" value={source} />}</ResourceSearch>
      <TopicChips base="/app/resources/templates" topics={sources} active={source} q={q} />
      <section className="rounded-xl border border-line bg-white p-5">
        <DataTable
          minWidth={760}
          columns={["Template", "Source", "Category", "Description", ""]}
          rows={shown.map((t) => [
            t.name,
            <Pill key="s" tone={t.source === "Automation" ? "violet" : t.source === "Landing page" ? "blue" : "gray"}>{t.source}</Pill>,
            <span key="c" className="capitalize">{t.category}</span>,
            <span key="d" className="line-clamp-2 max-w-[460px]">{t.description}</span>,
            <Link key="o" href={t.href} className="whitespace-nowrap font-semibold text-[#0B5CFF] hover:underline">Open</Link>,
          ])}
          empty={<EmptyState icon={LayoutTemplate} compact title="No templates match" body="Try another source or search." />}
        />
        {!workspaceReachable && c && <p className="mt-3 text-[12px] text-ink-muted">Workspace templates could not be loaded; built-in templates are shown.</p>}
      </section>
    </div>
  );
}

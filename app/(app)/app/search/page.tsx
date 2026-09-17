import type { Metadata } from "next";
import Link from "next/link";
import { Search, ServerCrash } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, Pill, ScreenHeader } from "@/components/amplivanta/screen-kit";
import { NAV_DESTINATIONS } from "@/lib/app-nav";
import { workspaceContext } from "@/lib/server/workspace-screens";

export const metadata: Metadata = { title: "Search" };
export const dynamic = "force-dynamic";

type Hit = { type: string; title: string; detail?: string | null; href: string };

/** Global search from the top bar: app destinations plus this workspace's records. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: raw = "" } = await searchParams;
  const q = raw.trim().slice(0, 100);
  const c = await workspaceContext();
  const lower = q.toLowerCase();

  const pages: Hit[] = q ? NAV_DESTINATIONS.filter((d) => `${d.label} ${d.group}`.toLowerCase().includes(lower)).slice(0, 12).map((d) => ({ type: "Page", title: d.label, detail: d.group, href: d.href })) : [];

  let records: Hit[] | null = [];
  if (q && c) {
    const w = c.workspaceId;
    const has = { contains: q, mode: "insensitive" as const };
    try {
      const [contacts, companies, deals, campaigns, emails, forms, pages2, workflows, segments, posts, projects, documents] = await Promise.all([
        db.contact.findMany({ where: { workspaceId: w, OR: [{ name: has }, { email: has }, { companyName: has }, { firstName: has }, { lastName: has }] }, take: 8, select: { id: true, name: true, email: true, companyName: true } }),
        db.company.findMany({ where: { workspaceId: w, OR: [{ name: has }, { domain: has }] }, take: 6, select: { id: true, name: true, domain: true } }),
        db.deal.findMany({ where: { workspaceId: w, name: has }, take: 6, select: { id: true, name: true, status: true } }),
        db.campaign.findMany({ where: { workspaceId: w, name: has }, take: 6, select: { id: true, name: true, status: true } }),
        db.emailCampaign.findMany({ where: { workspaceId: w, OR: [{ name: has }, { subject: has }] }, take: 6, select: { id: true, name: true, status: true } }),
        db.form.findMany({ where: { workspaceId: w, name: has }, take: 6, select: { id: true, name: true } }),
        db.landingPage.findMany({ where: { workspaceId: w, title: has }, take: 6, select: { id: true, title: true, status: true } }),
        db.workflow.findMany({ where: { workspaceId: w, name: has }, take: 6, select: { id: true, name: true, status: true } }),
        db.segment.findMany({ where: { workspaceId: w, name: has }, take: 6, select: { id: true, name: true } }),
        db.socialPost.findMany({ where: { workspaceId: w, content: has }, take: 6, select: { id: true, content: true, status: true } }),
        db.project.findMany({ where: { workspaceId: w, name: has }, take: 6, select: { id: true, name: true } }),
        db.document.findMany({ where: { workspaceId: w, title: has }, take: 6, select: { id: true, title: true } }),
      ]);
      records = [
        ...contacts.map((x) => ({ type: "Contact", title: x.name || x.email || "Contact", detail: [x.email, x.companyName].filter(Boolean).join(" · "), href: `/app/crm/contacts?q=${encodeURIComponent(x.email || x.name || q)}` })),
        ...companies.map((x) => ({ type: "Company", title: x.name, detail: x.domain, href: `/app/crm/companies?q=${encodeURIComponent(x.name)}` })),
        ...deals.map((x) => ({ type: "Deal", title: x.name, detail: x.status, href: `/app/crm/deal-detail?id=${x.id}` })),
        ...campaigns.map((x) => ({ type: "Campaign", title: x.name, detail: x.status, href: `/app/marketing/campaigns?c=${x.id}` })),
        ...emails.map((x) => ({ type: "Email campaign", title: x.name, detail: x.status, href: `/app/marketing/emails?campaign=${x.id}` })),
        ...forms.map((x) => ({ type: "Form", title: x.name, href: `/app/marketing/forms?id=${x.id}` })),
        ...pages2.map((x) => ({ type: "Landing page", title: x.title, detail: x.status, href: `/app/marketing/page-builder?id=${x.id}` })),
        ...workflows.map((x) => ({ type: "Workflow", title: x.name, detail: x.status, href: `/app/marketing/workflows?id=${x.id}` })),
        ...segments.map((x) => ({ type: "Segment", title: x.name, href: `/app/marketing/segments?s=${x.id}` })),
        ...posts.map((x) => ({ type: "Social post", title: x.content.slice(0, 90), detail: x.status, href: `/app/social/posts?q=${encodeURIComponent(q)}` })),
        ...projects.map((x) => ({ type: "Project", title: x.name, href: `/app/creative-studio/projects?q=${encodeURIComponent(x.name)}` })),
        ...documents.map((x) => ({ type: "Document", title: x.title, href: `/app/creative-studio/documents/${x.id}` })),
      ];
    } catch {
      records = null;
    }
  }

  const total = pages.length + (records?.length ?? 0);

  return (
    <div className="mx-auto max-w-[1200px]">
      <ScreenHeader crumbs={[["Dashboard", "/app"], ["Search"]]} title={q ? `Search results for “${q}”` : "Search"} subtitle={q ? `${total} result${total === 1 ? "" : "s"} across pages and workspace records.` : "Search pages and records in this workspace from the bar above."} />
      {!q ? (
        <section className="rounded-xl border border-line bg-white p-5">
          <EmptyState icon={Search} title="Type to search" body="Find contacts, companies, deals, campaigns, forms, landing pages, workflows, segments, posts, projects, documents and app pages." />
        </section>
      ) : (
        <div className="space-y-5">
          {records === null && (
            <section className="rounded-xl border border-line bg-white p-5">
              <EmptyState icon={ServerCrash} tone="orange" compact title="Workspace records are unavailable" body="Records could not be searched right now; matching pages are still shown." />
            </section>
          )}
          {total === 0 && records !== null ? (
            <section className="rounded-xl border border-line bg-white p-5">
              <EmptyState icon={Search} title="No results" body="Try a different word or check the spelling." />
            </section>
          ) : (
            [["Pages", pages], ["Workspace records", records ?? []]].map(([label, hits]) =>
              (hits as Hit[]).length ? (
                <section key={label as string} className="rounded-xl border border-line bg-white p-5">
                  <h2 className="text-[16px] font-semibold text-deep-navy">{label as string}</h2>
                  <ul className="mt-2 divide-y divide-line">
                    {(hits as Hit[]).map((h, i) => (
                      <li key={`${h.href}-${i}`} className="flex items-center gap-3 py-2.5">
                        <Pill tone={h.type === "Page" ? "blue" : "gray"}>{h.type}</Pill>
                        <div className="min-w-0 flex-1">
                          <Link href={h.href} className="block truncate text-[14px] font-semibold text-deep-navy hover:text-[#0B5CFF]">{h.title}</Link>
                          {h.detail && <div className="truncate text-[12px] capitalize text-ink-soft">{h.detail}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null,
            )
          )}
        </div>
      )}
    </div>
  );
}

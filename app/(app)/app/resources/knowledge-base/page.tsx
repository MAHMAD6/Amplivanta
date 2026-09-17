import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ScreenHeader, kitOutline } from "@/components/amplivanta/screen-kit";
import { ResourceList, ResourceSearch, resourceCrumbs } from "@/components/amplivanta/resources-ui";
import { matches, publishedResources } from "@/lib/server/resources-hub";

export const metadata: Metadata = { title: "Knowledge Base" };

const AREAS: [string, string, string][] = [
  ["CRM & Pipeline", "Contacts, companies, deals and imports", "/app/crm"],
  ["Marketing Automation", "Workflows, email, forms and landing pages", "/app/marketing"],
  ["Creative Studio", "Images, video, documents and brand kits", "/app/creative-studio"],
  ["Integrations", "Connections, webhooks, API keys and data transfer", "/app/integrations"],
  ["Analytics", "Dashboards, attribution and reports", "/app/analytics"],
  ["Workspace & Billing", "Team, security, plans and credits", "/app/settings"],
];

export default async function KnowledgeBasePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const articles = publishedResources().filter((e) => e.type === "Help");
  const shown = q ? articles.filter((a) => matches(q, a.title, a.summary)) : articles;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={resourceCrumbs("Knowledge Base")} title="Knowledge Base" subtitle="How-to articles for Amplivanta features, from the published help library." />
      <ResourceSearch action="/app/resources/knowledge-base" q={q} placeholder="Search help articles" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16.5px] font-semibold text-deep-navy">{q ? `Results for “${q}”` : "Articles"}</h2>
          <ResourceList
            entries={shown}
            empty={
              articles.length
                ? { icon: BookOpen, title: "No articles match", body: "Try different words.", action: <Link href="/app/resources/knowledge-base" className="text-[13px] font-semibold text-[#0B5CFF]">Show all articles</Link> }
                : { icon: BookOpen, title: "No help articles published yet", body: "Help articles appear here when they are published. Setup guides and support options are available now.", action: <div className="flex flex-wrap justify-center gap-2.5"><Link href="/app/resources/guides" className={kitOutline}>Setup guides</Link><Link href="/app/help" className={kitOutline}>Help &amp; Support</Link></div> }
            }
          />
        </section>
        <section className="min-w-0 rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16.5px] font-semibold text-deep-navy">Product areas</h2>
          <p className="mt-0.5 text-[12.5px] text-ink-soft">Go straight to the part of Amplivanta you need.</p>
          <ul className="mt-3 divide-y divide-line">
            {AREAS.map(([t, d, href]) => (
              <li key={t} className="py-3">
                <Link href={href} className="text-[14px] font-semibold text-deep-navy hover:text-[#0B5CFF]">{t}</Link>
                <p className="text-[12.5px] text-ink-soft">{d}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

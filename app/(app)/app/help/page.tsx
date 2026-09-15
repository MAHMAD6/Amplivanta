import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Diamond, FileText, Search } from "lucide-react";
import { crmPrimaryBtn } from "@/components/amplivanta/crm-screen";
import { HELP_ARTICLES } from "@/lib/site-resource-items";

export const metadata: Metadata = { title: "Help & Support" };

const TOPICS: [string, string, string][] = [
  ["Getting Started", "Learn the core workspace and account basics.", "Getting started"],
  ["AI Advisor", "Understand recommendations, insights, and action plans.", "AI Advisor"],
  ["Marketing Automation", "Set up campaigns, workflows, email, and lead capture.", "Marketing Automation"],
  ["CRM & Pipeline", "Manage contacts, companies, deals, tasks, and activities.", "CRM & Pipeline"],
  ["Creative Studio", "Work with images, video, graphics, documents, and templates.", "Creative Studio"],
  ["Integrations", "Connect supported services and manage connection settings.", "Integrations"],
  ["Security & Privacy", "Review account security and privacy guidance.", "Security & Privacy"],
  ["Account & Billing", "Manage workspace, plan, billing, and usage settings.", "Account & billing"],
  ["Marketplace", "Learn how buying, downloads, seller access, and listings work.", "Marketplace"],
];

const outline = "inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-[13.5px] font-bold text-deep-navy hover:bg-bg-soft";

/**
 * Help & Support, from the corrected current-shell reference. It links to the
 * published help library and real contact channels, and asserts no system
 * status, live chat or response times — none of those are connected.
 */
export default function HelpSupportPage() {
  const articles = HELP_ARTICLES;
  return (
    <div className="mx-auto max-w-[1680px]">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[#0B5CFF]">
        <Link href="/app/settings" className="hover:underline">Workspace</Link>
        <ChevronRight className="h-3.5 w-3.5 text-ink-muted" />
        <span>Help &amp; Support</span>
      </nav>
      <h1 className="mt-1 font-display text-[32px] font-extrabold leading-tight text-deep-navy">Help &amp; Support</h1>
      <p className="mt-0.5 text-[14.5px] text-ink-soft">Find product guidance, documentation, and support options for Amplivanta.</p>

      <form action="/resources/help-center" method="get" role="search" className="mt-5 flex gap-2.5 rounded-xl border border-line bg-white p-4">
        <label className="relative flex-1">
          <span className="sr-only">Search help</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <input name="q" placeholder="How can we help you?" className="h-12 w-full rounded-lg border border-line pl-8 pr-3 text-[13.5px] focus:border-[#0B5CFF] focus:outline-none" />
        </label>
        <button type="submit" className={crmPrimaryBtn}>Search</button>
      </form>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-[18px] font-bold text-deep-navy">Browse Help Topics</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {TOPICS.map(([title, body, topic]) => (
                <div key={title} className="rounded-xl border border-line p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal-tint text-[#0B5CFF]"><Diamond className="h-4 w-4" /></span>
                  <h3 className="mt-3 text-[17px] font-bold text-deep-navy">{title}</h3>
                  <p className="mt-1 text-[13px] text-ink-soft">{body}</p>
                  <Link href={`/resources/help-center?topic=${encodeURIComponent(topic)}#library`} className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-[#0B5CFF] hover:underline">
                    View articles <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-[18px] font-bold text-deep-navy">Knowledge Base</h2>
            {articles.length > 0 ? (
              <ul className="mt-3 divide-y divide-line">
                {articles.map((a) => (
                  <li key={a.slug} className="py-3">
                    <Link href={`/resources/help-center/${a.slug}`} className="text-[14px] font-semibold text-deep-navy hover:text-[#0B5CFF]">{a.title}</Link>
                    <p className="text-[12.5px] text-ink-soft">{a.summary}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <FileText className="h-7 w-7 text-deep-navy/70" />
                <div className="mt-2 text-[14px] font-bold text-deep-navy">No published help articles yet</div>
                <p className="mt-1 text-[13px] text-ink-soft">Articles appear here once they are published to the help library.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-[16px] font-bold text-deep-navy">System Status</h2>
            <p className="mt-2 text-[13px] text-ink-soft">Status monitoring is not connected yet.</p>
            <div className="mt-3 flex items-center justify-between border-t border-line py-3 text-[13px]">
              <span className="text-deep-navy">Current status</span>
              <span className="text-ink-soft">Not available</span>
            </div>
            <button type="button" disabled title="A status page is not connected yet" className={`${outline} cursor-not-allowed opacity-60`}>View Status</button>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-[16px] font-bold text-deep-navy">Contact Support</h2>
            <p className="mt-2 text-[13px] text-ink-soft">Send a support request to the Amplivanta team. We reply to the address on your request.</p>
            <Link href="/contact" className={`${crmPrimaryBtn} mt-3`}>Contact Support</Link>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-[16px] font-bold text-deep-navy">Documentation</h2>
            <p className="mt-2 text-[13px] text-ink-soft">Product documentation, implementation guides, and release notes appear in the help library when published.</p>
            <Link href="/resources/help-center" className={`${outline} mt-3`}>Browse Documentation</Link>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-[16px] font-bold text-deep-navy">Feedback</h2>
            <p className="mt-2 text-[13px] text-ink-soft">Send product feedback to the Amplivanta team.</p>
            <Link href="/contact" className={`${outline} mt-3`}>Send Feedback</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

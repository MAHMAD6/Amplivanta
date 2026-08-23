import { Shield, User, Share2, Globe, Lock, UserCheck, FileText, Baby, RefreshCw, Mail, type LucideIcon } from "lucide-react";
import { MarketingBreadcrumb } from "./marketing-breadcrumb";

const ICONS: LucideIcon[] = [Shield, User, Share2, Globe, Lock, UserCheck, FileText, Baby, RefreshCw, Mail];

export interface LegalSection {
  heading: string;
  body: string;
}
export interface LegalDoc {
  breadcrumbLabel: string;
  title: string;
  intro: string;
  updated?: string;
  sections: LegalSection[];
}

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-[900px] px-4 lg:px-8">
        <MarketingBreadcrumb items={[["Home", "/"], ["Legal", "/legal"], [doc.breadcrumbLabel, null]]} />
        <h1 className="mt-6 font-display text-[38px] font-extrabold leading-tight text-deep-navy lg:text-[44px]">{doc.title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{doc.intro}</p>
        {doc.updated && <p className="mt-2 text-[12.5px] text-ink-muted">Last updated: {doc.updated}</p>}

        {/* TOC */}
        <details className="group mt-8 rounded-xl border border-line bg-white" open>
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-[15px] font-bold text-deep-navy">
            <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-royal-blue" /> Table of Contents</span>
            <span className="text-royal-blue transition group-open:rotate-180">⌄</span>
          </summary>
          <ol className="border-t border-line px-5 py-3 text-[13px] text-ink-soft">
            {doc.sections.map((s, i) => (
              <li key={s.heading}><a href={`#sec-${i + 1}`} className="block py-1 hover:text-royal-blue">{i + 1}. {s.heading}</a></li>
            ))}
          </ol>
        </details>

        {/* Sections */}
        <div className="mt-6 divide-y divide-line">
          {doc.sections.map((s, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div key={s.heading} id={`sec-${i + 1}`} className="flex gap-4 py-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><Icon className="h-5 w-5" /></span>
                <div>
                  <h2 className="text-[17px] font-bold text-deep-navy">{i + 1}. {s.heading}</h2>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

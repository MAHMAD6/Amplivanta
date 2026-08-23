import type { Metadata } from "next";
import Link from "next/link";
import { FileText, BookOpen, CalendarClock, Globe, Users2, ShieldCheck, UserCheck, Network, ArrowLeftRight, UserCog, Lock, Bell, RefreshCw, Search, ClipboardList, Scale, ShieldQuestion, Info } from "lucide-react";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";

export const metadata: Metadata = { title: "Data Processing Agreement (DPA) — Amplivanta" };

const HIGHLIGHTS = [
  { icon: FileText, title: "GDPR Processor Terms", desc: "Processor obligations under EU GDPR Article 28." },
  { icon: Globe, title: "International Transfer Framework", desc: "SCCs, UK IDTA & other approved mechanisms." },
  { icon: ShieldCheck, title: "Security & Privacy Controls", desc: "Appropriate technical and organizational measures." },
];

const SECTIONS: { icon: typeof FileText; title: string; sub: string; body: string }[] = [
  { icon: FileText, title: "Introduction", sub: "Purpose and background of this Data Processing Agreement.", body: "This DPA governs the processing of Personal Data by Amplivanta (the Processor) on behalf of the Customer (the Controller) in connection with the Services and forms part of the Agreement between the parties." },
  { icon: BookOpen, title: "Definitions", sub: "Key terms used in this Agreement and their meanings.", body: "Capitalized terms such as “Personal Data”, “Processing”, “Controller”, “Processor”, and “Data Subject” have the meanings given under applicable data protection laws, including the GDPR where relevant." },
  { icon: CalendarClock, title: "Subject Matter & Duration", sub: "Scope of this DPA, effective date and term.", body: "This DPA applies for the duration of the Agreement and for as long as Amplivanta processes Personal Data on behalf of the Customer, and survives to the extent required by applicable law." },
  { icon: Globe, title: "Nature & Purpose of Processing", sub: "How and why the Processor processes Personal Data on behalf of the Customer.", body: "Amplivanta processes Personal Data only on documented instructions from the Customer and solely for the purpose of providing, maintaining, and improving the Services." },
  { icon: Users2, title: "Types of Personal Data & Data Subjects", sub: "Categories of Personal Data and individuals whose data is processed.", body: "Processing may involve contact details, account and usage data of the Customer's users, contacts, and end customers, as configured by the Customer within the Services." },
  { icon: ShieldCheck, title: "Processor Obligations", sub: "Our responsibilities for processing Personal Data securely and lawfully.", body: "Amplivanta will process Personal Data lawfully, maintain confidentiality, implement appropriate security measures, and assist the Customer in meeting its data-protection obligations." },
  { icon: UserCheck, title: "Customer Obligations", sub: "Customer responsibilities as the Controller of Personal Data.", body: "The Customer is responsible for the lawfulness of its instructions, obtaining necessary consents, and ensuring it has the right to transfer Personal Data to Amplivanta for processing." },
  { icon: Network, title: "Subprocessors", sub: "Use of approved subprocessors and management of sub-processing.", body: "The Customer authorizes Amplivanta to engage subprocessors. We maintain a current subprocessor list and impose data-protection obligations consistent with this DPA on each subprocessor." },
  { icon: ArrowLeftRight, title: "International Transfers", sub: "Accountability for transfers of Personal Data outside the EEA/UK.", body: "Where Personal Data is transferred internationally, appropriate safeguards such as Standard Contractual Clauses and the UK IDTA are applied." },
  { icon: UserCog, title: "Data Subject Rights", sub: "Assistance with data subject requests and rights fulfillment.", body: "Taking into account the nature of processing, Amplivanta assists the Customer in responding to Data Subject requests to exercise their rights under applicable law." },
  { icon: Lock, title: "Data Security", sub: "Technical and organizational measures to protect Personal Data.", body: "Amplivanta implements measures including encryption in transit and at rest, access controls, monitoring, and regular testing to protect Personal Data." },
  { icon: Bell, title: "Security, Personal Data Breaches & Incident Response", sub: "Breach notification, cooperation and incident response obligations.", body: "Amplivanta will notify the Customer without undue delay after becoming aware of a Personal Data breach and will cooperate to investigate and remediate." },
  { icon: RefreshCw, title: "Data Return & Deletion", sub: "Return or deletion of Personal Data at the end of the relationship.", body: "Upon termination, Amplivanta will delete or return Personal Data in accordance with the Customer's instructions and applicable retention obligations." },
  { icon: Search, title: "Audit Rights", sub: "Customer rights to audit and request information regarding compliance.", body: "Amplivanta will make available information necessary to demonstrate compliance and allow for audits, subject to reasonable confidentiality and security safeguards." },
  { icon: ClipboardList, title: "General Provisions", sub: "Entire agreement, amendments, severability and other general terms.", body: "This DPA, together with the Agreement, constitutes the entire agreement regarding processing. If any provision is invalid, the remainder continues in effect." },
  { icon: Scale, title: "Governing Law & Disputes", sub: "Applicable law and dispute resolution.", body: "This DPA is governed by the law specified in the Agreement, and disputes are resolved in accordance with the Agreement's dispute-resolution provisions." },
];

export default function DpaPage() {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-4 lg:grid-cols-[280px_1fr] lg:px-8">
        {/* Left sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Table of Contents</div>
            <ol className="mt-3 space-y-0.5">
              {SECTIONS.map((s, i) => (
                <li key={s.title}>
                  <a href={`#sec-${i + 1}`} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] ${i === 0 ? "bg-royal-blue font-semibold text-white" : "text-ink-soft hover:bg-bg-soft"}`}>
                    <span className={`text-[11px] ${i === 0 ? "text-white/80" : "text-ink-muted"}`}>{i + 1}</span> {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-2xl border border-line bg-white p-4 text-center shadow-card">
              <ShieldQuestion className="mx-auto h-7 w-7 text-royal-blue" />
              <div className="mt-2 text-[12.5px] font-bold text-deep-navy">Questions about this DPA?</div>
              <p className="mt-1 text-[11px] text-ink-soft">We&apos;re here to help you with any questions you may have.</p>
              <Link href="/contact" className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-lg border border-royal-blue text-[12px] font-semibold text-royal-blue hover:bg-royal-tint">Contact Legal Team</Link>
            </div>
            <div className="mt-4 rounded-2xl border border-line bg-white p-4 text-center shadow-card">
              <Lock className="mx-auto h-7 w-7 text-royal-blue" />
              <div className="mt-2 text-[12.5px] font-bold text-deep-navy">Security & Privacy at Amplivanta</div>
              <p className="mt-1 text-[11px] text-ink-soft">We prioritize the protection of Personal Data and maintain robust technical and organizational safeguards.</p>
              <Link href="/security" className="mt-2 inline-block text-[12px] font-semibold text-royal-blue">Learn more →</Link>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0">
          <MarketingBreadcrumb items={[["Home", "/"], ["Legal", "/legal"], ["Data Processing Agreement", null]]} />
          <div className="mt-4 text-[12px] font-bold uppercase tracking-wider text-royal-blue">Legal</div>
          <h1 className="mt-2 font-display text-[36px] font-extrabold leading-tight text-deep-navy lg:text-[44px]">Data Processing Agreement (DPA)</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">This Data Processing Agreement (“DPA”) sets out the terms under which Amplivanta, operator of the Services (the “Processor” or “Service Provider”), processes Personal Data on behalf of its customers (the “Controller” or “Customer”).</p>

          {/* Highlights */}
          <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-white p-5 shadow-card sm:grid-cols-3">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="flex gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-royal-tint text-royal-blue"><h.icon className="h-4 w-4" /></span>
                <div><div className="text-[12.5px] font-bold text-deep-navy">{h.title}</div><p className="text-[11px] text-ink-soft">{h.desc}</p></div>
              </div>
            ))}
          </div>

          {/* Info banner */}
          <div className="mt-4 flex gap-3 rounded-xl bg-royal-tint/50 p-4">
            <Info className="h-5 w-5 shrink-0 text-royal-blue" />
            <p className="text-[12.5px] leading-relaxed text-ink-soft">This DPA forms part of the Agreement between Amplivanta (Processor) and the Customer. Capitalized terms used but not defined in this DPA have the meanings set forth in the Agreement.</p>
          </div>

          {/* Sections (accordions) */}
          <div className="mt-5 space-y-2.5">
            {SECTIONS.map((s, i) => (
              <details key={s.title} id={`sec-${i + 1}`} className="group rounded-xl border border-line bg-white">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-royal-tint text-royal-blue"><s.icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold text-deep-navy">{i + 1}. {s.title}</span>
                    <span className="block text-[12px] text-ink-soft">{s.sub}</span>
                  </span>
                  <span className="text-ink-muted transition group-open:rotate-180">⌄</span>
                </summary>
                <p className="border-t border-line px-4 py-3.5 pl-16 text-[13px] leading-relaxed text-ink-soft">{s.body}</p>
              </details>
            ))}
          </div>

          {/* Schedules note */}
          <div className="mt-5 flex gap-3 rounded-xl border border-line bg-bg-soft/50 p-4">
            <FileText className="h-5 w-5 shrink-0 text-royal-blue" />
            <p className="text-[12.5px] leading-relaxed text-ink-soft"><b className="text-deep-navy">Schedules</b>, including EU SCCs, UK Addendum, Subprocessor List, Security Measures, and more, are an integral part of this DPA and available upon request.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

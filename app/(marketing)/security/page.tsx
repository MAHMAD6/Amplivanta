import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2, Users2, Cloud, Bell, Database, ClipboardCheck, AlertTriangle, Globe, FileText, ChevronRight, Download } from "lucide-react";

export const metadata: Metadata = { title: "Trust Center" };

const VALUES = [
  { icon: ShieldCheck, title: "Security by Design", desc: "We build with security in mind across our platform and processes." },
  { icon: Lock, title: "Privacy Focused", desc: "We are committed to protecting your data and respecting user privacy." },
  { icon: CheckCircle2, title: "Reliable Platform", desc: "We design for availability and performance to support your business needs." },
  { icon: Users2, title: "Transparent Practices", desc: "We promote clear policies, regular reviews, and open communication." },
];
const APPROACH = [
  { icon: Lock, title: "Data Protection", desc: "We use industry-standard measures to protect your data." },
  { icon: Users2, title: "Access Controls", desc: "We apply role-based access and least privilege principles." },
  { icon: Cloud, title: "Secure Infrastructure", desc: "Our platform is built on modern infrastructure with security controls." },
  { icon: Bell, title: "Monitoring", desc: "We monitor our systems to help identify and address issues." },
  { icon: Database, title: "Backup Practices", desc: "We maintain backup processes to support business continuity." },
  { icon: ShieldCheck, title: "Vulnerability Management", desc: "We regularly review our systems to identify and reduce potential risks." },
  { icon: ClipboardCheck, title: "Third-Party Management", desc: "We work with trusted partners and evaluate their security practices." },
  { icon: AlertTriangle, title: "Incident Management", desc: "We have defined processes to respond to and manage security incidents." },
];
const FRAMEWORKS = [
  { icon: Globe, desc: "Aligned with industry security frameworks and guidelines." },
  { icon: ClipboardCheck, desc: "Regular reviews to improve our policies and controls." },
  { icon: Users2, desc: "Policies and procedures designed to protect your data." },
  { icon: ShieldCheck, desc: "Ongoing commitment to improving our security practices." },
];
const POLICIES = [
  { icon: Lock, title: "Privacy Policy", desc: "How we collect, use, and protect your data.", href: "/legal/privacy" },
  { icon: FileText, title: "Terms of Service", desc: "Our terms and conditions for using Amplivanta.", href: "/legal/terms" },
  { icon: ShieldCheck, title: "Data Processing Agreement", desc: "Details on our data processing commitments.", href: "/legal/compliance" },
  { icon: Users2, title: "Subprocessor List", desc: "Third-party providers we work with.", href: "/legal/compliance" },
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-royal-tint/60 to-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-royal-blue">Public Security / Trust Center</span>
            <h1 className="mt-3 font-display text-[44px] font-extrabold leading-[1.05] text-deep-navy lg:text-[52px]">Built on Security.<br /><span className="text-royal-blue">Backed by Trust.</span></h1>
            <p className="mt-5 max-w-[440px] text-[15px] leading-relaxed text-ink-soft">At Amplivanta, security, privacy, and reliability are at the core of everything we build. We follow industry best practices and continuously work to protect your data and help you operate with confidence.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/contact?intent=security" className="inline-flex h-11 items-center rounded-xl bg-royal-blue px-5 text-[13px] font-bold text-white hover:bg-royal-soft">Request Security Overview</Link>
              <button className="inline-flex items-center gap-2 text-[13px] font-semibold text-royal-blue"><Download className="h-4 w-4" /> Download Overview (PDF)</button>
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-royal-tint/40">
              <div className="flex h-32 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-royal-blue to-royal-soft shadow-card-lg"><Lock className="h-14 w-14 text-white" /></div>
              {[Lock, FileText, CheckCircle2, Users2].map((I, i) => (
                <span key={i} className="absolute flex h-11 w-11 items-center justify-center rounded-full bg-white text-royal-blue shadow-card" style={{ top: `${[10, 25, 55, 60][i]}%`, left: `${[62, 6, 10, 72][i]}%` }}><I className="h-5 w-5" /></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value cards */}
      <section className="bg-white py-4">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <div className="grid gap-4 rounded-2xl border border-line bg-white p-6 shadow-card md:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><v.icon className="h-5 w-5" /></span>
                <div className="mt-3 text-[14px] font-bold text-deep-navy">{v.title}</div>
                <p className="mt-1 text-[12px] leading-snug text-ink-soft">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <Section title="Our Approach to Security" sub="We follow industry best practices to help protect your data, infrastructure, and operations.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {APPROACH.map((a) => <Card key={a.title} icon={a.icon} title={a.title} desc={a.desc} />)}
        </div>
      </Section>

      {/* Frameworks */}
      <Section title="Security & Privacy Frameworks" sub="We align with recognized standards and follow industry best practices.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FRAMEWORKS.map((f, i) => (
            <div key={i} className="flex gap-3 rounded-2xl border border-line bg-white p-4 shadow-card">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-royal-tint text-royal-blue"><f.icon className="h-4 w-4" /></span>
              <p className="text-[12.5px] leading-snug text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Policies */}
      <Section title="Policies & Resources" sub="Learn more about how we protect your data and maintain trust.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {POLICIES.map((p) => (
            <Link key={p.title} href={p.href} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-card transition hover:border-royal-blue/40">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-royal-tint text-royal-blue"><p.icon className="h-4 w-4" /></span>
              <div className="flex-1"><div className="text-[13px] font-bold text-deep-navy">{p.title}</div><p className="text-[11.5px] text-ink-soft">{p.desc}</p></div>
              <ChevronRight className="h-4 w-4 text-ink-muted" />
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-white pb-16">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-royal-tint/50 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-royal-blue shadow-card"><ShieldCheck className="h-5 w-5" /></span>
              <div><div className="text-[15px] font-bold text-deep-navy">Your trust drives us forward.</div><p className="text-[12.5px] text-ink-soft">We are committed to being transparent about our practices and continuously working to earn and maintain your trust.</p></div>
            </div>
            <Link href="/contact?intent=security" className="inline-flex h-11 items-center rounded-xl bg-royal-blue px-5 text-[13px] font-bold text-white hover:bg-royal-soft">Contact Security Team</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <h2 className="text-center font-display text-2xl font-extrabold text-deep-navy">{title}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[13px] text-ink-soft">{sub}</p>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
function Card({ icon: Icon, title, desc }: { icon: typeof Lock; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-royal-tint text-royal-blue"><Icon className="h-4 w-4" /></span>
      <div className="mt-3 text-[13.5px] font-bold text-deep-navy">{title}</div>
      <p className="mt-1 text-[12px] leading-snug text-ink-soft">{desc}</p>
    </div>
  );
}

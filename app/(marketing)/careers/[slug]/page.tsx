import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bookmark, ArrowRight, Briefcase, Clock, MapPin, LayoutGrid, Users2, CalendarDays, Send, Heart, MessageCircle, TrendingUp, Monitor, Star, ShieldCheck, ClipboardList, Target, Award } from "lucide-react";
import { JOBS } from "@/lib/careers";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";

export function generateStaticParams() {
  return JOBS.map((j) => ({ slug: j.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = JOBS.find((j) => j.slug === slug);
  return job ? { title: `${job.title} — Careers — Amplivanta` } : {};
}

const VALUES = [
  { icon: Heart, title: "Meaningful Impact", desc: "Work on products that solve real problems and create value." },
  { icon: MessageCircle, title: "Collaborative Culture", desc: "Great people, open communication, and shared success." },
  { icon: TrendingUp, title: "Growth Mindset", desc: "Learn, experiment, and grow your skills with continuous support." },
  { icon: Monitor, title: "Remote First", desc: "Flexible work environment with outcomes that matter." },
  { icon: Star, title: "Diverse & Inclusive", desc: "We celebrate diversity and are committed to inclusion for all." },
];

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = JOBS.find((j) => j.slug === slug);
  if (!job) notFound();

  return (
    <>
      {/* Hero */}
      <section className="bg-deep-navy text-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-6 lg:px-8">
          <MarketingBreadcrumb items={[["Home", "/"], ["Company", "/company"], ["Careers", "/careers"], [job.title, null]]} />
        </div>
        <div className="mx-auto max-w-[1200px] px-4 py-10 lg:px-8">
          <h1 className="font-display text-[40px] font-extrabold leading-tight lg:text-[46px]">{job.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[12px] font-semibold text-emerald-300">Opening</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/80">{job.type}</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/80">{job.location}</span>
          </div>
          <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-white/70">{job.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/careers/applied" className="inline-flex h-11 items-center gap-2 rounded-xl bg-royal-blue px-5 text-[13px] font-bold text-white hover:bg-royal-soft">Apply for this Position <ArrowRight className="h-4 w-4" /></Link>
            <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/30 px-5 text-[13px] font-bold text-white hover:bg-white/10"><Bookmark className="h-4 w-4" /> Save Job</button>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-4 lg:grid-cols-[1.5fr_0.9fr] lg:px-8">
          <div className="space-y-8">
            <Block icon={ClipboardList} title="About the Role"><p className="text-[14px] leading-relaxed text-ink-soft">{job.about}</p></Block>
            <Block icon={Target} title="What You'll Do"><Bullets items={job.doList} /></Block>
            <Block icon={Award} title="What You'll Bring"><Bullets items={job.bringList} /></Block>
            <Block icon={Star} title="Nice to Have"><Bullets items={job.niceList} /></Block>
            <Block icon={TrendingUp} title="Compensation & Benefits"><p className="text-[14px] leading-relaxed text-ink-soft">{job.compensation}</p></Block>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center gap-2 text-[14px] font-bold text-deep-navy"><Briefcase className="h-4 w-4 text-royal-blue" /> Job Snapshot</div>
              <dl className="space-y-2.5 text-[13px]">
                <Snap icon={Briefcase} label="Job Title" value={job.title} />
                <Snap icon={Clock} label="Employment Type" value={job.type} />
                <Snap icon={MapPin} label="Location" value={job.location} />
                <Snap icon={LayoutGrid} label="Department" value={job.department} />
                <Snap icon={Users2} label="Reports To" value={job.reportsTo} />
                <Snap icon={CalendarDays} label="Posted On" value={job.postedOn} />
              </dl>
            </div>
            <div className="rounded-2xl border border-line bg-royal-tint/40 p-5">
              <div className="flex items-center gap-2 text-[14px] font-bold text-deep-navy"><Send className="h-4 w-4 text-royal-blue" /> Ready to make an impact?</div>
              <p className="mt-1 text-[12.5px] text-ink-soft">We&apos;d love to learn more about you.</p>
              <Link href="/careers/applied" className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-royal-blue text-[13px] font-bold text-white hover:bg-royal-soft">Apply for this Position <ArrowRight className="h-4 w-4" /></Link>
              <p className="mt-2 text-center text-[11px] text-ink-muted">Applying takes less than 5 minutes.</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-center gap-2 text-[13px] font-bold text-deep-navy"><ShieldCheck className="h-4 w-4 text-royal-blue" /> We value your privacy</div>
              <p className="mt-1 text-[12px] text-ink-soft">Your information is safe with us and will only be used for recruitment purposes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Amplivanta */}
      <section className="bg-white pb-16">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <div className="rounded-2xl border border-line bg-bg-soft/40 p-8">
            <h2 className="text-center font-display text-2xl font-extrabold text-deep-navy">Why Amplivanta?</h2>
            <p className="mt-1 text-center text-[13px] text-ink-soft">We&apos;re building a culture where talented people do their best work.</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {VALUES.map((v) => (
                <div key={v.title} className="text-center">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><v.icon className="h-5 w-5" /></span>
                  <div className="mt-2 text-[12.5px] font-bold text-deep-navy">{v.title}</div>
                  <p className="mt-0.5 text-[11px] text-ink-soft">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Block({ icon: Icon, title, children }: { icon: typeof Target; title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line pb-8 last:border-0">
      <h2 className="flex items-center gap-2 text-[18px] font-bold text-deep-navy"><Icon className="h-5 w-5 text-royal-blue" /> {title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function Bullets({ items }: { items: string[] }) {
  return <ul className="space-y-2">{items.map((b) => <li key={b} className="flex items-start gap-2 text-[13.5px] text-ink-soft"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-royal-blue" /> {b}</li>)}</ul>;
}
function Snap({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return <div className="flex items-center justify-between"><dt className="flex items-center gap-2 text-ink-muted"><Icon className="h-4 w-4" /> {label}</dt><dd className="font-semibold text-deep-navy">{value}</dd></div>;
}

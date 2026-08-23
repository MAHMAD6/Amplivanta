import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, ArrowRight, Heart, MessageCircle, TrendingUp, Monitor, Star } from "lucide-react";
import { JOBS } from "@/lib/careers";

export const metadata: Metadata = { title: "Careers — Amplivanta" };

const VALUES = [
  { icon: Heart, title: "Meaningful Impact" },
  { icon: MessageCircle, title: "Collaborative Culture" },
  { icon: TrendingUp, title: "Growth Mindset" },
  { icon: Monitor, title: "Remote First" },
  { icon: Star, title: "Diverse & Inclusive" },
];

export default function CareersPage() {
  return (
    <>
      <section className="bg-deep-navy text-white">
        <div className="mx-auto max-w-[1100px] px-4 py-16 text-center lg:px-8">
          <span className="text-[12px] font-bold uppercase tracking-wider text-royal-soft">Careers</span>
          <h1 className="mt-3 font-display text-[44px] font-extrabold leading-tight lg:text-[52px]">Engineer growth with us.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70">Join a team building the all-in-one platform that helps businesses grow smarter. We hire for curiosity, craft, and impact.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {VALUES.map((v) => (
              <span key={v.title} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[12.5px] font-semibold text-white/80"><v.icon className="h-4 w-4 text-royal-soft" /> {v.title}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-[900px] px-4 lg:px-8">
          <h2 className="font-display text-2xl font-extrabold text-deep-navy">Open Positions</h2>
          <div className="mt-6 space-y-3">
            {JOBS.map((j) => (
              <Link key={j.slug} href={`/careers/${j.slug}`} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-card transition hover:border-royal-blue/40">
                <div>
                  <div className="text-[16px] font-bold text-deep-navy">{j.title}</div>
                  <div className="mt-1 flex flex-wrap gap-3 text-[12.5px] text-ink-soft">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {j.type}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {j.location}</span>
                    <span>{j.department}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-royal-blue">View role <ArrowRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

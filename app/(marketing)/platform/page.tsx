import Link from "next/link";
import type { Metadata } from "next";
import { CAPABILITIES } from "@/lib/constants";
import { ArrowRight, Sparkles, Search, Mail, Users, Share2, BarChart3, Wand2, Plug, Megaphone } from "lucide-react";

export const metadata: Metadata = { title: "Platform" };

const iconMap = { sparkles: Sparkles, search: Search, mail: Mail, users: Users, share: Share2, megaphone: Megaphone, "bar-chart": BarChart3, wand: Wand2, plug: Plug } as const;

export default function PlatformIndexPage() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet">The Amplivanta Platform</span>
          <h1 className="mt-4 font-display text-5xl font-extrabold text-ink">One platform. Every growth job.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-soft">17 modules. 93 pages. Zero duct tape.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => {
            const Icon = iconMap[c.icon as keyof typeof iconMap] ?? Sparkles;
            return (
              <Link key={c.key} href={c.href} className="group rounded-2xl border border-line bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-violet/30 hover:shadow-card-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet/10 text-violet">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-[15px] font-bold text-ink">{c.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{c.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-violet">
                  Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

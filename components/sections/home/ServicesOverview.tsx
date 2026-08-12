import Link from "next/link";
import {
  Sparkles,
  Search,
  Mail,
  Users,
  Share2,
  BarChart3,
  Wand2,
  Workflow,
  ArrowRight,
} from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const FEATURES = [
  { icon: Sparkles, tile: "ic-violet", title: "AI Advisor™", desc: "Personalized AI guidance to help you make smarter growth decisions." },
  { icon: Search, tile: "ic-pink", title: "Growth Audit™", desc: "Deep website & digital performance audits with AI-powered recommendations." },
  { icon: Mail, tile: "ic-green", title: "Marketing Automation", desc: "Automate campaigns, nurture leads, and drive more conversions." },
  { icon: Users, tile: "ic-blue", title: "CRM", desc: "Manage leads, sales, and customer relationships in one place." },
  { icon: Share2, tile: "ic-magenta", title: "Social Publishing", desc: "Plan, publish, and analyze content across all your social channels." },
  { icon: BarChart3, tile: "ic-indigo", title: "Analytics", desc: "Track performance, measure ROI, and uncover actionable insights." },
  { icon: Wand2, tile: "ic-amber", title: "AI Creative Studio™", desc: "Generate stunning content, images, videos, and copy with AI." },
  { icon: Workflow, tile: "ic-teal", title: "Integrations", desc: "Connect your favorite tools and eliminate manual busy work." },
];

export function ServicesOverview() {
  return (
    <section id="solutions" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[2.125rem] font-extrabold tracking-tight text-[#14121f]">
            Everything you need to engineer growth
          </h2>
          <p className="mt-2.5 text-[15.5px] text-[#767287]">
            One platform. All the tools. Unlimited possibilities.
          </p>
        </ScrollReveal>

        <div className="mt-11 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <ScrollReveal key={f.title} delay={i * 0.05}>
                <div className="group flex h-full flex-col rounded-2xl border border-[#e9e7f0] bg-white p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-[#e3ddf5] hover:shadow-[0_16px_34px_-18px_rgba(30,20,60,0.25)]">
                  <div className={`mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-[11px] ${f.tile}`}>
                    <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                  </div>
                  <h3 className="text-base font-extrabold text-[#14121f]">{f.title}</h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-[1.55] text-[#767287]">{f.desc}</p>
                  <Link href="/services" className="mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#6D3BF5]">
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

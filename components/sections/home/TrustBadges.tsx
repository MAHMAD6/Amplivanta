import { ShieldCheck, Sparkles, Headphones, Globe } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const BADGES = [
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Security",
    desc: "Your data is protected with industry-leading security and compliance.",
  },
  {
    icon: Sparkles,
    title: "AI You Can Trust",
    desc: "Transparent, responsible, and built for accuracy you can count on.",
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    desc: "Real humans, real support, anytime you need it.",
  },
  {
    icon: Globe,
    title: "Global & Compliant",
    desc: "We meet global standards so you can grow anywhere with confidence.",
  },
];

export function TrustBadges() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {BADGES.map(({ icon: Icon, title, desc }, i) => (
          <ScrollReveal key={title} delay={i * 0.06} className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e9e7f0] bg-[#f8f7fb]">
              <Icon className="h-5 w-5 text-[#6D3BF5]" strokeWidth={2.1} />
            </div>
            <div>
              <h4 className="font-display text-[15px] font-extrabold text-[#14121f]">{title}</h4>
              <p className="mt-1 text-[13px] leading-relaxed text-[#767287]">{desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

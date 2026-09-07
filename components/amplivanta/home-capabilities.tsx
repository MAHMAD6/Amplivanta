import Link from "next/link";
import { ArrowRight, BrainCircuit, MailCheck, Users, Megaphone, PenTool, BarChart3 } from "lucide-react";
import { HOME_CAPABILITIES } from "@/lib/constants";

const iconMap = {
  sparkles: BrainCircuit,
  mail: MailCheck,
  users: Users,
  megaphone: Megaphone,
  wand: PenTool,
  "bar-chart": BarChart3,
} as const;

export function HomeCapabilities() {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <h2 className="sr-only">Platform capabilities</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {HOME_CAPABILITIES.map((cap) => {
            const Icon = iconMap[cap.icon as keyof typeof iconMap];
            return (
              <Link
                key={cap.key}
                href={cap.href}
                className="group flex flex-col items-center rounded-xl border border-line bg-white px-4 py-6 text-center transition hover:-translate-y-0.5 hover:border-royal-blue/30 hover:shadow-card"
              >
                <Icon className="h-7 w-7 text-royal-blue" strokeWidth={1.5} />
                <h3 className="mt-4 text-[13.5px] font-bold leading-tight text-deep-navy">
                  {cap.title}
                </h3>
                <p className="mt-2 text-[12px] leading-snug text-ink-muted">{cap.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-royal-blue">
                  Explore <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

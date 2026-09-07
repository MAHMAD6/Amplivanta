import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  BookOpen,
  Briefcase,
  Cloud,
  Factory,
  Heart,
  Home,
  ShoppingCart,
} from "lucide-react";
import { HOME_INDUSTRIES } from "@/lib/constants";

const iconMap = {
  cloud: Cloud,
  cart: ShoppingCart,
  heart: Heart,
  briefcase: Briefcase,
  book: BookOpen,
  factory: Factory,
  home: Home,
  bank: Banknote,
} as const;

/** Hub-and-spoke integration graphic matching the homepage illustration. */
function IntegrationGraph() {
  const nodes = Array.from({ length: 10 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
    return { x: 110 + Math.cos(angle) * 88, y: 100 + Math.sin(angle) * 78 };
  });

  return (
    <svg viewBox="0 0 220 200" className="h-44 w-full text-royal-blue" aria-hidden>
      {nodes.map((n, i) => (
        <line key={i} x1="110" y1="100" x2={n.x} y2={n.y} stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
      ))}
      {nodes.map((n, i) => (
        <g key={`n-${i}`}>
          <circle cx={n.x} cy={n.y} r="9" fill="#fff" stroke="currentColor" strokeWidth="0.9" />
          <circle cx={n.x} cy={n.y} r="2.2" fill="currentColor" opacity="0.7" />
        </g>
      ))}
      <circle cx="110" cy="100" r="14" fill="#fff" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="110" cy="100" r="5" fill="currentColor" />
    </svg>
  );
}

export function HomeIndustries() {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto grid grid-cols-1 max-w-[1280px] gap-6 px-4 lg:grid-cols-2 lg:px-8">
        {/* Industries */}
        <div className="rounded-xl border border-line bg-white p-6">
          <h2 className="font-display text-[20px] font-extrabold text-royal-blue">
            Built for Multiple Industries
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {HOME_INDUSTRIES.map((ind) => {
              const Icon = iconMap[ind.icon as keyof typeof iconMap];
              return (
                <Link
                  key={ind.label}
                  href={ind.href}
                  className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-[12px] font-medium text-deep-navy transition hover:border-royal-blue/40 hover:bg-royal-tint/60"
                >
                  <Icon className="h-4 w-4 shrink-0 text-royal-blue" strokeWidth={1.5} />
                  <span className="leading-tight">{ind.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Integrations */}
        <div className="rounded-xl border border-line bg-white p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1.2fr_1fr] sm:items-center">
            <div>
              <h2 className="font-display text-[20px] font-extrabold text-royal-blue">
                Connected Integrations
              </h2>
              <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
                Connect Amplivanta with the tools you know already use across CRM, email,
                advertising, e-commerce, analytics, collaboration, payments, and APIs.
              </p>
              <Link
                href="/platform/integrations"
                className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-royal-blue"
              >
                Explore Integrations <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <IntegrationGraph />
          </div>
        </div>
      </div>
    </section>
  );
}

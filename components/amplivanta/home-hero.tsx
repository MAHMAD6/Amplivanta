import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BrainCircuit,
  Calendar,
  ChevronDown,
  Home,
  LineChart,
  Megaphone,
  Search,
  Settings,
  Target,
  User,
  FileText,
  BarChart3,
  Workflow,
  BadgeCheck,
} from "lucide-react";
import { LogoMark } from "@/components/layout/LogoMark";

const dashboardNav = [
  { label: "Home", icon: Home, active: true },
  { label: "AI Advisor", icon: BrainCircuit },
  { label: "Campaigns", icon: Megaphone },
  { label: "Pipeline", icon: Workflow },
  { label: "Content", icon: FileText },
  { label: "Analytics", icon: LineChart },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const heroPoints = [
  {
    icon: BrainCircuit,
    title: "AI Powered Insights",
    desc: "for opportunities and risks.",
  },
  {
    icon: Target,
    title: "Unified Execution",
    desc: "Plan, create and measure what matters",
  },
  {
    icon: BadgeCheck,
    title: "Measurable Results",
    desc: "Track impact and grow ROI.",
  },
];

function PanelCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[104px] flex-col rounded-lg border border-line bg-white p-3">
      <div className="text-[10px] font-semibold text-ink">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-line bg-white shadow-card-lg"
    >
      <div className="grid grid-cols-[132px_1fr] sm:grid-cols-[150px_1fr]">
        {/* sidebar */}
        <aside className="bg-deep-navy p-3">
          <div className="mb-4 px-1">
            <LogoMark className="h-6 w-6" />
          </div>
          <nav className="space-y-0.5">
            {dashboardNav.map((n) => (
              <div
                key={n.label}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px] ${
                  n.active ? "bg-white/10 font-semibold text-white" : "text-white/65"
                }`}
              >
                <n.icon className="h-3 w-3 shrink-0" />
                <span className="truncate">{n.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* main */}
        <div className="min-w-0 bg-white">
          <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
            <span className="text-[12px] font-bold text-ink">Home</span>
            <div className="flex items-center gap-2">
              <span className="rounded bg-royal-tint px-1.5 py-0.5 text-[8.5px] font-semibold text-royal-blue">
                Sample data
              </span>
              <span className="hidden items-center gap-1 text-[9px] text-ink-muted sm:inline-flex">
                <Calendar className="h-2.5 w-2.5" /> Jan 1 – May 15, 2025
                <ChevronDown className="h-2.5 w-2.5" />
              </span>
              <Search className="h-3 w-3 text-ink-muted" />
              <Bell className="h-3 w-3 text-ink-muted" />
              <User className="h-3 w-3 text-ink-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
            <PanelCard title="Growth Score">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[10px] font-semibold text-ink-soft">No score yet</div>
                  <p className="mt-1 text-[9px] leading-snug text-ink-muted">
                    Complete setup to unlock your score.
                  </p>
                </div>
                <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90 shrink-0">
                  <circle cx="20" cy="20" r="15" stroke="#e9e7f0" strokeWidth="5" fill="none" />
                </svg>
              </div>
            </PanelCard>

            <PanelCard title="Top Opportunity">
              <div className="text-[10px] font-semibold text-ink-soft">No opportunities yet</div>
              <p className="mt-1 text-[9px] leading-snug text-ink-muted">Connect your data and we&apos;ll surface your highest-priority opportunity.</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold text-royal-blue">
                Connect data <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </PanelCard>

            <PanelCard title="Revenue / Pipeline Impact">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold text-ink-soft">No data yet</div>
                  <p className="mt-1 text-[9px] leading-snug text-ink-muted">
                    Connect your data to see impact.
                  </p>
                </div>
                <svg viewBox="0 0 80 34" className="h-9 w-20 shrink-0">
                  <path
                    d="M2,30 C18,28 26,22 40,18 C54,14 64,8 78,4"
                    fill="none"
                    stroke="#c9cede"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                </svg>
              </div>
            </PanelCard>

            <PanelCard title="Active Campaigns">
              <div className="text-[10px] font-semibold text-ink-soft">No active campaigns</div>
              <p className="mt-1 text-[9px] leading-snug text-ink-muted">
                Create your first campaign to get started.
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold text-royal-blue">
                View all campaigns <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </PanelCard>

            <PanelCard title="AI Recommendation">
              <p className="text-[9px] leading-snug text-ink-muted">
                Connect your data to get personalized recommendations for your business.
              </p>
              <span className="mt-2 inline-block rounded border border-royal-blue/40 px-2 py-1 text-[9px] font-semibold text-royal-blue">
                View Recommendation
              </span>
            </PanelCard>

            <PanelCard title="Performance Trends">
              <div className="flex gap-2 text-[8px] text-ink-muted">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-[2px] bg-royal-blue" /> Revenue
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-[2px] bg-[#6C63E0]" /> Pipeline
                </span>
              </div>
              <div className="mt-1 flex gap-1">
                <div className="flex flex-col justify-between py-0.5 text-[7px] text-ink-muted">
                  <span>High</span>
                  <span>Medium</span>
                  <span>Low</span>
                </div>
                <svg viewBox="0 0 100 40" className="h-12 flex-1">
                  <path
                    d="M2,34 C20,32 34,26 52,20 C70,14 84,10 98,6"
                    fill="none"
                    stroke="#1D5FD6"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M2,37 C20,35 34,31 52,27 C70,23 84,20 98,17"
                    fill="none"
                    stroke="#6C63E0"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                </svg>
              </div>
              <div className="flex justify-between pl-6 text-[7px] text-ink-muted">
                {["Jan", "Feb", "Mar", "Apr", "May"].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </PanelCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <svg
        className="pointer-events-none absolute left-[27%] top-4 hidden h-36 w-36 text-royal-blue/25 lg:block"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden
      >
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 8 }).map((_, c) => (
            <circle key={`${r}-${c}`} cx={6 + c * 12} cy={6 + r * 12} r="1.6" />
          ))
        )}
      </svg>

      <div className="mx-auto grid grid-cols-1 max-w-[1280px] items-start gap-10 px-4 pb-14 pt-12 lg:items-center lg:grid-cols-[minmax(0,_0.82fr)_minmax(0,_1.18fr)] lg:gap-12 lg:px-8 lg:pt-16">
        {/* LEFT: copy */}
        <div>
          <h1 className="font-display text-[46px] font-extrabold leading-[1.06] tracking-tight text-deep-navy lg:text-[58px]">
            Engineer
            <br />
            Smarter Growth.
          </h1>
          <p className="mt-4 text-[19px] font-semibold text-royal-blue">
            Discover Your Next Growth Opportunity.
          </p>
          <p className="mt-5 max-w-[440px] text-[15px] leading-relaxed text-ink-soft">
            Amplivanta combines AI intelligence, automation and powerful tools to help you attract,
            convert and retain more customers—faster.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-orange-cta px-6 text-sm font-semibold text-white transition hover:bg-orange-cta-hover sm:w-auto"
            >
              Start Engineering Growth
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-royal-blue px-6 text-sm font-semibold text-royal-blue transition hover:bg-royal-tint sm:w-auto"
            >
              Book a Demo
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {heroPoints.map((p) => (
              <div key={p.title} className="flex gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-royal-blue/30 text-royal-blue">
                  <p.icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[11.5px] font-bold text-deep-navy">{p.title}</div>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: product preview */}
        <DashboardPreview />
      </div>
    </section>
  );
}

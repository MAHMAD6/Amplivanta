import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  DollarSign,
  Gauge,
  ListChecks,
  RefreshCw,
  Rocket,
  ScanSearch,
  Settings,
  Star,
} from "lucide-react";
import { ADVISOR_STEPS } from "@/lib/constants";

const stepIcons = {
  scan: ScanSearch,
  list: ListChecks,
  settings: Settings,
  gauge: Gauge,
  refresh: RefreshCw,
} as const;

const exampleCards = [
  {
    icon: AlertTriangle,
    label: "Issue Detected",
    tone: "text-amber-400",
    body: "Complete setup to identify opportunities and risks.",
  },
  {
    icon: DollarSign,
    label: "Business Impact",
    tone: "text-emerald-400",
    body: "Impact will appear here after connecting data.",
    lead: "— —",
  },
  {
    icon: Star,
    label: "Recommended Action",
    tone: "text-royal-soft",
    body: "Get personalized recommendations once your data is connected.",
  },
];

export function HomeAdvisor() {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="rounded-2xl bg-deep-navy px-6 py-10 text-white lg:px-10">
          <div className="text-center">
            <h2 className="font-display text-[28px] font-extrabold tracking-tight lg:text-[32px]">
              AI Advisor + Growth Audit™
            </h2>
            <p className="mt-1 text-[13px] text-white/60">Your always-on growth co-pilot.</p>
          </div>

          {/* five-stage loop */}
          <div className="mt-9 flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:justify-between">
            {ADVISOR_STEPS.map((step, i) => {
              const Icon = stepIcons[step.icon as keyof typeof stepIcons];
              return (
                <div key={step.title} className="flex flex-1 basis-0 items-start gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold">{step.title}</div>
                      <p className="mt-0.5 text-[11px] leading-snug text-white/60">{step.desc}</p>
                    </div>
                  </div>
                  <ArrowRight
                    aria-hidden
                    className={`mt-3 hidden h-4 w-4 shrink-0 text-white/40 lg:block ${
                      i === ADVISOR_STEPS.length - 1 ? "lg:invisible" : ""
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* worked example */}
          <div className="mt-9 rounded-xl border border-deep-line bg-deep-panel/60 p-5">
            <div className="text-[12px] font-semibold text-white/85">
              Example: Onboarding Activation
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {exampleCards.map((c) => (
                <div key={c.label} className="rounded-lg border border-deep-line bg-deep-navy p-4">
                  <div className="flex items-center gap-2">
                    <c.icon className={`h-4 w-4 ${c.tone}`} />
                    <span className="text-[12px] font-semibold text-white/85">{c.label}</span>
                  </div>
                  {c.lead && <div className="mt-3 text-[16px] font-bold text-white/70">{c.lead}</div>}
                  <p className="mt-3 text-[13px] leading-snug text-white/70">{c.body}</p>
                </div>
              ))}

              <div className="rounded-lg border border-deep-line bg-deep-navy p-4">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-royal-soft" />
                  <span className="text-[12px] font-semibold text-white/85">
                    Apply Recommendation
                  </span>
                </div>
                <Link
                  href="/signup"
                  className="mt-4 flex h-10 items-center justify-center rounded-md bg-orange-cta px-4 text-[13px] font-semibold text-white transition hover:bg-orange-cta-hover"
                >
                  Apply Recommendation
                </Link>
                <Link
                  href="/platform/growth-audit"
                  className="mt-3 flex items-center justify-center gap-1 text-[12px] font-medium text-white/70 transition hover:text-white"
                >
                  Review details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

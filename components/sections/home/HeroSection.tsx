import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Home,
  MessageSquare,
  TrendingUp,
  FileText,
  Settings,
  Bell,
  Search,
} from "lucide-react";
import { Eyebrow } from "@/components/shared/Eyebrow";

const TRUST = ["No credit card required", "Set up in minutes", "Cancel anytime"];

const NAV = [
  { icon: Home, label: "Overview", active: true },
  { icon: MessageSquare, label: "AI Chat" },
  { icon: TrendingUp, label: "Growth Insights" },
  { icon: FileText, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

const STATS = [
  { label: "Organic Traffic", value: "32,752", delta: "+10%", cls: "text-[#1FAE6A]" },
  { label: "Conversions", value: "1,248", delta: "+24%", cls: "text-[#1FAE6A]" },
  { label: "ROAS", value: "4.6x", delta: "+16%", cls: "text-[#F5731A]" },
  { label: "Leads", value: "842", delta: "+21%", cls: "text-[#6D3BF5]" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-14 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#6D3BF5]/10 blur-[110px]" />
        <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-[#E8398F]/10 blur-[110px]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-start gap-9 lg:grid-cols-[1.02fr_1.28fr]">
        {/* ---- copy ---- */}
        <div>
          <Eyebrow label="AI-Powered Business Growth Platform" />
          <h1 className="mt-5 font-display text-[2.6rem] font-extrabold leading-[1.04] tracking-tight text-[#14121f] sm:text-5xl lg:text-[3.5rem]">
            Engineer Smarter<br />
            <span className="text-gradient">Growth</span> with <span className="text-gradient">AI.</span>
          </h1>
          <p className="mt-5 max-w-[460px] text-[16.5px] leading-[1.65] text-[#767287]">
            The all-in-one AI platform that combines intelligence, automation, and
            the right tools to help businesses{" "}
            <b className="font-bold text-[#4a4756]">attract more customers, convert faster,</b>{" "}
            and grow sustainably.
          </p>

          <div className="mt-7 flex flex-wrap gap-3.5">
            <Link
              href="/contact"
              className="bg-grad-brand-2 group inline-flex items-center gap-2 rounded-[10px] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.55)] transition-all hover:-translate-y-0.5"
            >
              Start Engineering Growth
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#e9e7f0] bg-white px-5 py-3.5 text-[15px] font-semibold text-[#14121f] transition hover:border-[#cfcbe0]"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Watch Demo
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-6">
            {TRUST.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4a4756]">
                <CheckCircle2 className="h-4 w-4 text-[#6D3BF5]" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* ---- dashboard mock ---- */}
        <div className="grid grid-cols-1 overflow-hidden rounded-[22px] border border-[#e9e7f0] bg-white shadow-[0_30px_70px_-25px_rgba(30,20,60,0.28),0_4px_18px_-6px_rgba(30,20,60,0.08)] sm:grid-cols-[178px_1fr]">
          {/* sidebar */}
          <div className="hidden flex-col border-r border-[#e9e7f0] bg-[#fafafd] p-4 sm:flex">
            <div className="mb-5 flex items-center gap-2">
              <span className="bg-grad-brand-2 h-6 w-6 rounded-md" />
              <span className="font-display text-sm font-extrabold text-[#14121f]">Amplivanta</span>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map(({ icon: Icon, label, active }) => (
                <span
                  key={label}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold ${
                    active ? "bg-[#6D3BF5]/10 text-[#6D3BF5]" : "text-[#5c586c]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </span>
              ))}
            </nav>
          </div>

          {/* main */}
          <div className="min-w-0 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-[15px] font-extrabold text-[#14121f]">Good morning, Alex! 👋</span>
              <div className="flex items-center gap-3 text-[#8b879a]">
                <Search className="h-3.5 w-3.5" />
                <Bell className="h-3.5 w-3.5" />
                <span className="h-6 w-6 rounded-full bg-gradient-to-br from-[#F5A623] to-[#F57C1A]" />
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-full bg-[#eef8f1] px-2.5 py-1 text-[10.5px] font-bold text-[#1FAE6A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1FAE6A]" /> AI Advisor active
              </span>
              <span className="rounded-lg border border-[#e9e7f0] px-2.5 py-1 text-[10.5px] font-semibold text-[#5c586c]">
                May 2024
              </span>
            </div>

            {/* stat grid */}
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-[#e9e7f0] p-3">
                  <p className="text-[10px] font-semibold text-[#8b879a]">{s.label}</p>
                  <p className="mt-1 font-display text-[19px] font-extrabold text-[#14121f]">{s.value}</p>
                  <p className={`text-[9px] font-bold ${s.cls}`}>{s.delta}</p>
                </div>
              ))}
            </div>

            {/* chart */}
            <div className="mt-3 rounded-xl border border-[#e9e7f0] p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11.5px] font-extrabold text-[#14121f]">Performance Trend</span>
                <span className="text-[9.5px] font-bold text-[#6D3BF5]">View report</span>
              </div>
              <svg viewBox="0 0 300 90" className="h-24 w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="amp-hero-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6D3BF5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6D3BF5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 70 L40 60 L80 64 L120 42 L160 48 L200 30 L240 36 L300 16 L300 90 L0 90 Z" fill="url(#amp-hero-area)" />
                <path d="M0 70 L40 60 L80 64 L120 42 L160 48 L200 30 L240 36 L300 16" fill="none" stroke="#6D3BF5" strokeWidth="2" />
                <path d="M0 80 L40 76 L80 72 L120 66 L160 68 L200 58 L240 60 L300 50" fill="none" stroke="#F5731A" strokeWidth="2" />
              </svg>
            </div>

            {/* recommendation */}
            <div className="mt-3 rounded-xl border border-[#e9e7f0] p-3.5">
              <div className="mb-2 flex items-center gap-2">
                <span className="ic-violet flex h-5 w-5 items-center justify-center rounded-md">
                  <Sparkles className="h-3 w-3 text-white" />
                </span>
                <span className="text-[11px] font-bold text-[#14121f]">Top AI Recommendation</span>
              </div>
              <p className="text-[10.5px] leading-snug text-[#8b879a]">
                Optimize 3 underperforming landing pages to lift conversions an estimated <b className="text-[#1FAE6A]">+18%</b>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

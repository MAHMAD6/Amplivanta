import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Image as ImageIcon, Video, Layers, FileText, Presentation, Megaphone, Ruler, Wand2, ArrowRight, Palette } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CreativeSubnav } from "@/components/amplivanta/creative-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { PROJECTS, BRAND_KITS, PROJECT_STATUS_TONE } from "@/lib/creative-data";

export const metadata: Metadata = { title: "Creative Studio" };

const QUICK_CREATE = [
  { icon: Layers, label: "Social Post", tone: "violet", href: "/app/creative-studio/graphics" },
  { icon: Video, label: "Video", tone: "pink", href: "/app/creative-studio/video" },
  { icon: ImageIcon, label: "Carousel", tone: "blue", href: "/app/creative-studio/graphics" },
  { icon: Presentation, label: "Story", tone: "orange", href: "/app/creative-studio/graphics" },
  { icon: Megaphone, label: "Ad Creative", tone: "green", href: "/app/creative-studio/graphics" },
  { icon: Presentation, label: "Presentation", tone: "indigo", href: "/app/creative-studio/graphics" },
  { icon: FileText, label: "Blog Visual", tone: "amber", href: "/app/creative-studio/graphics" },
  { icon: Ruler, label: "Custom Size", tone: "teal", href: "/app/creative-studio/graphics" },
];

const TONE_CLASS: Record<string, string> = {
  violet: "bg-violet/10 text-violet",
  pink: "bg-pink-brand/10 text-pink-brand",
  blue: "bg-blue-500/10 text-blue-600",
  orange: "bg-orange-brand/10 text-orange-brand",
  green: "bg-emerald-500/10 text-emerald-600",
  indigo: "bg-indigo-500/10 text-indigo-600",
  amber: "bg-amber-500/10 text-amber-600",
  teal: "bg-teal-500/10 text-teal-600",
};

export default function CreativeOverviewPage() {
  const defaultKit = BRAND_KITS.find((b) => b.isDefault)!;
  const recent = PROJECTS.slice(0, 6);
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Creative Studio"
        subtitle="Launch AI-assisted content, access recent work, keep everything on-brand."
        actions={
          <>
            <Link href="/app/creative-studio/projects" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">My Projects</Link>
            <Link href="/app/creative-studio/templates" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
              <Sparkles className="h-3.5 w-3.5" /> Browse Templates
            </Link>
          </>
        }
      />
      <CreativeSubnav />

      {/* AI Creative Assistant */}
      <div className="mb-6 rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/[0.05] via-white to-orange-brand/[0.05] p-6 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-grad-cta text-white shadow-violet">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-ink">AI Creative Assistant</div>
            <div className="text-[11.5px] text-ink-muted">Prompt anything. Get on-brand output in seconds.</div>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            defaultValue="Instagram carousel for our Spring Launch — 5 slides, vibrant, product-focused"
            className="flex-1 rounded-xl border border-line bg-white px-4 py-3 text-[13.5px] focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
          />
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-grad-cta px-5 text-[13px] font-bold text-white shadow-violet">
            <Wand2 className="h-3.5 w-3.5" /> Generate
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Product ad", "LinkedIn post", "Blog hero image", "Story countdown", "60s explainer video"].map((q) => (
            <button key={q} className="rounded-full border border-line bg-white px-3 py-1 text-[11.5px] font-semibold text-ink-soft hover:border-violet/30 hover:text-violet">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Quick create */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[14px] font-bold text-ink">Quick Create</div>
        <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
          {QUICK_CREATE.map((q) => (
            <Link key={q.label} href={q.href} className="flex flex-col items-center gap-2 rounded-xl border border-line p-4 text-center transition hover:-translate-y-0.5 hover:border-violet/30 hover:shadow-card">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONE_CLASS[q.tone]}`}>
                <q.icon className="h-5 w-5" />
              </div>
              <span className="text-[12px] font-semibold text-ink">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent projects */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Recent Projects</div>
            <Link href="/app/creative-studio/projects" className="text-[12px] font-semibold text-violet">View all →</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {recent.map((p) => (
              <Link key={p.id} href={`/app/creative-studio/projects#${p.id}`} className="group overflow-hidden rounded-xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:border-violet/30">
                <div className={`aspect-video bg-gradient-to-br ${p.thumb}`} />
                <div className="p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <StatusPill tone={PROJECT_STATUS_TONE[p.status]}>{p.status}</StatusPill>
                    <span className="text-[10px] text-ink-muted">{p.type}</span>
                  </div>
                  <div className="truncate text-[12.5px] font-semibold text-ink">{p.name}</div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <Avatar name={p.owner} size={18} />
                    <span className="text-[10px] text-ink-muted">{p.updatedAt}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Brand kit + AI credits + inspiration */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-violet" />
                <div className="text-[13px] font-bold text-ink">Brand Kit</div>
              </div>
              <Link href="/app/creative-studio/brand-kit" className="text-[11px] font-semibold text-violet">Manage →</Link>
            </div>
            <div className="text-[12.5px] font-semibold text-ink">{defaultKit.name}</div>
            <div className="text-[10.5px] text-ink-muted">Default · Applied to new projects</div>
            <div className="mt-3 flex gap-1.5">
              {defaultKit.colors.slice(0, 6).map((c) => (
                <div key={c} className="h-8 w-8 rounded-lg border border-line" style={{ background: c }} title={c} />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-ink-muted">Display</div>
                <div className="font-bold text-ink">{defaultKit.fonts.display}</div>
              </div>
              <div>
                <div className="text-ink-muted">Body</div>
                <div className="font-bold text-ink">{defaultKit.fonts.body}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 text-[13px] font-bold text-ink">AI Credits</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-ink">2,450</span>
              <span className="text-[11px] text-ink-muted">/ 5,000</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-soft">
              <div className="h-full w-[49%] rounded-full bg-grad-brand" />
            </div>
            <div className="mt-2 text-[11px] text-ink-muted">Resets Jun 1, 2026</div>
            <Link href="/app/settings/billing" className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-bold text-violet">
              Manage Credits <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.04] to-orange-brand/[0.04] p-5">
            <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
              <Sparkles className="h-3.5 w-3.5 text-violet" /> Inspiration
            </div>
            <ul className="space-y-1.5 text-[11.5px] text-ink-soft">
              <li>· 3 templates trending this week — SaaS launches</li>
              <li>· AI Video Studio just added &ldquo;URL-to-Video&rdquo;</li>
              <li>· Brand Kit sync now on for all editors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

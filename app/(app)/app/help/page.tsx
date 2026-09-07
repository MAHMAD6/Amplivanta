import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  Megaphone,
  Play,
  Plug,
  Search,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { RailCard } from "@/components/amplivanta/resource-breadcrumb";

export const metadata: Metadata = { title: "Help / Support" };

const POPULAR = ["AI Recommendations", "Action Plans", "Insights", "Integrations"];

const TOPICS = [
  { title: "Getting Started", desc: "Learn the basics and get up to speed fast.", icon: BookOpen, tone: "bg-violet/12 text-violet" },
  { title: "AI Advisor", desc: "Understand AI recommendations, insights, and action plans.", icon: Bot, tone: "bg-emerald-500/12 text-emerald-600" },
  { title: "Features", desc: "Explore Amplivanta features and how they work.", icon: Megaphone, tone: "bg-royal-blue/12 text-royal-blue" },
  { title: "Integrations", desc: "Connect and manage your integrations.", icon: Plug, tone: "bg-orange-brand/12 text-orange-brand" },
  { title: "Security & Privacy", desc: "Learn how we protect your data and ensure privacy.", icon: ShieldCheck, tone: "bg-violet/12 text-violet" },
  { title: "Account & Billing", desc: "Manage your account, team and subscription.", icon: User, tone: "bg-pink-brand/12 text-pink-brand" },
];

const GUIDES = [
  { title: "Welcome to Amplivanta", desc: "A quick overview of the platform and key capabilities.", read: "5 min read" },
  { title: "How AI Recommendations Work", desc: "Understand how our AI analyzes data and delivers insights.", read: "7 min read" },
  { title: "Create Your First Action Plan", desc: "Turn insights into actions that drive results.", read: "6 min read" },
  { title: "Integrate Your Data Sources", desc: "Connect your tools and start getting smarter insights.", read: "8 min read" },
];

const TOP_ARTICLES = [
  "How AI Recommendations Work",
  "Understanding Insight Scores",
  "How to Create an Action Plan",
  "Connect Facebook Ads Account",
  "Data Security at Amplivanta",
];

export default function HelpSupportPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-violet">AI Advisor</div>
      <PageHeader title="Help / Support" subtitle="Find answers, get support, and make the most of Amplivanta." />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {/* Search */}
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3 py-3">
                <Search className="h-4 w-4 text-ink-muted" />
                <input placeholder="How can we help you today?" className="min-w-0 flex-1 bg-transparent text-[13.5px] focus:outline-none" />
              </div>
              <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet px-5 text-[13px] font-semibold text-white transition hover:bg-violet-hover">
                Search
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="font-semibold text-ink-soft">Popular:</span>
              {POPULAR.map((p) => (
                <button key={p} className="font-semibold text-violet hover:underline">{p}</button>
              ))}
            </div>
          </section>

          {/* Topics */}
          <h2 className="mt-6 font-display text-[18px] font-extrabold text-ink">Browse Help Topics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((t) => (
              <div key={t.title} className="rounded-2xl border border-line bg-white p-5 text-center shadow-card">
                <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${t.tone}`}>
                  <t.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[14.5px] font-bold text-ink">{t.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">{t.desc}</p>
                <button className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
                  View Articles <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Getting started guides */}
          <h2 className="mt-8 font-display text-[18px] font-extrabold text-ink">Getting Started Guides</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            {GUIDES.map((g) => (
              <div key={g.title} className="flex items-center gap-3 border-b border-line px-5 py-4 last:border-0 hover:bg-bg-soft">
                <FileText className="h-4 w-4 text-violet" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-violet">{g.title}</div>
                  <div className="text-[11.5px] text-ink-soft">{g.desc}</div>
                </div>
                <span className="text-[11.5px] text-ink-muted">{g.read}</span>
              </div>
            ))}
            <div className="px-5 py-3">
              <button className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
                View all getting started guides <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Still need help */}
          <h2 className="mt-8 font-display text-[18px] font-extrabold text-ink">Still Need Help?</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { title: "Contact Support", desc: "Get help from our support team.", cta: "Contact Us", icon: MessageSquare, tone: "text-violet" },
              { title: "Live Chat", desc: "Chat with our team in real time.", cta: "Start Chat", icon: Send, tone: "text-emerald-600" },
              { title: "Send an Email", desc: "We'll reply to your email as soon as possible.", cta: "Email Us", icon: Mail, tone: "text-royal-blue" },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-line bg-white p-5 text-center shadow-card">
                <c.icon className={`mx-auto h-7 w-7 ${c.tone}`} />
                <h3 className="mt-3 text-[13.5px] font-bold text-ink">{c.title}</h3>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{c.desc}</p>
                <button className="mt-3 rounded-xl border border-line px-4 py-2 text-[12px] font-semibold text-ink">{c.cta}</button>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <RailCard title="System Status">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> All Systems Operational
            </div>
            <p className="mt-2 text-[11.5px] text-ink-muted">Everything is running smoothly.</p>
            <Link href="#" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View Status Page <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </RailCard>

          <RailCard title="Top Help Articles">
            <ul className="space-y-3">
              {TOP_ARTICLES.map((a) => (
                <li key={a} className="flex items-start gap-2.5">
                  <FileText className="mt-0.5 h-4 w-4 text-ink-muted" />
                  <span className="text-[12.5px] font-medium text-ink">{a}</span>
                </li>
              ))}
            </ul>
            <button className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View All Articles <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </RailCard>

          <RailCard title="Video Tutorials">
            <div className="relative flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-[#2A1A6E] to-[#5B2FE0]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-violet">
                <Play className="h-4.5 w-4.5" />
              </span>
            </div>
            <div className="mt-3 text-[12.5px] font-semibold text-ink">Amplivanta Platform Overview</div>
            <div className="text-[11px] text-ink-muted">3:45</div>
          </RailCard>

          <RailCard title="Give Feedback">
            <p className="text-[12px] leading-relaxed text-ink-soft">Help us improve your experience.</p>
            <button className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-[12.5px] font-semibold text-violet">
              <CheckCircle2 className="h-3.5 w-3.5" /> Send Feedback
            </button>
          </RailCard>
        </aside>
      </div>
    </div>
  );
}

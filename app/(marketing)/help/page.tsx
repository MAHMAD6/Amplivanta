import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, MessageCircle, Video, Search } from "lucide-react";

export const metadata: Metadata = { title: "Help Center" };

const topics = [
  { title: "Getting started", icon: BookOpen, count: 24 },
  { title: "CRM & contacts", icon: BookOpen, count: 42 },
  { title: "Automation & workflows", icon: BookOpen, count: 58 },
  { title: "Social publishing", icon: BookOpen, count: 36 },
  { title: "Analytics & reporting", icon: BookOpen, count: 29 },
  { title: "Integrations", icon: BookOpen, count: 47 },
  { title: "Billing & plans", icon: BookOpen, count: 18 },
  { title: "Security & governance", icon: BookOpen, count: 22 },
];

export default function HelpCenter() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1100px] px-4 lg:px-8">
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet">Help Center</span>
          <h1 className="mt-4 font-display text-5xl font-extrabold text-ink">How can we help?</h1>
          <div className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-card">
            <Search className="ml-3 h-4 w-4 text-ink-muted" />
            <input placeholder="Search articles, guides, and shortcuts…" className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none" />
            <button className="rounded-xl bg-grad-cta px-4 py-2 text-sm font-bold text-white">Search</button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((t) => (
            <Link key={t.title} href="#" className="rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-violet/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/10 text-violet">
                <t.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-[14.5px] font-bold text-ink">{t.title}</h3>
              <p className="mt-1 text-[12px] text-ink-muted">{t.count} articles</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: MessageCircle, title: "Chat with us", desc: "24/7 in-app chat" },
            { icon: Video, title: "Watch tutorials", desc: "Short, focused videos" },
            { icon: BookOpen, title: "API docs", desc: "REST + webhooks" },
          ].map((c) => (
            <Link key={c.title} href="#" className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-card transition hover:border-violet/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/10 text-violet">
                <c.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-ink">{c.title}</div>
                <div className="text-[12px] text-ink-muted">{c.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

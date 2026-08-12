import Link from "next/link";
import {
  Layers,
  Briefcase,
  BookOpen,
  MessageSquare,
  Star,
  Users,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/admin/StatsCard";
import { formatDateShort } from "@/lib/utils";

async function getDashboardData() {
  try {
    const [
      services,
      portfolio,
      posts,
      newMessages,
      totalMessages,
      pendingReviews,
      totalReviews,
      team,
      recentMessages,
      recentPosts,
    ] = await Promise.all([
      db.service.count(),
      db.portfolio.count(),
      db.blogPost.count(),
      db.contact.count({ where: { status: "NEW" } }),
      db.contact.count(),
      db.review.count({ where: { isApproved: false } }),
      db.review.count(),
      db.teamMember.count(),
      db.contact.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      db.blogPost.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

    return {
      services,
      portfolio,
      posts,
      newMessages,
      totalMessages,
      pendingReviews,
      totalReviews,
      team,
      recentMessages,
      recentPosts,
      ok: true,
    };
  } catch {
    return {
      services: 0,
      portfolio: 0,
      posts: 0,
      newMessages: 0,
      totalMessages: 0,
      pendingReviews: 0,
      totalReviews: 0,
      team: 0,
      recentMessages: [],
      recentPosts: [],
      ok: false,
    };
  }
}

export default async function AdminDashboard() {
  const d = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Database Warning */}
      {!d.ok && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
          <p className="font-bold flex items-center gap-1.5 text-sm">
            ⚠️ Database Connection Required
          </p>
          <p className="mt-1">
            Start PostgreSQL with <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">docker compose up -d</code>, then run <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">npm run db:push</code> and <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">npm run db:seed</code>.
          </p>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d0b18] via-[#14121f] to-[#1E293B] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#6D3BF5]/10 border border-[#6D3BF5]/30 px-3 py-1 text-xs font-bold text-[#6D3BF5]">
              <Sparkles className="h-3.5 w-3.5" /> Studio Command Center
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back to Impressa Studio 👋
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl">
              Monitor client inquiries, manage portfolio case studies, publish blog articles, and oversee digital agency operations in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/messages"
              className="inline-flex items-center gap-2 rounded-xl bg-[#6D3BF5] px-5 py-3 text-xs font-bold text-white hover:bg-[#5B2FE0] transition shadow-lg shadow-[#6D3BF5]/20"
            >
              <MessageSquare className="h-4 w-4" /> View Messages ({d.newMessages})
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              <ExternalLink className="h-4 w-4" /> View Live Site
            </Link>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#6D3BF5]/10 blur-3xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Digital Services"
          value={d.services}
          icon={Layers}
          subtitle="Active Service Offerings"
          variant="accent"
        />
        <StatsCard
          title="Case Studies"
          value={d.portfolio}
          icon={Briefcase}
          subtitle="Portfolio Projects"
          variant="purple"
        />
        <StatsCard
          title="Blog Articles"
          value={d.posts}
          icon={BookOpen}
          subtitle="Published Content"
          variant="default"
        />
        <StatsCard
          title="New Inquiries"
          value={d.newMessages}
          icon={MessageSquare}
          change={d.newMessages > 0 ? "Unread" : "Caught up"}
          isPositive={d.newMessages === 0}
          subtitle={`${d.totalMessages} Total Messages`}
          variant="warning"
        />
        <StatsCard
          title="Pending Reviews"
          value={d.pendingReviews}
          icon={Star}
          change={d.pendingReviews > 0 ? "Needs Review" : "Clear"}
          isPositive={d.pendingReviews === 0}
          subtitle={`${d.totalReviews} Approved Reviews`}
          variant="success"
        />
      </div>

      {/* Main Grid: Quick Actions + Messages + Recent Posts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Messages & Recent Posts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Client Messages */}
          <div className="rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e9e7f0] pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-[#14121f]">
                    Recent Client Inquiries
                  </h2>
                  <p className="text-[11px] text-[#767287]">Latest contact form submissions</p>
                </div>
              </div>
              <Link
                href="/admin/messages"
                className="flex items-center gap-1 text-xs font-bold text-[#14121f] hover:text-lime-ink"
              >
                View Inbox <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <ul className="mt-4 divide-y divide-[#e9e7f0]">
              {d.recentMessages.length === 0 && (
                <li className="py-8 text-center text-xs text-[#767287]">
                  No client messages received yet.
                </li>
              )}
              {d.recentMessages.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        m.status === "NEW" ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                      }`}
                    />
                    <div>
                      <Link
                        href={`/admin/messages`}
                        className="text-xs font-bold text-[#14121f] hover:text-lime-ink"
                      >
                        {m.name}
                      </Link>
                      <p className="text-[11px] text-[#767287]">
                        {m.email} {m.service ? `• ${m.service}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="font-mono text-[10px] text-[#767287]">
                      {formatDateShort(m.createdAt)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                        m.status === "NEW"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-[#f8f7fb] text-[#4a4756]"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Posts & Drafts */}
          <div className="rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e9e7f0] pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <BookOpen className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-[#14121f]">
                    Recent Articles & Content
                  </h2>
                  <p className="text-[11px] text-[#767287]">Latest blog posts and publication state</p>
                </div>
              </div>
              <Link
                href="/admin/blog"
                className="flex items-center gap-1 text-xs font-bold text-[#14121f] hover:text-lime-ink"
              >
                All Articles <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <ul className="mt-4 divide-y divide-[#e9e7f0]">
              {d.recentPosts.length === 0 && (
                <li className="py-8 text-center text-xs text-[#767287]">No blog posts published.</li>
              )}
              {d.recentPosts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3.5">
                  <div>
                    <Link
                      href={`/admin/blog/${p.id}`}
                      className="text-xs font-bold text-[#14121f] hover:text-lime-ink line-clamp-1"
                    >
                      {p.title}
                    </Link>
                    <p className="text-[11px] text-[#767287]">By {p.author}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                      p.isPublished
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right 1 Column: Quick Actions & System Health */}
        <div className="space-y-6">
          {/* Executive Quick Actions */}
          <div className="rounded-2xl border border-[#e9e7f0] bg-[#14121f] p-6 text-white shadow-xl">
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-[#6D3BF5] border-b border-white/10 pb-3">
              Quick Studio Actions
            </h3>

            <div className="mt-4 space-y-2">
              {[
                { label: "Publish Blog Article", href: "/admin/blog/new", icon: BookOpen },
                { label: "Add Portfolio Project", href: "/admin/portfolio/new", icon: Briefcase },
                { label: "Create Service Offering", href: "/admin/services/new", icon: Layers },
                { label: "Add Team Member", href: "/admin/team/new", icon: Users },
                { label: "Review Client Messages", href: "/admin/messages", icon: MessageSquare },
                { label: "Update Site Settings", href: "/admin/settings", icon: Sparkles },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-xs font-semibold text-white/90 hover:bg-[#6D3BF5] hover:text-white transition group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-[#6D3BF5] group-hover:text-black transition" />
                      {item.label}
                    </span>
                    <Plus className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* System Status & Health */}
          <div className="rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e9e7f0] pb-3">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-[#14121f]">
                System Infrastructure
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Operational
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#767287]">Database Status</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#767287]">Next.js API Engine</span>
                <span className="font-semibold text-[#14121f]">v15.1.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#767287]">Team Members</span>
                <span className="font-semibold text-[#14121f]">{d.team} Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#767287]">Security Auth</span>
                <span className="font-semibold text-[#14121f] flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> NextAuth v5
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

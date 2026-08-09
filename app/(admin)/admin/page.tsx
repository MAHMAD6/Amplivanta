import { Layers, Briefcase, BookOpen, MessageSquare, Star } from "lucide-react";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/admin/StatsCard";
import { formatDateShort } from "@/lib/utils";

async function getCounts() {
  try {
    const [services, portfolio, posts, newMessages, pendingReviews, recentMessages, recentPosts] =
      await Promise.all([
        db.service.count(),
        db.portfolio.count(),
        db.blogPost.count(),
        db.contact.count({ where: { status: "NEW" } }),
        db.review.count({ where: { isApproved: false } }),
        db.contact.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
        db.blogPost.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      ]);
    return { services, portfolio, posts, newMessages, pendingReviews, recentMessages, recentPosts, ok: true };
  } catch {
    return {
      services: 0,
      portfolio: 0,
      posts: 0,
      newMessages: 0,
      pendingReviews: 0,
      recentMessages: [] as Awaited<ReturnType<typeof db.contact.findMany>>,
      recentPosts: [] as Awaited<ReturnType<typeof db.blogPost.findMany>>,
      ok: false,
    };
  }
}

export default async function AdminDashboard() {
  const c = await getCounts();

  return (
    <div className="space-y-8">
      {!c.ok && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Database not connected yet. Start it with <code className="font-mono">docker compose up -d</code>,
          then run <code className="font-mono">npm run db:push</code> and <code className="font-mono">npm run db:seed</code>.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Services" value={c.services} icon={Layers} />
        <StatsCard title="Case Studies" value={c.portfolio} icon={Briefcase} />
        <StatsCard title="Blog Posts" value={c.posts} icon={BookOpen} />
        <StatsCard title="New Messages" value={c.newMessages} icon={MessageSquare} variant="warning" />
        <StatsCard title="Pending Reviews" value={c.pendingReviews} icon={Star} variant="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E3E3E3] bg-white p-6">
          <h2 className="font-display text-lg font-bold text-[#0A0A0A]">Recent Messages</h2>
          <ul className="mt-4 divide-y divide-[#E3E3E3]">
            {c.recentMessages.length === 0 && <li className="py-3 text-sm text-[#9A9A9A]">No messages yet.</li>}
            {c.recentMessages.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[#0A0A0A]">{m.name}</p>
                  <p className="text-xs text-[#9A9A9A]">{m.email}</p>
                </div>
                <span className="text-xs text-[#9A9A9A]">{formatDateShort(m.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#E3E3E3] bg-white p-6">
          <h2 className="font-display text-lg font-bold text-[#0A0A0A]">Recent Posts</h2>
          <ul className="mt-4 divide-y divide-[#E3E3E3]">
            {c.recentPosts.length === 0 && <li className="py-3 text-sm text-[#9A9A9A]">No posts yet.</li>}
            {c.recentPosts.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <p className="text-sm font-medium text-[#0A0A0A]">{p.title}</p>
                <span className="text-xs text-[#9A9A9A]">{p.isPublished ? "Published" : "Draft"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

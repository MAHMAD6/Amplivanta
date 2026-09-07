import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = { title: "Blog" };

const posts = BLOG_POSTS;

export default function BlogIndex() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet">Blog</span>
          <h1 className="mt-4 font-display text-5xl font-extrabold text-ink">Playbooks for growth operators.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-soft">Opinionated writing on marketing, growth, and the AI-native stack.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-violet/30 hover:shadow-card-lg">
              <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-violet/20 via-fuchsia-200/60 to-orange-brand/25" />
              <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-violet">
                {p.tag} · <span className="text-ink-muted">{p.date}</span>
              </div>
              <h3 className="mt-2 text-[16px] font-bold leading-snug text-ink">{p.title}</h3>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{p.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-violet">
                Read <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

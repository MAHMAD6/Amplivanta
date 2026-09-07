import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";
import { BLOG_POSTS, BLOG_POST_BY_SLUG } from "@/lib/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POST_BY_SLUG.get(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Amplivanta`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POST_BY_SLUG.get(slug);
  if (!post) notFound();

  const more = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="bg-white py-12">
      <div className="mx-auto max-w-[820px] px-4 lg:px-8">
        <MarketingBreadcrumb items={[["Home", "/"], ["Blog", "/blog"], [post.title, null]]} />

        <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-violet">
          {post.tag}
          <span className="text-ink-muted">· {post.date} · {post.readMinutes} min read</span>
        </div>

        <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">{post.intro}</p>
        <p className="mt-6 border-t border-line pt-4 text-[13px] font-semibold text-ink-muted">
          By {post.author}
        </p>

        <div className="mt-10 space-y-10">
          {post.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-2xl font-extrabold text-ink">{s.heading}</h2>
              <div className="mt-4 space-y-4 text-[15.5px] leading-relaxed text-ink-soft">
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {s.bullets && (
                <ul className="mt-4 space-y-2.5">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-line bg-bg-soft p-7">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Put this into practice with Amplivanta.
          </h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
            Strategy, automation, analytics and creative in one platform — so the loop you design is
            the loop you can actually measure.
          </p>
          <Link
            href="/demo"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-violet px-5 text-[14px] font-bold text-white transition hover:opacity-90"
          >
            Book a demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14">
          <h2 className="font-display text-2xl font-extrabold text-ink">Keep reading</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {more.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-violet/30 hover:shadow-card-lg"
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-violet">{p.tag}</div>
                <h3 className="mt-2 text-[15px] font-bold leading-snug text-ink">{p.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-violet">
                  Read <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

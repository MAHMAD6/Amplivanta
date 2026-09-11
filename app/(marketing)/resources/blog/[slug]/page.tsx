import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import { Card, CardGrid, Crumb, Eyebrow, InfoCard, Section } from "@/components/marketing/site-ui";
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
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

/** Blog article, on the reference's Blog Article template. */
export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POST_BY_SLUG.get(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <Crumb items={["Home", "Resources", "Blog", "Article"]} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <Eyebrow>BLOG ARTICLE · {post.tag.toUpperCase()}</Eyebrow>
          <h1 className="m-0 mb-4 text-[32px] font-extrabold leading-[1.08] tracking-[-1.2px] text-site-ink sm:text-[42px]">
            {post.title}
          </h1>
          <p className="m-0 text-[17px] leading-[1.6] text-site-muted">{post.intro}</p>
          <p className="mt-5 border-t border-site-line pt-4 text-[13px] font-semibold text-site-muted">
            {post.author} · {post.date} · {post.readMinutes} min read
          </p>

          <div className="mt-8 space-y-9">
            {post.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="m-0 text-[24px] font-extrabold tracking-[-0.5px] text-site-ink">{s.heading}</h2>
                <div className="mt-3.5 space-y-4 text-[15.5px] leading-[1.7] text-[#2E3B55]">
                  {s.paragraphs.map((p, i) => (
                    <p key={i} className="m-0">{p}</p>
                  ))}
                </div>
                {s.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-[15px] leading-[1.6] text-[#2E3B55]">
                        <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-site-purple" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>

        <aside className="h-fit space-y-4 lg:sticky lg:top-6">
          <InfoCard title="Article details">
            <ul>
              <li>Topic: {post.tag}</li>
              <li>Author: {post.author}</li>
              <li>Published: {post.date}</li>
              <li>Reading time: {post.readMinutes} min</li>
            </ul>
          </InfoCard>
          <div className="rounded-[15px] border border-[#E5E7F5] bg-gradient-to-br from-[#F8FAFF] to-[#F1EEFF] p-5">
            <h3 className="m-0 mb-2 text-[16px] font-extrabold text-site-ink">Put this into practice</h3>
            <p className="m-0 mb-4 text-[13px] leading-[1.5] text-site-muted">
              Plan, create, execute and measure in one connected workspace.
            </p>
            <div className="flex flex-col gap-2">
              <Link className={`${btnPrimary} px-4 py-[11px] text-[13px]`} href="/signup">Start Engineering Growth</Link>
              <Link className={`${btn} px-4 py-[11px] text-[13px]`} href="/resources/blog">All articles</Link>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <Section title="Related articles">
          <CardGrid cols={3}>
            {related.map((p) => (
              <Card key={p.slug} title={p.title} link={{ label: "Read", href: `/resources/blog/${p.slug}` }}>
                {p.excerpt}
              </Card>
            ))}
          </CardGrid>
        </Section>
      )}
    </>
  );
}

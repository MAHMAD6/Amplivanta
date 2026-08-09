import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ScrollProgress } from "@/components/shared/ScrollProgress";
import { BlogCard } from "@/components/shared/BlogCard";
import { getPosts, getPostBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return { title: post.title, description: post.excerpt };
}

function readTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const all = await getPosts();
  const related = all.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <ScrollProgress />

      {/* Cover */}
      <section className="relative flex h-[42vh] min-h-[320px] items-end overflow-hidden bg-[#1A3C2B] px-4 sm:px-6 lg:px-8">
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative mx-auto w-full max-w-4xl pb-10">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-[#B5FF2D] px-3 py-1 text-xs font-semibold text-black">
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-white/70">
            {post.author} · {formatDate(post.publishedAt ?? post.createdAt)} · {readTime(post.content)} min read
          </p>
        </div>
      </section>

      {/* Body + sidebar */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_300px]">
          <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-[#E3E3E3] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">Written by</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A3C2B] text-sm font-bold text-[#B5FF2D]">
                  {post.author.charAt(0)}
                </span>
                <p className="font-semibold text-[#0A0A0A]">{post.author}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#E3E3E3] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">Share</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5A5A5A] hover:text-[#0A0A0A]"
                >
                  Share on Twitter
                </a>
                <a
                  href="https://www.linkedin.com/sharing/share-offsite/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5A5A5A] hover:text-[#0A0A0A]"
                >
                  Share on LinkedIn
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related */}
      <section className="bg-[#F4F4F4] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">Related Articles</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {related.map((p) => (
              <BlogCard
                key={p.id}
                title={p.title}
                excerpt={p.excerpt}
                coverImage={p.coverImage}
                tags={p.tags}
                publishedAt={p.publishedAt ?? p.createdAt}
                author={p.author}
                href={`/blog/${p.slug}`}
              />
            ))}
          </div>
          <div className="mt-10">
            <Link href="/blog" className="text-sm font-semibold text-[#0A0A0A] hover:text-[#8fd620]">
              ← Back to all articles
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

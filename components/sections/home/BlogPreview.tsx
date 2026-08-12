import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { BlogCard } from "@/components/shared/BlogCard";
import type { BlogPost } from "@/types";

export function BlogPreview({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="bg-[#f8f7fb] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <SectionLabel label="Latest Insights" variant="lime" />
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-[#14121f] md:text-5xl">
            Latest Industry Trends & Growth{" "}
            <span className="relative inline-block px-1">
              <span className="relative z-10 text-[#14121f]">Playbooks</span>
              <span className="absolute bottom-1.5 left-0 h-3.5 w-full bg-[#6D3BF5] -z-0 rounded-sm" />
            </span>
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 0.1}>
              <BlogCard
                title={post.title}
                excerpt={post.excerpt}
                coverImage={post.coverImage}
                tags={post.tags}
                publishedAt={post.publishedAt ?? post.createdAt}
                author={post.author}
                href={`/blog/${post.slug}`}
              />
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-[#14121f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#26233a]"
          >
            View All Posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

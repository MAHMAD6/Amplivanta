import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { BlogCard } from "@/components/shared/BlogCard";
import type { BlogPost } from "@/types";

export function BlogPreview({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="bg-[#F4F4F4] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <SectionLabel label="Blog" variant="lime" />
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-[#0A0A0A] md:text-5xl">
            Latest from Our <span className="text-[#B5FF2D]">Blog</span>
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              title={post.title}
              excerpt={post.excerpt}
              coverImage={post.coverImage}
              tags={post.tags}
              publishedAt={post.publishedAt ?? post.createdAt}
              author={post.author}
              href={`/blog/${post.slug}`}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-[#0A0A0A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1A1A1A]"
          >
            View All Posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

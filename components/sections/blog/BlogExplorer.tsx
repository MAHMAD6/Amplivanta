"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BlogCard } from "@/components/shared/BlogCard";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types";

const CATEGORIES = ["All", "SEO", "Social Media", "Content", "Strategy", "Tools"];

export function BlogExplorer({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchQuery =
        query === "" ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(query.toLowerCase());
      const matchCat = category === "All" || p.tags.includes(category);
      return matchQuery && matchCat;
    });
  }, [posts, query, category]);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9A9A]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-full border border-[#E3E3E3] bg-[#F4F4F4] py-3 pl-11 pr-4 text-sm focus:border-[#B5FF2D] focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  category === c
                    ? "bg-[#B5FF2D] text-black"
                    : "border border-[#E3E3E3] text-[#5A5A5A] hover:bg-[#F4F4F4]"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm text-[#9A9A9A]">
          Showing {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
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

        {filtered.length === 0 && (
          <p className="py-16 text-center text-[#9A9A9A]">No articles found. Try a different search.</p>
        )}
      </div>
    </section>
  );
}

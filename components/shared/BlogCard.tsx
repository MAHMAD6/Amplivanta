import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  title: string;
  excerpt: string;
  coverImage?: string | null;
  tags: string[];
  publishedAt: Date | string;
  author: string;
  href: string;
  featured?: boolean;
}

export function BlogCard({
  title,
  excerpt,
  coverImage,
  tags,
  publishedAt,
  author,
  href,
  featured = false,
}: BlogCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group overflow-hidden rounded-2xl border border-[#e9e7f0] bg-white transition-shadow hover:shadow-xl",
        featured ? "grid md:grid-cols-2" : "flex flex-col"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-[#0d0b18] to-[#0d0b18]",
          featured ? "min-h-[240px]" : "aspect-video"
        )}
      >
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6">
            <span className="font-display text-lg font-bold text-[#6D3BF5]/70">{tags[0] ?? "Article"}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#f8f7fb] px-3 py-1 text-xs font-semibold text-[#14121f]">
              {tag}
            </span>
          ))}
        </div>
        <h3 className={cn("font-display font-bold text-[#14121f]", featured ? "text-2xl" : "text-lg")}>
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-[#4a4756]">{excerpt}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[#767287]">
            {author} · {formatDateShort(publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#6D3BF5]">
            Read More <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

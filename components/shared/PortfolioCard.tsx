"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface PortfolioCardProps {
  title: string;
  client: string;
  description: string;
  coverImage?: string | null;
  tags: string[];
  href: string;
  index?: number;
}

export function PortfolioCard({
  title,
  client,
  description,
  coverImage,
  tags,
  href,
  index = 0,
}: PortfolioCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        href={href}
        className="group block overflow-hidden rounded-3xl border border-[#e9e7f0] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#0d0b18]/30 hover:shadow-xl"
      >
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#0d0b18] to-[#0d0b18]">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-2xl font-bold text-[#6D3BF5]/80">{client}</span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#6D3BF5] px-3 py-1 text-xs font-semibold text-white"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#767287]">{client}</p>
          <h3 className="mt-1 font-display text-xl font-bold text-[#14121f]">{title}</h3>
          <p className="mt-2 text-sm text-[#4a4756]">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
}

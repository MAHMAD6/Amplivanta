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
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        href={href}
        className="group block overflow-hidden rounded-3xl border border-[#E3E3E3] bg-white transition-shadow hover:shadow-xl"
      >
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#1A3C2B] to-[#0F2A1D]">
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
              <span className="font-display text-2xl font-bold text-[#B5FF2D]/80">{client}</span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#B5FF2D] px-3 py-1 text-xs font-semibold text-black"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">{client}</p>
          <h3 className="mt-1 font-display text-xl font-bold text-[#0A0A0A]">{title}</h3>
          <p className="mt-2 text-sm text-[#5A5A5A]">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
}

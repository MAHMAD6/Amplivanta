"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  index?: number;
}

const TILES = ["ic-violet", "ic-pink", "ic-green", "ic-amber", "ic-blue", "ic-indigo", "ic-magenta", "ic-teal"];

export function ServiceCard({ title, description, icon, href, index = 0 }: ServiceCardProps) {
  const tile = TILES[index % TILES.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        href={href}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#e9e7f0] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#e3ddf5] hover:shadow-[0_16px_34px_-18px_rgba(30,20,60,0.25)]"
      >
        <div className="flex flex-1 flex-col p-7">
          {/* Gradient icon tile + number */}
          <div className="flex items-center justify-between">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-transform duration-300 group-hover:scale-105 ${tile}`}>
              <span>{icon}</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#e9e7f0] transition-colors group-hover:text-[#6D3BF5]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <h3 className="mt-6 font-display text-xl font-bold text-[#14121f]">{title}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-[#767287]">{description}</p>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#6D3BF5]">
            Explore service
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

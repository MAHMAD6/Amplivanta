"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  index?: number;
}

export function ServiceCard({ title, description, icon, href, index = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={href}
        className="group relative flex h-full flex-col rounded-2xl border border-[#E3E3E3] bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#B5FF2D] text-2xl">
          {icon}
        </div>
        <h3 className="font-display text-xl font-bold text-[#0A0A0A]">{title}</h3>
        <p className="mt-3 flex-1 text-[#5A5A5A]">{description}</p>
        <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#0A0A0A]">
          Learn more
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </Link>
    </motion.div>
  );
}

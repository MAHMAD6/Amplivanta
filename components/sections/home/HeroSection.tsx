"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { SERVICES_LIST } from "@/lib/constants";
import { SITE_IMAGES, MOCK_REVIEWS } from "@/lib/mock-data";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function HeroSection() {
  const avatars = MOCK_REVIEWS.slice(0, 4);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      {/* animated background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#B5FF2D]/25 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#1A3C2B]/10 blur-3xl"
        />
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-center">
        {/* Left */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E3E3E3] bg-white/70 px-4 py-1.5 text-sm font-medium text-[#0A0A0A] backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#8fd620]" />
            Full-service digital marketing agency
          </motion.div>

          <motion.div variants={item} className="no-scrollbar mb-6 flex gap-4 overflow-x-auto">
            {SERVICES_LIST.map((s) => (
              <span key={s.number} className="flex shrink-0 items-baseline gap-1 text-sm font-medium text-[#5A5A5A]">
                {s.label}
                <sup className="font-mono text-xs text-[#8fd620]">{s.number}</sup>
              </span>
            ))}
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-[#0A0A0A] sm:text-6xl lg:text-7xl"
          >
            Your business success{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">starts here</span>
              <span className="absolute bottom-1.5 left-0 -z-0 h-4 w-full bg-[#B5FF2D]/60" />
            </span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-md text-lg text-[#5A5A5A]">
            Grow your client base with Amplivanta and targeted strategies that turn attention into revenue.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-[#B5FF2D] px-7 py-3.5 font-semibold text-black shadow-lg shadow-[#B5FF2D]/30 transition-all hover:-translate-y-0.5 hover:bg-[#a0e828] hover:shadow-xl"
            >
              Get a Free Proposal
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-[#0A0A0A]/15 bg-white/60 px-7 py-3.5 font-semibold text-[#0A0A0A] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#0A0A0A]/30"
            >
              See Our Work
            </Link>
          </motion.div>

          {/* social proof */}
          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-5">
            <div className="flex -space-x-3">
              {avatars.map((r) => (
                <Image
                  key={r.id}
                  src={r.avatar as string}
                  alt={r.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#B5FF2D] text-[#B5FF2D]" />
                ))}
                <span className="ml-1 text-sm font-bold text-[#0A0A0A]">4.9/5</span>
              </div>
              <p className="text-xs text-[#5A5A5A]">Trusted by 50+ growing brands</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#1A3C2B] shadow-2xl">
            <Image
              src={SITE_IMAGES.hero}
              alt="Marketing team collaborating"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Floating card bottom-left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute -bottom-6 -left-4 w-56 rounded-2xl border border-[#E3E3E3] bg-white/95 p-4 shadow-xl backdrop-blur"
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#B5FF2D] text-[#B5FF2D]" />
                ))}
              </div>
              <span className="font-mono text-sm font-bold">9.6</span>
            </div>
            <p className="mt-2 text-xs text-[#5A5A5A]">
              Creating impactful digital experiences for your business!
            </p>
          </motion.div>

          {/* Floating card top-right */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="absolute -right-2 top-8 w-44 rounded-2xl bg-[#B5FF2D] p-4 shadow-xl"
          >
            <TrendingUp className="h-5 w-5 text-black" />
            <p className="mt-2 font-display text-2xl font-bold text-black">$150B+</p>
            <p className="text-xs font-medium text-black/70">Case results driven for our clients</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

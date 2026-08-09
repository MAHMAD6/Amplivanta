import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#1A3C2B] px-8 py-20 text-center">
        {/* decorative accents */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#B5FF2D]/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-[#B5FF2D]/15 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#B5FF2D 1px, transparent 1px), linear-gradient(90deg, #B5FF2D 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative">
          <span className="inline-block rounded-full bg-[#B5FF2D]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#B5FF2D]">
            Let&apos;s grow together
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-bold leading-tight text-white md:text-5xl">
            Ready to grow your business?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Get a free, no-obligation strategy proposal tailored to your goals — usually within 24 hours.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-[#B5FF2D] px-8 py-4 font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#a0e828]"
            >
              Get in Touch
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 font-semibold text-white transition-all hover:bg-white/10"
            >
              View Case Studies
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/50">No lock-in contracts · Cancel anytime · Results-first</p>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { SITE_IMAGES } from "@/lib/mock-data";

const MINI_STATS = [
  { value: "172+", label: "Active Campaigns" },
  { value: "283%", label: "Avg Traffic Surge" },
  { value: "453+", label: "Projects Delivered" },
];

export function AboutBanner() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="grid gap-8 rounded-[2.5rem] bg-[#0d0b18] p-6 sm:p-8 md:p-12 lg:grid-cols-[1fr_1.2fr_1fr] items-center">
            {/* image */}
            <div className="relative h-56 sm:h-64 lg:h-full min-h-[220px] overflow-hidden rounded-2xl bg-[#0d0b18]">
              <Image
                src={SITE_IMAGES.aboutBanner}
                alt="Modern agency office"
                fill
                sizes="(max-width: 1024px) 100vw, 25vw"
                className="object-cover"
              />
            </div>

            {/* middle */}
            <div className="flex flex-col justify-center">
              <SectionLabel label="About Us" variant="dark" />
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white md:text-4xl">
                Maximize Your Growth with Our{" "}
                <span className="text-[#6D3BF5]">Expert Digital Marketing</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/80">
                We combine data-backed strategy, high-converting creative, and precision marketing to help your business scale predictably across every digital channel.
              </p>
            </div>

            {/* right card */}
            <div className="flex flex-col justify-center rounded-2xl bg-white p-6 sm:p-7 shadow-xl">
              <h3 className="font-display text-xl font-extrabold text-[#14121f]">Your Growth Partner</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#4a4756]">
                Measurable metrics and transparent performance delivered across every campaign.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {MINI_STATS.map((s) => (
                  <div key={s.label}>
                    <p className="font-mono text-lg sm:text-xl font-bold text-[#14121f]">{s.value}</p>
                    <p className="mt-1 text-[11px] font-medium leading-tight text-[#6A6A6A]">{s.label}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/about"
                className="mt-6 inline-block rounded-full bg-[#6D3BF5] px-5 py-3 text-center text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#5B2FE0] shadow-md shadow-[#6D3BF5]/20"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

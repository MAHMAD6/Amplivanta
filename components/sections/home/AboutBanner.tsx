import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { SITE_IMAGES } from "@/lib/mock-data";

const MINI_STATS = [
  { value: "172+", label: "Drive Engagement" },
  { value: "283+", label: "Digital Presence" },
  { value: "453+", label: "Creating Impactful" },
];

export function AboutBanner() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="grid gap-8 rounded-3xl bg-[#1A3C2B] p-8 md:p-12 lg:grid-cols-[1fr_1.2fr_1fr]">
            {/* image */}
            <div className="relative hidden min-h-[220px] overflow-hidden rounded-2xl bg-[#0F2A1D] lg:block">
              <Image
                src={SITE_IMAGES.aboutBanner}
                alt="Modern agency office"
                fill
                sizes="(max-width: 1024px) 0px, 25vw"
                className="object-cover"
              />
            </div>

            {/* middle */}
            <div className="flex flex-col justify-center">
              <SectionLabel label="About Us" variant="dark" />
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white md:text-4xl">
                Maximize Your Growth with Our{" "}
                <span className="text-[#B5FF2D]">Expert Digital Marketing</span>
              </h2>
              <p className="mt-4 text-white/70">
                We combine strategy, creativity, and data to help your business stand out and scale.
                Every campaign is built around measurable results.
              </p>
            </div>

            {/* right card */}
            <div className="flex flex-col justify-center rounded-2xl bg-white p-6">
              <h3 className="font-display text-lg font-bold text-[#0A0A0A]">Success Our Priority</h3>
              <p className="mt-2 text-sm text-[#5A5A5A]">
                Results that speak for themselves across every channel we manage.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {MINI_STATS.map((s) => (
                  <div key={s.label}>
                    <p className="font-mono text-xl font-bold text-[#0A0A0A]">{s.value}</p>
                    <p className="mt-1 text-[10px] leading-tight text-[#9A9A9A]">{s.label}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/about"
                className="mt-6 inline-block rounded-full bg-[#B5FF2D] px-5 py-2.5 text-center text-sm font-semibold text-black transition hover:bg-[#a0e828]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

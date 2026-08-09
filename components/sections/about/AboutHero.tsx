import Image from "next/image";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { SITE_IMAGES } from "@/lib/mock-data";

const POINTS = [
  { n: "1", title: "Customized Strategies", desc: "Plans built around your specific goals, not templates." },
  { n: "2", title: "Experienced Team", desc: "Specialists across every marketing discipline." },
  { n: "3", title: "Client-Centric Approach", desc: "Transparent reporting and a partnership mindset." },
];

export function AboutHero() {
  return (
    <section className="px-4 pt-36 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
        <ScrollReveal>
          <SectionLabel label="About Us" variant="lime" />
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-[#0A0A0A] md:text-5xl">
            Maximize Your Growth with Our <span className="text-[#B5FF2D]">Digital Marketing</span>
          </h1>
          <p className="mt-4 text-lg text-[#5A5A5A]">
            We&apos;re a team of strategists, creatives, and analysts obsessed with helping brands grow.
            Here&apos;s what sets us apart.
          </p>
          <div className="mt-8 space-y-6">
            {POINTS.map((p) => (
              <div key={p.n} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B5FF2D] font-mono text-sm font-bold text-black">
                  {p.n}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#0A0A0A]">{p.title}</h3>
                  <p className="mt-1 text-sm text-[#5A5A5A]">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="left">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#1A3C2B]">
            <Image
              src={SITE_IMAGES.aboutMain}
              alt="Amplivanta team collaborating"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

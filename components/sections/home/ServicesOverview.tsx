import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { HOME_FEATURES, SITE_IMAGES } from "@/lib/mock-data";

export function ServicesOverview() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* top split */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <ScrollReveal>
            <SectionLabel label="Our Services" variant="lime" />
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-[#0A0A0A] md:text-5xl">
              Tailored Strategies for <span className="text-[#B5FF2D]">Maximum Business Growth</span>
            </h2>
            <p className="mt-4 text-lg text-[#5A5A5A]">
              From social media to SEO, we build integrated campaigns that move the metrics that matter.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <p className="font-mono text-3xl font-bold text-[#0A0A0A]">98%</p>
                <p className="mt-1 text-sm text-[#5A5A5A]">Client Retention Rate</p>
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-[#0A0A0A]">4.9/5</p>
                <p className="mt-1 text-sm text-[#5A5A5A]">Average Client Rating</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#1A3C2B]">
              <Image
                src={SITE_IMAGES.servicesShowcase}
                alt="Team working on marketing strategy"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-6 left-6 rounded-full bg-[#B5FF2D] px-4 py-2 text-sm font-semibold text-black">
                Data-Driven Growth
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* stand out dark section */}
        <ScrollReveal className="mt-20">
          <div className="rounded-3xl bg-[#1A3C2B] p-8 md:p-12">
            <SectionLabel label="Featured" variant="dark" />
            <h3 className="mt-3 max-w-2xl font-display text-3xl font-bold text-white md:text-4xl">
              What Makes Our Digital Marketing Agency Stand Out?
            </h3>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {HOME_FEATURES.map((f, i) => (
                <div key={f.title} className="rounded-2xl border border-[#2A4A38] bg-[#0F2A1D] p-6">
                  <span className="font-mono text-sm text-[#B5FF2D]">0{i + 1}</span>
                  <h4 className="mt-3 font-display text-lg font-bold text-white">{f.title}</h4>
                  <p className="mt-2 text-sm text-white/70">{f.description}</p>
                </div>
              ))}
            </div>
            <Link
              href="/services"
              className="mt-10 inline-block rounded-full bg-[#B5FF2D] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#a0e828]"
            >
              Explore All Services
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

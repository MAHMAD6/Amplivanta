import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import type { Service } from "@/types";

const PROCESS = [
  { step: "01", title: "Discovery", desc: "We learn your business, audience, and goals." },
  { step: "02", title: "Strategy", desc: "We craft a tailored, data-backed plan." },
  { step: "03", title: "Execution", desc: "We launch, manage, and optimize campaigns." },
  { step: "04", title: "Results", desc: "We measure, report, and scale what works." },
];

export function ServiceDetail({ service }: { service: Service }) {
  return (
    <>
      <PageHero
        eyebrow={`${service.icon} Service`}
        title={service.title}
        description={service.description}
        dark
      />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <ScrollReveal>
            {service.image && (
              <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl bg-[#1A3C2B]">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
            <h2 className="font-display text-3xl font-bold text-[#0A0A0A]">Overview</h2>
            <p className="mt-4 text-lg text-[#5A5A5A]">{service.longDesc}</p>
          </ScrollReveal>

          <ScrollReveal direction="left">
            <div className="rounded-2xl border border-[#E3E3E3] bg-white p-8">
              <h3 className="font-display text-xl font-bold text-[#0A0A0A]">What&apos;s Included</h3>
              <ul className="mt-6 space-y-4">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B5FF2D]">
                      <Check className="h-4 w-4 text-black" />
                    </span>
                    <span className="text-[#0A0A0A]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-[#F4F4F4] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="text-center font-display text-4xl font-bold text-[#0A0A0A]">Our Process</h2>
          </ScrollReveal>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {PROCESS.map((p, i) => (
              <ScrollReveal key={p.step} delay={i * 0.1}>
                <div className="rounded-2xl border border-[#E3E3E3] bg-white p-6">
                  <span className="font-mono text-3xl font-bold text-[#B5FF2D]">{p.step}</span>
                  <h3 className="mt-3 font-display text-lg font-bold text-[#0A0A0A]">{p.title}</h3>
                  <p className="mt-2 text-sm text-[#5A5A5A]">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-[#0A0A0A] px-8 py-4 font-semibold text-white transition hover:bg-[#1A1A1A]"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

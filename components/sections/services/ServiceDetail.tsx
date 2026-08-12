import Link from "next/link";
import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import type { Service } from "@/types";

const PROCESS = [
  {
    step: "01",
    title: "Discovery",
    desc: "We learn your business, audience, and goals through deep research and stakeholder interviews.",
  },
  {
    step: "02",
    title: "Strategy",
    desc: "We craft a tailored, data-backed plan with clear milestones and KPIs.",
  },
  {
    step: "03",
    title: "Execution",
    desc: "We launch, manage, and continuously optimize campaigns across channels.",
  },
  {
    step: "04",
    title: "Results",
    desc: "We measure impact, report transparently, and scale what works.",
  },
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

      {/* Overview + Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-start">
          <ScrollReveal>
            <div>
              {service.image && (
                <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-[#0d0b18] shadow-lg">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              <SectionLabel label="Overview" variant="lime" />
              <h2 className="mt-4 font-display text-3xl font-bold text-[#14121f]">
                What this service delivers
              </h2>
              <p className="mt-4 text-[#4a4756] leading-relaxed">{service.longDesc}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left">
            <div className="rounded-2xl border border-[#e9e7f0] bg-white p-8 shadow-sm lg:sticky lg:top-28">
              <h3 className="font-display text-xl font-bold text-[#14121f]">
                What&apos;s Included
              </h3>
              <p className="mt-2 text-sm text-[#4a4756]">
                Every engagement includes these deliverables
              </p>
              <ul className="mt-6 space-y-3">
                {service.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-[#e9e7f0] hover:bg-[#f8f7fb]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0d0b18]">
                      <Check className="h-3 w-3 text-[#6D3BF5]" />
                    </span>
                    <span className="text-sm font-medium text-[#14121f]">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#14121f] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0d0b18]"
              >
                Get a Proposal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[#f8f7fb] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="text-center">
              <SectionLabel label="How It Works" variant="lime" />
              <h2 className="mt-4 font-display text-3xl font-bold text-[#14121f] md:text-4xl">
                Our Process
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-[#4a4756]">
                A proven four-step framework that turns strategy into measurable results.
              </p>
            </div>
          </ScrollReveal>

          <div className="relative mt-14 grid gap-6 md:grid-cols-4">
            {/* Connecting line */}
            <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-[#e9e7f0] md:block" />

            {PROCESS.map((p, i) => (
              <ScrollReveal key={p.step} delay={i * 0.1}>
                <div className="group relative rounded-2xl border border-[#e9e7f0] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#0d0b18]/30 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-bold text-[#e9e7f0] transition-colors group-hover:text-[#0d0b18]">
                      {p.step}
                    </span>
                    <div className="relative z-10 h-3 w-3 rounded-full border-2 border-[#e9e7f0] bg-white transition-colors group-hover:border-[#6D3BF5] group-hover:bg-[#6D3BF5]" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-[#14121f]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#4a4756] leading-relaxed">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="mt-14 text-center">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-[#14121f] px-8 py-4 font-semibold text-white transition-colors hover:bg-[#0d0b18]"
              >
                Start Your Project
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

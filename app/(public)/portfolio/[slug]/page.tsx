import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { getPortfolio, getPortfolioBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const items = await getPortfolio();
  return items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);
  if (!item) return { title: "Case Study Not Found" };
  return { title: item.title, description: item.description };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);
  if (!item) notFound();

  const all = await getPortfolio();
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1A3C2B] px-4 pt-36 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-[#B5FF2D] hover:underline">
            <ArrowLeft className="h-4 w-4" /> All Case Studies
          </Link>
          <div className="mt-6 flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <span key={t} className="rounded-full bg-[#B5FF2D] px-3 py-1 text-xs font-semibold text-black">
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white md:text-6xl">
            {item.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">{item.description}</p>
        </div>
      </section>

      {/* Overview */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">Client</p>
            <p className="mt-1 font-medium text-[#0A0A0A]">{item.client}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">Services</p>
            <p className="mt-1 font-medium text-[#0A0A0A]">{item.tags.join(", ")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">Date</p>
            <p className="mt-1 font-medium text-[#0A0A0A]">{formatDate(item.publishedAt)}</p>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="bg-[#F4F4F4] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold text-[#0A0A0A]">The Results</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {item.results.map((r) => (
              <ScrollReveal key={r.metric}>
                <div className="rounded-2xl border border-[#E3E3E3] bg-white p-8 text-center">
                  <p className="font-mono text-4xl font-bold text-[#0A0A0A] md:text-5xl">{r.value}</p>
                  <p className="mt-2 text-sm text-[#5A5A5A]">{r.metric}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">Overview</h2>
          <p className="mt-4 text-lg leading-relaxed text-[#5A5A5A]">{item.longDesc}</p>

          {item.coverImage && (
            <div className="relative mt-10 aspect-video overflow-hidden rounded-3xl bg-[#1A3C2B]">
              <Image
                src={item.coverImage}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* Prev / Next */}
      <section className="border-t border-[#E3E3E3] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          {prev ? (
            <Link href={`/portfolio/${prev.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0A] hover:text-[#8fd620]">
              <ArrowLeft className="h-4 w-4" /> {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/portfolio/${next.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0A] hover:text-[#8fd620]">
              {next.title} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

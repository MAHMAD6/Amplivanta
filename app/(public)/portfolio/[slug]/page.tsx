import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { ShareArticleButtons } from "@/components/shared/ShareArticleButtons";
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
      <section className="relative overflow-hidden bg-[#f8f7fb] px-4 pt-36 pb-16 sm:px-6 lg:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-[#6D3BF5]/10 blur-[110px]" />
          <div className="absolute right-0 top-16 h-64 w-64 rounded-full bg-[#E8398F]/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-5xl">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6D3BF5] hover:underline">
            <ArrowLeft className="h-4 w-4" /> All Case Studies
          </Link>
          <div className="mt-6 flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <span key={t} className="bg-grad-brand-2 rounded-full px-3 py-1 text-xs font-semibold text-white">
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-[#14121f] md:text-6xl">
            {item.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[#767287]">{item.description}</p>
        </div>
      </section>

      {/* Overview */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-4 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#767287]">Client</p>
            <p className="mt-1 font-medium text-[#14121f]">{item.client}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#767287]">Services</p>
            <p className="mt-1 font-medium text-[#14121f]">{item.tags.join(", ")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#767287]">Date</p>
            <p className="mt-1 font-medium text-[#14121f]">{formatDate(item.publishedAt)}</p>
          </div>
          <div>
            <ShareArticleButtons title={item.title} />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="bg-[#f8f7fb] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold text-[#14121f]">The Results</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {item.results.map((r) => (
              <ScrollReveal key={r.metric}>
                <div className="rounded-2xl border border-[#e9e7f0] bg-white p-8 text-center">
                  <p className="font-mono text-4xl font-bold text-[#14121f] md:text-5xl">{r.value}</p>
                  <p className="mt-2 text-sm text-[#4a4756]">{r.metric}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-[#14121f]">Overview</h2>
          <p className="mt-4 text-lg leading-relaxed text-[#4a4756]">{item.longDesc}</p>

          {item.coverImage && (
            <div className="relative mt-10 aspect-video overflow-hidden rounded-3xl bg-[#0d0b18]">
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
      <section className="border-t border-[#e9e7f0] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          {prev ? (
            <Link href={`/portfolio/${prev.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#14121f] hover:text-lime-ink">
              <ArrowLeft className="h-4 w-4" /> {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/portfolio/${next.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#14121f] hover:text-lime-ink">
              {next.title} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

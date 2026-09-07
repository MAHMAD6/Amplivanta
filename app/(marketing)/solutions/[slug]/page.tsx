import { notFound } from "next/navigation";
import { SOLUTION_PAGES } from "@/lib/marketing-modules";
import { SOLUTION_DETAIL_PAGES } from "@/lib/solution-pages";
import { MarketingPage } from "@/components/amplivanta/marketing-page";
import { SolutionPage } from "@/components/amplivanta/solution-page";
import type { Metadata } from "next";

// These two slugs have dedicated bespoke routes (solutions/crm-pipeline,
// solutions/marketing-automation) that take precedence over this dynamic route.
const EXPLICIT = new Set(["crm-pipeline", "marketing-automation"]);

export function generateStaticParams() {
  return [...Object.keys(SOLUTION_DETAIL_PAGES), ...Object.keys(SOLUTION_PAGES)]
    .filter((slug) => !EXPLICIT.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const detail = SOLUTION_DETAIL_PAGES[slug];
  if (detail) return { title: `${detail.name}`, description: detail.subtitle };
  const data = SOLUTION_PAGES[slug];
  if (!data) return {};
  return { title: `${data.eyebrow}` };
}

export default async function SolutionRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const detail = SOLUTION_DETAIL_PAGES[slug];
  if (detail) return <SolutionPage {...detail} />;

  const data = SOLUTION_PAGES[slug];
  if (!data) notFound();
  return <MarketingPage {...data} />;
}

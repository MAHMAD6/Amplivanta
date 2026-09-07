import { notFound } from "next/navigation";
import { MODULE_PAGES } from "@/lib/marketing-modules";
import { MarketingPage } from "@/components/amplivanta/marketing-page";
import type { Metadata } from "next";

export function generateStaticParams() {
  return Object.keys(MODULE_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = MODULE_PAGES[slug];
  if (!data) return {};
  return { title: `${data.eyebrow}` };
}

export default async function PlatformModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = MODULE_PAGES[slug];
  if (!data) notFound();
  return <MarketingPage {...data} />;
}

import { notFound } from "next/navigation";
import { COMPANY_PAGES } from "@/lib/marketing-modules";
import { MarketingPage } from "@/components/amplivanta/marketing-page";
import type { Metadata } from "next";

export function generateStaticParams() {
  return Object.keys(COMPANY_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = COMPANY_PAGES[slug];
  if (!data) return {};
  return { title: `${data.eyebrow}` };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = COMPANY_PAGES[slug];
  if (!data) notFound();
  return <MarketingPage {...data} />;
}

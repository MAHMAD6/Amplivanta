import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { PortfolioExplorer } from "@/components/sections/portfolio/PortfolioExplorer";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { getPortfolio } from "@/lib/data";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Real results for real brands. Explore our portfolio of digital marketing case studies.",
};

export default async function PortfolioPage() {
  const items = await getPortfolio();
  return (
    <>
      <PageHero
        eyebrow="Case Studies"
        title="Results That"
        highlight="Speak for Themselves"
        description="A selection of projects where strategy met execution — and the numbers followed."
        dark
      />
      <PortfolioExplorer items={items} />
      <CtaBanner />
    </>
  );
}

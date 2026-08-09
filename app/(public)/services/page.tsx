import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { ServicesGrid } from "@/components/sections/services/ServicesGrid";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { getServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description: "Full-service digital marketing: social media, SEO, content, video, PPC, and web design.",
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Strategies Built to"
        highlight="Drive Growth"
        description="Everything you need to grow your brand online, under one roof."
        dark
      />
      <ServicesGrid services={services} />
      <CtaBanner />
    </>
  );
}

import type { Metadata } from "next";
import { HomeHero } from "@/components/amplivanta/home-hero";
import { HomeAdvisor } from "@/components/amplivanta/home-advisor";
import { HomeCapabilities } from "@/components/amplivanta/home-capabilities";
import { HomeIndustries } from "@/components/amplivanta/home-industries";
import { HomeResources } from "@/components/amplivanta/home-resources";
import { HomeCTA } from "@/components/amplivanta/home-cta";

export const metadata: Metadata = {
  // `absolute` opts out of the root "%s | Amplivanta" template so the home tab
  // does not read the brand twice.
  title: { absolute: "Amplivanta: We Engineer Growth" },
  description:
    "Amplivanta combines AI intelligence, automation and powerful tools to help you attract, convert and retain more customers—faster.",
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeAdvisor />
      <HomeCapabilities />
      <HomeIndustries />
      <HomeResources />
      <HomeCTA />
    </>
  );
}

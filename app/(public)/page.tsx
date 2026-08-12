import { HeroSection } from "@/components/sections/home/HeroSection";
import { LogoCloud } from "@/components/sections/home/LogoCloud";
import { ServicesOverview } from "@/components/sections/home/ServicesOverview";
import { TrustBadges } from "@/components/sections/home/TrustBadges";
import { CtaBanner } from "@/components/sections/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LogoCloud />
      <ServicesOverview />
      <CtaBanner />
      <TrustBadges />
    </>
  );
}

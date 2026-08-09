import type { Metadata } from "next";
import { AboutHero } from "@/components/sections/about/AboutHero";
import { MissionSection } from "@/components/sections/about/MissionSection";
import { ValuesSection } from "@/components/sections/about/ValuesSection";
import { StatsSection } from "@/components/sections/home/StatsSection";
import { TeamSection } from "@/components/sections/about/TeamSection";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { getTeam } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet the team behind Amplivanta and learn what drives our approach to growth marketing.",
};

export default async function AboutPage() {
  const team = await getTeam();
  return (
    <>
      <AboutHero />
      <MissionSection />
      <ValuesSection />
      <StatsSection />
      <TeamSection team={team} />
      <CtaBanner />
    </>
  );
}

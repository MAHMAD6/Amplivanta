import type { Metadata } from "next";
import { AboutHero } from "@/components/sections/about/AboutHero";
import { MissionSection } from "@/components/sections/about/MissionSection";
import { PhilosophySection } from "@/components/sections/about/PhilosophySection";
import { ValuesSection } from "@/components/sections/about/ValuesSection";
import { StatsSection } from "@/components/sections/home/StatsSection";
import { TeamSection } from "@/components/sections/about/TeamSection";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { getTeam } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us | Amplivanta Digital Growth Agency",
  description: "Learn how Amplivanta combines engineering discipline, data analytics, and creative strategy to drive compound growth for modern brands.",
};

export default async function AboutPage() {
  const team = await getTeam();
  return (
    <main className="bg-white">
      <AboutHero />
      <MissionSection />
      <PhilosophySection />
      <ValuesSection />
      <StatsSection />
      <TeamSection team={team} />
      <CtaBanner />
    </main>
  );
}


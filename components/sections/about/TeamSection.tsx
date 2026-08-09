import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { TeamCard } from "@/components/shared/TeamCard";
import type { TeamMember } from "@/types";

export function TeamSection({ team }: { team: TeamMember[] }) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center">
            <SectionLabel label="Our Team" variant="lime" />
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-bold text-[#0A0A0A] md:text-5xl">
              Meet the <span className="text-[#B5FF2D]">Team</span>
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <TeamCard
              key={m.id}
              name={m.name}
              role={m.role}
              bio={m.bio}
              image={m.image}
              linkedin={m.linkedin}
              twitter={m.twitter}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

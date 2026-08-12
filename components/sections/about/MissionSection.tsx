import { ScrollReveal } from "@/components/shared/ScrollReveal";

export function MissionSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="grid gap-8 rounded-3xl bg-[#0d0b18] p-8 md:grid-cols-2 md:p-12">
            <div className="rounded-2xl border border-[#26233a] p-8">
              <span className="font-mono text-2xl font-bold text-[#6D3BF5]">01</span>
              <h2 className="mt-3 font-display text-2xl font-bold text-white">Our Mission</h2>
              <p className="mt-3 text-white/70">
                To help ambitious businesses grow through marketing that is creative, measurable, and
                relentlessly focused on results.
              </p>
            </div>
            <div className="rounded-2xl border border-[#26233a] p-8">
              <span className="font-mono text-2xl font-bold text-[#6D3BF5]">02</span>
              <h2 className="mt-3 font-display text-2xl font-bold text-white">Our Vision</h2>
              <p className="mt-3 text-white/70">
                To be the growth partner brands trust most — known for integrity, innovation, and impact
                across every channel.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

import { Eyebrow } from "./Eyebrow";
import { Highlight } from "./Highlight";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  /** kept for API compatibility; the Amplivanta system is light throughout */
  dark?: boolean;
}

export function PageHero({ eyebrow, title, highlight, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#f8f7fb] px-4 pt-36 pb-20 sm:px-6 lg:px-8">
      {/* soft brand swirl */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 -top-24 h-80 w-80 rounded-full bg-[#6D3BF5]/10 blur-[90px]" />
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#E8398F]/10 blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <Eyebrow label={eyebrow} align="center" />
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[#14121f] md:text-6xl">
          {title}
          {highlight && (
            <>
              {" "}
              <Highlight>{highlight}</Highlight>
            </>
          )}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[#767287]">{description}</p>
        )}
      </div>
    </section>
  );
}

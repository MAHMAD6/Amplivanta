const TOP_BRANDS_ROW_1 = [
  "Stripe",
  "Shopify",
  "Figma",
  "Vercel",
  "Linear",
  "Supabase",
  "Notion",
  "Intercom",
];

const TOP_BRANDS_ROW_2 = [
  "HubSpot",
  "Airtable",
  "Zapier",
  "Algolia",
  "Retool",
  "Segment",
  "Brevo",
  "PostHog",
];

function Row({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="relative flex overflow-hidden select-none py-1">
      {/* Subtle edge fade masks for smooth transition */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-[#f8f7fb]/80 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-[#f8f7fb]/80 to-transparent" />

      <div
        className={`flex shrink-0 items-center gap-14 pr-14 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
        style={{
          animationDuration: "28s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {items.concat(items).map((brand, i) => (
          <span
            key={`row1-${brand}-${i}`}
            className="whitespace-nowrap font-display text-2xl font-bold tracking-tight text-[#767287] transition-colors duration-300 hover:text-[#0d0b18]"
          >
            {brand}
          </span>
        ))}
      </div>

      <div
        aria-hidden="true"
        className={`flex shrink-0 items-center gap-14 pr-14 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
        style={{
          animationDuration: "28s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {items.concat(items).map((brand, i) => (
          <span
            key={`row2-${brand}-${i}`}
            className="whitespace-nowrap font-display text-2xl font-bold tracking-tight text-[#767287] transition-colors duration-300 hover:text-[#0d0b18]"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LogoCloud() {
  return (
    <section className="border-y border-[#e9e7f0]/80 bg-[#f8f7fb]/50 py-12">
      <div className="mb-6 text-center">
        <span className="inline-block rounded-full border border-[#e9e7f0] bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#4a4756] shadow-2xs">
          Trusted by 50+ Leading Brands & Fast-Growing Startups
        </span>
      </div>
      <div className="space-y-4">
        <Row items={TOP_BRANDS_ROW_1} />
        <Row items={TOP_BRANDS_ROW_2} reverse />
      </div>
    </section>
  );
}

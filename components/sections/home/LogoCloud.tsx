const BRANDS = ["TechCorp", "GreenLeaf", "UrbanFit", "NorthStar", "Bloom", "Stackly", "Vertex", "Lumen"];

function Row({ reverse = false }: { reverse?: boolean }) {
  const items = [...BRANDS, ...BRANDS];
  return (
    <div className="flex overflow-hidden">
      <div
        className="flex shrink-0 items-center gap-16 pr-16"
        style={{ animation: `marquee 25s linear infinite${reverse ? " reverse" : ""}` }}
      >
        {items.map((brand, i) => (
          <span
            key={`${brand}-${i}`}
            className="whitespace-nowrap font-display text-2xl font-bold text-[#9A9A9A] transition-colors hover:text-[#0A0A0A]"
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
    <section className="border-y border-[#E3E3E3] bg-white py-14">
      <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-[#9A9A9A]">
        Trusted by leading brands
      </p>
      <div className="space-y-6">
        <Row />
        <Row reverse />
      </div>
    </section>
  );
}

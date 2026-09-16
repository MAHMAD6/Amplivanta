import type { Metadata } from "next";
import Link from "next/link";
import { Circle, Image as ImageIcon, Palette, Type } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, InfoList, Pill, StatGrid, fmtInt } from "@/components/amplivanta/screen-kit";
import { BrandKitActions, BrandKitForm } from "@/components/amplivanta/creative-ui";
import { creativeContext } from "@/lib/server/creative-screens";
import { isStorageConfigured, objectUrl } from "@/lib/storage";

export const metadata: Metadata = { title: "Brand Kit — Creative Studio" };
export const dynamic = "force-dynamic";

type Fonts = { heading?: string | null; body?: string | null };

export default async function BrandKitPage({ searchParams }: { searchParams: Promise<{ kit?: string; new?: string }> }) {
  const sp = await searchParams;
  const c = await creativeContext();
  let reachable = Boolean(c);
  let kits: { id: string; name: string; primaryColor: string | null; secondaryColor: string | null; accentColor: string | null; logos: string[]; fonts: Fonts; guidelines: string | null; isDefault: boolean }[] = [];
  let images: { id: string; name: string; url: string }[] = [];
  if (c) {
    try {
      const [k, a] = await Promise.all([
        db.brandKit.findMany({ where: { workspaceId: c.workspaceId }, orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
        isStorageConfigured() ? db.asset.findMany({ where: { workspaceId: c.workspaceId, mimeType: { startsWith: "image/" } }, orderBy: { createdAt: "desc" }, take: 24, select: { id: true, name: true, fileUrl: true } }) : Promise.resolve([]),
      ]);
      kits = k.map((x) => ({ ...x, fonts: (x.fonts ?? {}) as Fonts }));
      images = await Promise.all(a.map(async (x) => ({ id: x.id, name: x.name, url: await objectUrl(x.fileUrl) })));
    } catch {
      reachable = false;
    }
  }
  const creating = sp.new === "1" || kits.length === 0;
  const selected = creating ? null : kits.find((k) => k.id === sp.kit) ?? kits[0] ?? null;
  const def = kits.find((k) => k.isDefault);
  const colors = kits.reduce((n, k) => n + [k.primaryColor, k.secondaryColor, k.accentColor].filter(Boolean).length, 0);
  const fonts = kits.reduce((n, k) => n + [k.fonts.heading, k.fonts.body].filter(Boolean).length, 0);
  const logos = kits.reduce((n, k) => n + k.logos.length, 0);

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Brand Kit</h1>
      <p className="mb-6 mt-1 text-[14.5px] text-ink-soft">Centralize brand identity for consistent creative work across the workspace.</p>
      <StatGrid
        stats={[
          { label: "Brand Kits", icon: Palette, value: kits.length ? fmtInt(kits.length) : null, hint: kits.length ? undefined : "No kits yet" },
          { label: "Logos", icon: ImageIcon, value: logos ? fmtInt(logos) : null, hint: logos ? undefined : "No logos yet" },
          { label: "Colors", icon: Circle, value: colors ? fmtInt(colors) : null, hint: colors ? undefined : "No colors yet" },
          { label: "Typography", icon: Type, value: fonts ? fmtInt(fonts) : null, hint: fonts ? undefined : "No fonts set" },
        ]}
      />
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_1fr]">
        <section className="rounded-xl border border-line bg-white p-6">
          {kits.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-line pb-4">
              {kits.map((k) => (
                <Link key={k.id} href={`/app/creative-studio/brand-kit?kit=${k.id}`} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] ${selected?.id === k.id ? "border-[#0B5CFF] bg-royal-tint text-[#0B5CFF]" : "border-line text-deep-navy"}`}>
                  <span className="h-3 w-3 rounded-full border border-line" style={{ background: k.primaryColor ?? "transparent" }} /> {k.name}
                </Link>
              ))}
              {c?.canEdit && <Link href="/app/creative-studio/brand-kit?new=1" className="rounded-full border border-dashed border-line px-3 py-1.5 text-[13px] text-[#0B5CFF]">+ New brand kit</Link>}
            </div>
          )}
          {!reachable ? (
            <EmptyState icon={Palette} title="Brand kits unavailable" body="Brand kits could not be loaded right now." />
          ) : (
            <>
              {kits.length === 0 && <EmptyState icon={Palette} compact title="No Brand Kit yet" body="Create a Brand Kit to store approved logos, colors, typography, assets, and guidelines." />}
              {selected && (
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-deep-navy">{selected.name} {selected.isDefault && <Pill tone="blue">Default</Pill>}</div>
                  <BrandKitActions id={selected.id} isDefault={selected.isDefault} canEdit={Boolean(c?.canEdit)} />
                </div>
              )}
              <BrandKitForm
                key={selected?.id ?? "new"}
                kit={selected ? { id: selected.id, name: selected.name, primaryColor: selected.primaryColor, secondaryColor: selected.secondaryColor, accentColor: selected.accentColor, heading: selected.fonts.heading ?? null, body: selected.fonts.body ?? null, guidelines: selected.guidelines, logos: selected.logos } : null}
                images={images}
                canEdit={Boolean(c?.canEdit)}
              />
            </>
          )}
        </section>
        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="mb-3 text-[16px] font-semibold text-deep-navy">Brand Kit Sections</h2>
          <InfoList
            rows={[
              { title: "Logos", body: "Primary and alternate logo assets from your image library." },
              { title: "Colors", body: "Approved brand palette: primary, secondary and accent." },
              { title: "Typography", body: "Brand font choices for headings and body text." },
              { title: "Brand Assets", body: "Reusable creative assets live in Creative Studio → Images.", href: "/app/creative-studio/images" },
              { title: "Guidelines", body: "Usage notes and rules; included when the AI Document Writer uses this kit." },
              { title: "Team Access", body: "Editors and admins can change brand kits; viewers can view them." },
            ]}
          />
        </section>
      </div>
      <section className="rounded-xl border border-line bg-white p-6">
        <h2 className="text-[16px] font-semibold text-deep-navy">Default Brand Kit</h2>
        <p className="mt-2 text-[13.5px] text-ink-soft">{def ? `${def.name} is the default brand kit for new creative work.` : "No default Brand Kit selected."}</p>
        {kits.length > 0 && <Link href={def ? `/app/creative-studio/brand-kit?kit=${def.id}` : `/app/creative-studio/brand-kit?kit=${kits[0].id}`} className="mt-3 inline-flex h-10 items-center rounded-md border border-line px-6 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft">Manage Settings</Link>}
      </section>
    </div>
  );
}

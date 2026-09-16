import { lines, safeUrl, type Block } from "@/lib/marketing/blocks";
import { LeadForm } from "@/components/amplivanta/public-marketing";
import type { FormField } from "@/lib/marketing/logic";

type FormDef = { id: string; fields: FormField[]; submitButtonText: string; requireConsent: boolean; consentText: string | null; privacyUrl: string | null; termsUrl: string | null } | null;

/** Renders landing page blocks. Text is escaped by React and links pass through safeUrl. */
export function LandingBlocks({ blocks, form, pageId, preview }: { blocks: Block[]; form: FormDef; pageId?: string; preview?: boolean }) {
  return (
    <div className="bg-white text-slate-900">
      {blocks.map((b) => {
        const p = b.props;
        const wrap = "mx-auto max-w-[1040px] px-5";
        switch (b.type) {
          case "hero":
            return (
              <section key={b.id} className="bg-gradient-to-b from-blue-50 to-white py-16">
                <div className={`${wrap} grid items-center gap-10 md:grid-cols-2`}>
                  <div>
                    <h1 className="text-[36px] font-bold leading-tight md:text-[44px]">{p.heading}</h1>
                    {p.subheading && <p className="mt-4 whitespace-pre-line text-[17px] text-slate-600">{p.subheading}</p>}
                    {p.ctaLabel && <a href={safeUrl(p.ctaUrl)} className="mt-6 inline-flex h-12 items-center rounded-md bg-[#0B5CFF] px-6 font-semibold text-white">{p.ctaLabel}</a>}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.imageUrl && safeUrl(p.imageUrl) !== "#" && <img src={safeUrl(p.imageUrl)} alt="" className="w-full rounded-xl" />}
                </div>
              </section>
            );
          case "features":
          case "benefits":
            return (
              <section key={b.id} id={b.type} className="py-14">
                <div className={wrap}>
                  {p.heading && <h2 className="mb-6 text-[28px] font-bold">{p.heading}</h2>}
                  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {lines(p.items).map((it) => <li key={it} className="rounded-xl border border-slate-200 p-5 text-[15px]">{b.type === "benefits" ? "✓ " : ""}{it}</li>)}
                  </ul>
                </div>
              </section>
            );
          case "testimonials":
            return p.quote ? (
              <section key={b.id} className="bg-slate-50 py-14">
                <figure className={`${wrap} text-center`}>
                  <blockquote className="text-[22px] font-medium">“{p.quote}”</blockquote>
                  {p.author && <figcaption className="mt-3 text-slate-600">{p.author}</figcaption>}
                </figure>
              </section>
            ) : null;
          case "pricing":
            return (
              <section key={b.id} className="py-14">
                <div className={wrap}>
                  {p.heading && <h2 className="mb-6 text-[28px] font-bold">{p.heading}</h2>}
                  <div className="grid gap-4 md:grid-cols-3">
                    {lines(p.items).map((l) => {
                      const [name, price, desc] = l.split("|").map((x) => x.trim());
                      return (
                        <div key={l} className="rounded-xl border border-slate-200 p-6">
                          <div className="font-semibold">{name}</div>
                          <div className="mt-2 text-[28px] font-bold">{price}</div>
                          {desc && <p className="mt-2 text-[14px] text-slate-600">{desc}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          case "faq":
            return (
              <section key={b.id} className="py-14">
                <div className={wrap}>
                  {p.heading && <h2 className="mb-6 text-[28px] font-bold">{p.heading}</h2>}
                  {lines(p.items).map((l) => {
                    const [q, ...a] = l.split("|");
                    return (
                      <details key={l} className="border-b border-slate-200 py-3">
                        <summary className="cursor-pointer font-semibold">{q.trim()}</summary>
                        <p className="mt-2 text-slate-600">{a.join("|").trim()}</p>
                      </details>
                    );
                  })}
                </div>
              </section>
            );
          case "cta":
            return (
              <section key={b.id} className="bg-[#0B1B3F] py-14 text-center text-white">
                <div className={wrap}>
                  <h2 className="text-[28px] font-bold">{p.heading}</h2>
                  {p.ctaLabel && <a href={safeUrl(p.ctaUrl)} className="mt-6 inline-flex h-12 items-center rounded-md bg-white px-6 font-semibold text-[#0B1B3F]">{p.ctaLabel}</a>}
                </div>
              </section>
            );
          case "footer":
            return <footer key={b.id} className="border-t border-slate-200 py-8 text-center text-[13px] text-slate-500">{p.text}</footer>;
          case "text":
            return <section key={b.id} className={`${wrap} whitespace-pre-line py-6 text-[16px] leading-relaxed`}>{p.text}</section>;
          case "image":
            // eslint-disable-next-line @next/next/no-img-element
            return safeUrl(p.url) !== "#" ? <div key={b.id} className={`${wrap} py-6`}><img src={safeUrl(p.url)} alt={p.alt ?? ""} className="w-full rounded-xl" /></div> : null;
          case "button":
            return <div key={b.id} className={`${wrap} py-4`}><a href={safeUrl(p.url)} className="inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-6 font-semibold text-white">{p.label || "Learn more"}</a></div>;
          case "divider":
            return <hr key={b.id} className="mx-auto my-6 max-w-[1040px] border-slate-200" />;
          case "form":
            return (
              <section key={b.id} className="py-14">
                <div className="mx-auto max-w-[520px] px-5">
                  {form ? (
                    preview ? <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">{p.heading || "Lead form"} · {form.fields.length} fields (live on the published page)</div> : <LeadForm form={form} pageId={pageId} heading={p.heading} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">No form connected</div>
                  )}
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

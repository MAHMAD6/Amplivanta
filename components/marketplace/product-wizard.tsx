"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Check,
  ChevronLeft,
  Globe,
  ImageIcon,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { createProduct, suggestProductSeo } from "@/app/(app)/app/marketplace/actions";
import { toastResult } from "@/lib/action-toast";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { MpCard } from "./ui";
import {
  CONTENT_CREATION,
  CONTENT_CREATION_HINT,
  CONTENT_CREATION_LABEL,
} from "@/lib/marketplace/content-creation";

const STEPS = [
  { id: 1, title: "Product Details", hint: "Basic information" },
  { id: 2, title: "Media & Files", hint: "Images and files" },
  { id: 3, title: "Pricing & License", hint: "Pricing and terms" },
  { id: 4, title: "SEO & Discoverability", hint: "Optimize for search" },
  { id: 5, title: "Review & Publish", hint: "Final review" },
] as const;

const field =
  "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none";
const area =
  "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13.5px] focus:border-royal-blue focus:outline-none";

function Field({
  label,
  hint,
  required,
  count,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] font-bold text-deep-navy">
          {label} {required && <span className="text-orange-cta">*</span>}
        </span>
        {count && <span className="text-[11.5px] text-ink-muted">{count}</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[11.5px] text-ink-muted">{hint}</span>}
    </label>
  );
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export function ProductWizard({
  categories,
  types,
}: {
  categories: { id: string; name: string }[];
  types: { value: string; label: string }[];
}) {
  const [step, setStep] = useState(1);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // Mirrored so the previews and the slug can react as the seller types.
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [price, setPrice] = useState("0");
  const [coverImage, setCoverImage] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");

  // AI SEO is suggest-then-accept: nothing is written until the seller applies it.
  const [seoPending, startSeo] = useTransition();
  const [seoSuggestion, setSeoSuggestion] = useState<{
    seoTitle: string;
    metaDescription: string;
    keywords: string[];
    stubbed: boolean;
  } | null>(null);

  const requestSeo = () =>
    startSeo(async () => {
      const form = formRef.current;
      const fd = form ? new FormData(form) : new FormData();
      const res = await suggestProductSeo({
        title,
        summary,
        description: String(fd.get("description") ?? ""),
        category: categories.find((c) => c.id === String(fd.get("categoryId") ?? ""))?.name,
        tags: String(fd.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
      });
      if (res.ok) {
        setSeoSuggestion({ ...res.suggestion, stubbed: res.stubbed });
        if (res.stubbed) {
          toast.warning("Placeholder copy", {
            description: "No AI key is configured, so this is not written for your product. Edit it before publishing.",
          });
        }
      } else {
        toast.error(res.error);
      }
    });

  const applySeo = () => {
    if (!seoSuggestion) return;
    if (seoSuggestion.seoTitle) setSeoTitle(seoSuggestion.seoTitle.slice(0, 60));
    if (seoSuggestion.metaDescription) setMetaDescription(seoSuggestion.metaDescription.slice(0, 160));
    if (seoSuggestion.keywords.length > 0) {
      setKeywords(Array.from(new Set([...keywords, ...seoSuggestion.keywords])).slice(0, 12));
    }
    setSeoSuggestion(null);
  };

  const effectiveSlug = slug || slugify(title);
  const priceLabel = useMemo(() => {
    const n = Number(price);
    if (!Number.isFinite(n)) return "—";
    return n === 0 ? "Free" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  }, [price]);

  const submit = () =>
    start(async () => {
      const form = formRef.current;
      if (!form) return;
      const fd = new FormData(form);
      fd.set("keywords", keywords.join(","));
      if (toastResult(await createProduct(fd))) {
        router.push("/app/marketplace/seller/products");
        router.refresh();
      }
    });

  const addKeyword = () => {
    const k = keywordDraft.trim().replace(/,$/, "");
    if (k && !keywords.includes(k)) setKeywords([...keywords, k]);
    setKeywordDraft("");
  };

  const canAdvance = step !== 1 || title.trim().length > 0;

  return (
    <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
      {/* Step rail */}
      <MpCard className="p-5">
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {STEPS.map((s) => {
            const done = s.id < step;
            const current = s.id === step;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  aria-current={current ? "step" : undefined}
                  className="flex w-full items-center gap-2.5 text-left"
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                      done && "bg-emerald-500 text-white",
                      current && "bg-violet text-white",
                      !done && !current && "border border-line bg-white text-ink-muted",
                    )}
                  >
                    {done ? <Check aria-hidden className="h-3.5 w-3.5" /> : s.id}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-[12.5px] font-bold",
                        current ? "text-violet" : "text-deep-navy",
                      )}
                    >
                      {s.id}. {s.title}
                    </span>
                    <span className="block truncate text-[11px] text-ink-muted">{s.hint}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </MpCard>

      {/* ------------------------------------------------- 1. Product details */}
      <div hidden={step !== 1}>
        <MpCard className="mt-5 p-6">
          <h2 className="text-[16px] font-extrabold text-deep-navy">Product Details</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Product title" required>
                <input
                  name="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.currentTarget.value)}
                  placeholder="Enter a clear, descriptive title"
                  className={field}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Short description" hint="Shown on listing cards and search results.">
                <input
                  name="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.currentTarget.value)}
                  placeholder="A brief description shown in listings"
                  className={field}
                />
              </Field>
            </div>
            <Field label="Product type" required>
              <select name="type" required defaultValue="" className={field}>
                <option value="" disabled>Select a type</option>
                {types.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Category"
              hint={categories.length === 0 ? "No categories have been configured yet." : undefined}
            >
              <select name="categoryId" defaultValue="" className={field} disabled={categories.length === 0}>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Language">
              <input name="language" defaultValue="English" className={field} />
            </Field>
            <fieldset className="md:col-span-2">
              <legend className="mb-1.5 text-[12.5px] font-bold text-deep-navy">
                Content creation <span className="text-orange-cta">*</span>
              </legend>
              <p className="mb-2.5 text-[11.5px] text-ink-muted">
                Buyers see this on the listing. Declare how the product was actually made.
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {CONTENT_CREATION.map((value) => (
                  <label
                    key={value}
                    className="flex cursor-pointer gap-2.5 rounded-xl border border-line bg-white p-3.5 transition has-[:checked]:border-royal-blue has-[:checked]:bg-royal-tint"
                  >
                    <input
                      type="radio"
                      name="contentCreation"
                      value={value}
                      required
                      className="mt-0.5 h-4 w-4 shrink-0 accent-royal-blue"
                    />
                    <span>
                      <span className="block text-[13px] font-bold text-deep-navy">
                        {CONTENT_CREATION_LABEL[value]}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-muted">
                        {CONTENT_CREATION_HINT[value]}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Tags" hint="Comma separated.">
              <input name="tags" placeholder="email, template, saas" className={field} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Full description">
                <textarea
                  name="description"
                  rows={7}
                  placeholder="What the buyer receives, how to use it, and what is included."
                  className={area}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="What's Included" hint="One item per line. Shown on the What's Included tab.">
                <textarea name="highlights" rows={4} className={area} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Perfect For" hint="One audience per line. Shown on the Overview tab.">
                <textarea name="perfectFor" rows={4} className={area} />
              </Field>
            </div>
          </div>
        </MpCard>
      </div>

      {/* ---------------------------------------------------- 2. Media & files */}
      <div hidden={step !== 2}>
        <MpCard className="mt-5 p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-deep-navy">
            <ImageIcon aria-hidden className="h-4 w-4 text-royal-blue" /> Media &amp; Files
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Main image URL" hint="The primary listing image.">
              <input
                name="coverImage"
                value={coverImage}
                onChange={(e) => setCoverImage(e.currentTarget.value)}
                placeholder="https://…"
                className={field}
              />
            </Field>
            <Field label="Main image ALT text" count={`${coverImageAlt.length}/125`}>
              <input
                name="coverImageAlt"
                maxLength={125}
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.currentTarget.value)}
                placeholder="Describe your main image for accessibility and SEO"
                className={field}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Gallery image URLs" hint="One per line, in display order.">
                <textarea name="galleryImages" rows={4} className={area} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field
                label="Gallery ALT text"
                hint="One per line, matching the gallery order above."
              >
                <textarea name="galleryImageAlts" rows={4} className={area} />
              </Field>
            </div>
          </div>
          <p className="mt-5 rounded-xl border border-line bg-bg-soft px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-soft">
            Deliverable file upload becomes available once the Marketplace storage provider, maximum
            upload size and malware scanning are configured. Attach files from My Products after the
            draft is saved.
          </p>
        </MpCard>
      </div>

      {/* ----------------------------------------------- 3. Pricing & license */}
      <div hidden={step !== 3}>
        <MpCard className="mt-5 p-6">
          <h2 className="text-[16px] font-extrabold text-deep-navy">Pricing &amp; License</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Price (USD)" hint="Set 0 for a free product.">
              <input
                name="price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.currentTarget.value)}
                className={field}
              />
            </Field>
            <Field label="Licence" hint="The standard digital product licence applies to version 1.">
              <input value="standard-v1" readOnly disabled className={cn(field, "bg-bg-soft")} />
            </Field>
          </div>
          <p className="mt-5 rounded-xl border border-line bg-bg-soft px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-soft">
            Commission rate, payout schedule and refund window are Marketplace operator settings and
            apply to every seller. They are shown on your Earnings page.
          </p>
        </MpCard>
      </div>

      {/* ------------------------------------------ 4. SEO & discoverability */}
      <div hidden={step !== 4}>
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <MpCard className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-deep-navy">
                  <BarChart3 aria-hidden className="h-4 w-4 text-royal-blue" /> SEO &amp; Discoverability
                </h2>
                <p className="mt-1 text-[12.5px] text-ink-muted">
                  Help buyers and search engines find this product.
                </p>
              </div>
              <button
                type="button"
                onClick={requestSeo}
                disabled={seoPending || !title.trim()}
                title={!title.trim() ? "Enter a product title first." : undefined}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-white px-3.5 text-[12.5px] font-bold text-violet transition hover:bg-violet/5 disabled:opacity-50"
              >
                {seoPending ? (
                  <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles aria-hidden className="h-3.5 w-3.5" />
                )}
                Suggest with AI
              </button>
            </div>


            {seoSuggestion && (
              <div className="mt-4 rounded-xl border border-violet/30 bg-violet/5 p-4">
                <h3 className="text-[12.5px] font-extrabold text-deep-navy">Suggested copy</h3>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
                  {seoSuggestion.stubbed
                    ? "No AI key is configured, so this is a placeholder. Edit it before publishing."
                    : "Review and edit before applying — you are accountable for what this listing claims."}
                </p>
                <dl className="mt-3 space-y-2 text-[12.5px]">
                  <div>
                    <dt className="font-bold text-deep-navy">SEO title</dt>
                    <dd className="text-ink-soft">{seoSuggestion.seoTitle || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-deep-navy">Meta description</dt>
                    <dd className="text-ink-soft">{seoSuggestion.metaDescription || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-deep-navy">Keywords</dt>
                    <dd className="text-ink-soft">{seoSuggestion.keywords.join(", ") || "—"}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={applySeo}
                    className="inline-flex h-9 items-center rounded-lg bg-violet px-3.5 text-[12.5px] font-bold text-white transition hover:opacity-90"
                  >
                    Apply to fields
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeoSuggestion(null)}
                    className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3.5 text-[12.5px] font-bold text-deep-navy transition hover:bg-bg-soft"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            <h3 className="mt-6 flex items-center gap-2 text-[13.5px] font-extrabold text-deep-navy">
              <Globe aria-hidden className="h-4 w-4 text-royal-blue" /> Search Engine Optimization
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="SEO title" count={`${seoTitle.length}/60`} hint="The title search engines will see.">
                <input
                  name="seoTitle"
                  maxLength={60}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.currentTarget.value)}
                  placeholder="Enter SEO title (recommended)"
                  className={field}
                />
              </Field>
              <Field
                label="Meta description"
                count={`${metaDescription.length}/160`}
                hint="This description appears in search engine results."
              >
                <textarea
                  name="metaDescription"
                  maxLength={160}
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.currentTarget.value)}
                  placeholder="Enter meta description (recommended)"
                  className={area}
                />
              </Field>
              <Field label="Product URL (slug)" hint="Lowercase letters, numbers and hyphens only.">
                <span className="flex flex-col sm:flex-row">
                  <span className="flex h-12 shrink-0 items-center rounded-t-xl border border-line bg-bg-soft px-3 text-[12.5px] text-ink-muted sm:rounded-l-xl sm:rounded-tr-none sm:border-r-0">
                    /app/marketplace/products/
                  </span>
                  <input
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.currentTarget.value))}
                    placeholder={slugify(title) || "your-product-name"}
                    className={cn(field, "rounded-t-none sm:rounded-l-none sm:rounded-tr-xl")}
                  />
                </span>
              </Field>
              <Field label="Primary keyword" hint="Your main keyword (e.g. social media template).">
                <input name="primaryKeyword" placeholder="Enter primary keyword" className={field} />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Additional keywords / tags" hint="Terms buyers might search for.">
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5">
                  {keywords.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-royal-tint px-2.5 py-1 text-[12px] font-semibold text-royal-blue"
                    >
                      {k}
                      <button
                        type="button"
                        aria-label={`Remove keyword ${k}`}
                        onClick={() => setKeywords(keywords.filter((x) => x !== k))}
                        className="text-royal-blue/70 hover:text-royal-blue"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    value={keywordDraft}
                    onChange={(e) => setKeywordDraft(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    onBlur={addKeyword}
                    aria-label="Add keyword"
                    placeholder="Add keyword and press Enter"
                    className="h-8 min-w-[180px] flex-1 text-[13px] focus:outline-none"
                  />
                </div>
              </Field>
            </div>

            <h3 className="mt-7 text-[13.5px] font-extrabold text-deep-navy">Indexing settings</h3>
            <label className="mt-3 flex items-start gap-2.5">
              <input
                type="checkbox"
                name="allowIndexing"
                value="true"
                defaultChecked
                className="mt-0.5 h-4 w-4 rounded border-line text-royal-blue"
              />
              <span>
                <span className="block text-[13px] font-semibold text-deep-navy">
                  Allow search engines to index this product
                </span>
                <span className="block text-[11.5px] text-ink-muted">
                  Uncheck if you don&apos;t want this product to appear in search results.
                </span>
              </span>
            </label>
          </MpCard>

          {/* Live previews */}
          <div className="space-y-4">
            <MpCard className="p-5">
              <h3 className="text-[12.5px] font-bold text-deep-navy">Search engine preview</h3>
              <p className="mt-3 text-[15px] font-semibold leading-snug text-royal-blue">
                {seoTitle || title || "Your product title here"} – Amplivanta Marketplace
              </p>
              <p className="mt-1 break-all text-[12px] text-emerald-700">
                amplivanta.com/app/marketplace/products/{effectiveSlug || "your-product-name"}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                {metaDescription || summary || "This is how your product will appear in search engine results."}
              </p>
            </MpCard>

            <MpCard className="p-5">
              <h3 className="text-[12.5px] font-bold text-deep-navy">Marketplace search preview</h3>
              <div className="mt-3 flex gap-3">
                {coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-bg-soft">
                    <ImageIcon aria-hidden className="h-5 w-5 text-ink-muted" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold text-deep-navy">
                    {title || "Your product title here"}
                  </div>
                  <div className="line-clamp-2 text-[11.5px] text-ink-muted">
                    {summary || "Short description of your product appears here…"}
                  </div>
                  <div className="mt-1 text-[13px] font-extrabold text-deep-navy">{priceLabel}</div>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-ink-muted">
                Ratings appear here once buyers review this product.
              </p>
            </MpCard>

            <MpCard className="p-5">
              <h3 className="text-[12.5px] font-bold text-deep-navy">Social sharing preview</h3>
              <div className="mt-3 overflow-hidden rounded-xl border border-line">
                {coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt="" className="h-28 w-full object-cover" />
                ) : (
                  <div className="flex h-28 items-center justify-center bg-bg-soft">
                    <ImageIcon aria-hidden className="h-6 w-6 text-ink-muted" />
                  </div>
                )}
                <div className="px-3.5 py-3">
                  <div className="truncate text-[13px] font-bold text-deep-navy">
                    {seoTitle || title || "Your product title here"}
                  </div>
                  <div className="line-clamp-2 text-[11.5px] text-ink-muted">
                    {metaDescription || summary || "Short description of your product appears here…"}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-muted">amplivanta.com</div>
                </div>
              </div>
            </MpCard>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ 5. Review & publish */}
      <div hidden={step !== 5}>
        <MpCard className="mt-5 p-6">
          <h2 className="text-[16px] font-extrabold text-deep-navy">Review &amp; Publish</h2>
          <dl className="mt-5 divide-y divide-line">
            {[
              ["Title", title || "—"],
              ["Short description", summary || "—"],
              ["Price", priceLabel],
              ["Product URL", `/app/marketplace/products/${effectiveSlug || "—"}`],
              ["SEO title", seoTitle || "Not set"],
              ["Meta description", metaDescription || "Not set"],
              ["Keywords", keywords.length > 0 ? keywords.join(", ") : "None"],
              ["Main image", coverImage || "Not set"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-3 py-3">
                <dt className="text-[12.5px] font-bold text-deep-navy">{k}</dt>
                <dd className="min-w-0 break-all text-right text-[12.5px] text-ink-soft">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 rounded-xl border border-line bg-bg-soft px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-soft">
            Saving creates this product as a draft. Attach the deliverable from My Products, then
            submit it for review — only a Marketplace admin can publish a listing.
          </p>
        </MpCard>
      </div>


      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-5 text-[13.5px] font-bold text-deep-navy transition hover:bg-bg-soft disabled:opacity-40"
        >
          <ChevronLeft aria-hidden className="h-4 w-4" />
          Previous
        </button>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={submit}
            disabled={pending || !title.trim()}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-5 text-[13.5px] font-bold text-deep-navy transition hover:bg-bg-soft disabled:opacity-50"
          >
            {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Save aria-hidden className="h-4 w-4" />}
            Save as draft
          </button>
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(5, s + 1))}
              disabled={!canAdvance}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-violet px-5 text-[13.5px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Next — {STEPS[step].title}
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={pending || !title.trim()}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-violet px-5 text-[13.5px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {pending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
              Create product
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

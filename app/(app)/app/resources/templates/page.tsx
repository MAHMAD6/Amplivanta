import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  FolderOpen,
  Grid3x3,
  List,
  MoreVertical,
  PlusCircle,
  Sparkles,
  Star,
  UploadCloud,
  Eye,
} from "lucide-react";
import { ResourceBreadcrumb, RailCard } from "@/components/amplivanta/resource-breadcrumb";
import { ResourceIcon } from "@/components/amplivanta/resource-icon";
import {
  TEMPLATE_FILTER_GROUPS,
  TEMPLATE_TABS,
  TEMPLATE_TAGS,
  TEMPLATE_TYPES,
  TEMPLATES,
} from "@/lib/resources-data";

export const metadata: Metadata = {
  title: "Templates — Amplivanta",
  description: "Professionally designed templates for campaigns, emails, landing pages, and more.",
};

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <ResourceBreadcrumb current="Templates" />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] font-extrabold leading-tight text-ink">Templates</h1>
          <p className="mt-1 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
            Save time and get started faster with professionally designed templates for campaigns,
            emails, landing pages, and more.
          </p>
        </div>
        <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-5 text-[13px] font-semibold text-violet transition hover:border-violet/40">
          <FolderOpen className="h-4 w-4" /> My Templates
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {/* Promo band */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-violet/20 bg-gradient-to-r from-violet/[0.08] to-royal-tint p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet/15 text-violet">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-ink">Work smarter with templates</h2>
                <p className="text-[12.5px] text-ink-soft">
                  Use our proven templates as a starting point and customize them to fit your brand and goals.
                </p>
              </div>
            </div>
            <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet px-5 text-[13px] font-semibold text-white transition hover:bg-violet-hover">
              <PlusCircle className="h-4 w-4" /> Create New Template
            </button>
          </section>

          {/* Browse by type */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-[20px] font-extrabold text-ink">Browse by Template Type</h2>
            <Link href="#" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View All Types <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {TEMPLATE_TYPES.map((t) => (
              <Link
                key={t.title}
                href="#"
                className="rounded-2xl border border-line bg-white p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg"
              >
                <span className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${t.tone}`}>
                  <ResourceIcon name={t.icon} className="h-5 w-5" />
                </span>
                <div className="mt-3 text-[13px] font-bold text-ink">{t.title}</div>
                <div className="text-[11px] text-ink-muted">{t.count} templates</div>
              </Link>
            ))}
          </div>

          {/* Tabs + toolbar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <div className="flex gap-4">
              {TEMPLATE_TABS.map((t, i) => (
                <button
                  key={t}
                  className={`relative pb-2 text-[13px] font-semibold ${i === 0 ? "text-violet" : "text-ink-muted hover:text-ink"}`}
                >
                  {t}
                  {i === 0 && <span className="absolute inset-x-0 -bottom-[13px] h-0.5 rounded-full bg-violet" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] text-ink-muted">Sort by: Most Popular</span>
              <button className="rounded-lg border border-line bg-violet/10 p-2 text-violet"><Grid3x3 className="h-4 w-4" /></button>
              <button className="rounded-lg border border-line p-2 text-ink-muted"><List className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Template grid */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((t) => (
              <article
                key={t.id}
                className="overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg"
              >
                <div className={`relative h-32 bg-gradient-to-br ${t.cover}`}>
                  <button className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/85 text-ink-soft">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  <span className="inline-flex rounded-md bg-bg-soft px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
                    {t.type}
                  </span>
                  <h3 className="mt-2 text-[13.5px] font-bold leading-snug text-ink">{t.name}</h3>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{t.desc}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[11px] text-ink-muted">
                    <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {t.views}</span>
                    <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" /> {t.rating}</span>
                    <Bookmark className="h-3.5 w-3.5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Filter rail */}
        <aside className="space-y-4">
          <RailCard
            title="Filter Templates"
            action={<button className="text-[12px] font-semibold text-violet">Clear All</button>}
          >
            <div className="space-y-4 text-[12.5px]">
              {(["types", "goals", "industries"] as const).map((group) => (
                <div key={group}>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                    {group}
                  </label>
                  <select className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[12.5px] text-ink-soft focus:outline-none">
                    {TEMPLATE_FILTER_GROUPS[group].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                  Features
                </label>
                <ul className="space-y-2">
                  {TEMPLATE_FILTER_GROUPS.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-line accent-violet" />
                      <span className="text-ink-soft">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                  Color
                </label>
                <div className="flex gap-2">
                  {TEMPLATE_FILTER_GROUPS.colors.map((c) => (
                    <span key={c} className="h-6 w-6 rounded-full ring-1 ring-line" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <button className="w-full rounded-xl bg-violet py-2.5 text-[13px] font-semibold text-white transition hover:bg-violet-hover">
                Apply Filters
              </button>
            </div>
          </RailCard>

          <RailCard title="Quick Actions">
            <ul className="space-y-2 text-[12.5px]">
              {[
                { icon: PlusCircle, title: "Create New Template", desc: "Start from scratch" },
                { icon: UploadCloud, title: "Import Template", desc: "Upload your template file" },
                { icon: FolderOpen, title: "Template Library", desc: "Explore community templates" },
                { icon: Sparkles, title: "Brand Kit", desc: "Manage your brand assets" },
              ].map((a) => (
                <li key={a.title} className="flex items-center gap-3 rounded-xl border border-line p-2.5">
                  <a.icon className="h-4 w-4 text-violet" />
                  <span>
                    <span className="block font-semibold text-ink">{a.title}</span>
                    <span className="block text-[10.5px] text-ink-muted">{a.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </RailCard>

          <RailCard title="Popular Tags" action={<Link href="#" className="text-[12px] font-semibold text-violet">View All</Link>}>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_TAGS.map((t) => (
                <span key={t} className="rounded-full bg-violet/10 px-2.5 py-1 text-[11px] font-medium text-violet">
                  {t}
                </span>
              ))}
            </div>
          </RailCard>
        </aside>
      </div>
    </div>
  );
}

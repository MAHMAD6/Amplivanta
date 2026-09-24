import type { Metadata } from "next";
import Link from "next/link";
import { Database, FileImage, FileText } from "lucide-react";
import { SuperCard, SuperCardHeader, SuperEmptyState, SuperInfoNote } from "@/components/admin/primitives";
import { ContentStatusPill } from "@/components/admin/content-list";
import { loadContentItems, loadContentOverview } from "../../content/loaders";

export const metadata: Metadata = { title: "Content Overview" };
export const dynamic = "force-dynamic";

export default async function ContentOverviewPage() {
  const [{ byType, media, connected }, recent] = await Promise.all([loadContentOverview(), loadContentItems(undefined, 8)]);

  if (!connected) {
    return (
      <SuperCard>
        <SuperEmptyState icon={Database} title="Data source unavailable" description="The platform database could not be reached, so content counts cannot be shown right now." />
      </SuperCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {byType.map((t) => (
          <SuperCard key={t.value} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="text-[14px] font-bold text-admin-navy">{t.plural}</div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><FileText className="h-4 w-4" /></span>
            </div>
            <div className="mt-3 text-[26px] font-extrabold leading-none text-admin-navy">{t.total}</div>
            <p className="mt-2 text-[12px] text-ink-soft">{t.published} published · {t.draft} draft · {t.scheduled} scheduled · {t.archived} archived</p>
            <Link href={t.href} className="mt-3 inline-block text-[12.5px] font-bold text-royal-blue hover:underline">Manage →</Link>
          </SuperCard>
        ))}
        <SuperCard className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[14px] font-bold text-admin-navy">Media Library</div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><FileImage className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 text-[26px] font-extrabold leading-none text-admin-navy">{media}</div>
          <p className="mt-2 text-[12px] text-ink-soft">Images, video, documents and downloadable files</p>
          <Link href="/admin/content-management/media-library" className="mt-3 inline-block text-[12.5px] font-bold text-royal-blue hover:underline">Manage →</Link>
        </SuperCard>
      </div>

      <SuperCard>
        <SuperCardHeader title="Recently updated" description="The latest changes across every content type." />
        {recent.rows.length === 0 ? (
          <SuperEmptyState icon={FileText} title="No content yet" description="Items appear here as soon as content is created in any type." />
        ) : (
          <ul className="divide-y divide-line">
            {recent.rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-semibold text-admin-navy">{r.title}</div>
                  <div className="text-[12px] text-ink-soft">{r.contentType.replace(/_/g, " ")} · updated {r.updatedAt}</div>
                </div>
                <ContentStatusPill status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </SuperCard>

      <SuperInfoNote title="About Content Overview">
        Every content type shares one publishing lifecycle — draft, in review, scheduled, published, archived — one media library and one version history, so counts here always match the individual screens.
      </SuperInfoNote>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, FileText, Mail, Megaphone } from "lucide-react";
import { SuperCard, SuperCardHeader, SuperEmptyState, SuperInfoNote } from "@/components/admin/primitives";
import { StatusPill } from "@/components/admin/communications-panels";
import { communicationsReady } from "@/lib/server/communications";
import { loadCommunications } from "./loaders";

export const metadata: Metadata = { title: "Communications" };
export const dynamic = "force-dynamic";

const CARDS = [
  { icon: Mail, title: "Send Communication", body: "Create and send messages to users or admin groups.", href: "/admin/communications/compose", cta: "Open" },
  { icon: Megaphone, title: "Announcements", body: "Manage important platform announcements.", href: "/admin/announcements/announcements", cta: "Open" },
  { icon: FileText, title: "Templates", body: "Create and manage message templates.", href: "/admin/communications/templates", cta: "Open" },
  { icon: Clock, title: "Delivery History", body: "View past communications and delivery status.", href: "/admin/communications/history", cta: "View" },
];

export default async function CommunicationsOverviewPage() {
  const { rows, connected } = await loadCommunications(20);
  const recent = rows.filter((r) => ["SENT", "PARTIAL", "FAILED", "SENDING"].includes(r.status)).slice(0, 5);
  const upcoming = rows.filter((r) => ["SCHEDULED", "QUEUED", "DRAFT"].includes(r.status)).slice(0, 5);

  return (
    <div className="space-y-6">
      {!communicationsReady() && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-[13px] text-amber-900">
          No email provider is configured on this environment, so communications can be composed and scheduled but not delivered.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((c) => (
          <SuperCard key={c.title} className="p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><c.icon className="h-5 w-5" /></span>
            <div className="mt-3 text-[15px] font-bold text-admin-navy">{c.title}</div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{c.body}</p>
            <Link href={c.href} className="mt-3 inline-block text-[13px] font-bold text-royal-blue hover:underline">{c.cta} →</Link>
          </SuperCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SuperCard>
          <SuperCardHeader title="Recent Communications" description="Latest administrative messages sent through the platform." />
          {recent.length === 0 ? (
            <SuperEmptyState icon={Mail} title="No communications yet" description={connected ? "Communications will appear here when messages are sent." : "The platform database could not be reached, so recent communications cannot be shown."} />
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                  <div className="min-w-0">
                    <Link href={`/admin/communications/history?id=${r.id}`} className="block truncate text-[13.5px] font-semibold text-admin-navy hover:text-royal-blue">{r.subject}</Link>
                    <div className="text-[12px] text-ink-soft">{r.audienceLabel} · {r.sentCount} of {r.recipientCount} sent{r.sentAt ? ` · ${r.sentAt}` : ""}</div>
                  </div>
                  <StatusPill value={r.status} />
                </li>
              ))}
            </ul>
          )}
        </SuperCard>

        <SuperCard>
          <SuperCardHeader title="Upcoming or Scheduled" description="Scheduled communications and drafts waiting to be sent." />
          {upcoming.length === 0 ? (
            <SuperEmptyState icon={Calendar} title="No scheduled items yet" description="Scheduled communications will appear here when items are scheduled." />
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                  <div className="min-w-0">
                    <Link href={`/admin/communications/compose?id=${r.id}`} className="block truncate text-[13.5px] font-semibold text-admin-navy hover:text-royal-blue">{r.subject}</Link>
                    <div className="text-[12px] text-ink-soft">{r.audienceLabel}{r.scheduledAt ? ` · scheduled ${r.scheduledAt}` : " · draft"}</div>
                  </div>
                  <StatusPill value={r.status} />
                </li>
              ))}
            </ul>
          )}
        </SuperCard>
      </div>

      <SuperInfoNote title="About Communications">
        Audiences are snapshotted before a send, so a changing list cannot shift mid-delivery. Announcements and product updates respect unsubscribe and suppression rules; administrative and support messages are transactional. Delivered, opened and clicked are never claimed without provider events.
      </SuperInfoNote>
    </div>
  );
}

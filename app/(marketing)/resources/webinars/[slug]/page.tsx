import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import { Crumb, EmptyState, Eyebrow, InfoCard, Section, StatusChip } from "@/components/marketing/site-ui";
import { RESOURCE_WEBINARS, type WebinarStatus } from "@/lib/site-resource-items";

const BY_SLUG = new Map(RESOURCE_WEBINARS.map((w) => [w.slug, w]));

const STATUS_LABEL: Record<WebinarStatus, string> = {
  upcoming: "Upcoming",
  "registration-open": "Registration open",
  "registration-closed": "Registration closed",
  completed: "Completed",
  replay: "Replay available",
};

export function generateStaticParams() {
  return RESOURCE_WEBINARS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const w = BY_SLUG.get((await params).slug);
  return w ? { title: w.title, description: w.summary } : {};
}

/**
 * Webinar page, on the reference's Webinar Detail template. One route covers
 * every state — upcoming, registration open or closed, completed, and replay —
 * driven entirely by the event record.
 */
export default async function WebinarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const w = BY_SLUG.get((await params).slug);
  if (!w) notFound();

  const registrationOpen = w.status === "registration-open" && Boolean(w.registrationUrl);

  return (
    <>
      <Crumb items={["Home", "Resources", "Webinars", "Webinar"]} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <Eyebrow>WEBINAR</Eyebrow>
          <h1 className="m-0 mb-4 text-[32px] font-extrabold leading-[1.08] tracking-[-1.2px] text-site-ink sm:text-[42px]">
            {w.title}
          </h1>
          <StatusChip>{STATUS_LABEL[w.status]}</StatusChip>
          <p className="mt-5 text-[16px] leading-[1.6] text-site-muted">{w.summary}</p>

          <Section title="About the webinar">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {[
                ["Schedule", w.scheduleLabel ?? "Shown when published"],
                ["Speakers", w.speakers?.length ? w.speakers.join(", ") : "Shown when confirmed"],
                ["Format", w.format ?? "Live or on-demand, as configured"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-site-line bg-white p-4">
                  <div className="text-[12px] font-bold uppercase tracking-[0.6px] text-site-muted">{k}</div>
                  <div className="mt-1 text-[14px] font-semibold text-site-ink">{v}</div>
                </div>
              ))}
            </div>
            {w.agenda && w.agenda.length > 0 && (
              <ul className="mt-5 list-disc space-y-1.5 pl-5 text-[14.5px] text-site-ink">
                {w.agenda.map((a) => <li key={a}>{a}</li>)}
              </ul>
            )}
          </Section>

          <Section title="Replay">
            {w.status === "replay" && w.replayEmbedUrl ? (
              <div className="aspect-video w-full overflow-hidden rounded-[18px] border border-site-line bg-site-navy">
                <iframe src={w.replayEmbedUrl} title={`${w.title} replay`} className="h-full w-full" allowFullScreen />
              </div>
            ) : (
              <EmptyState title="Replay not published">
                A replay appears on this page only when one is intentionally published for this webinar.
              </EmptyState>
            )}
          </Section>
        </div>

        <aside className="h-fit space-y-4">
          <InfoCard title="Registration">
            {registrationOpen ? (
              <>
                <p className="m-0 mb-3">Registration is open for this session.</p>
                <a className={`${btnPrimary} w-full px-4 py-[11px] text-[13px]`} href={w.registrationUrl} target="_blank" rel="noopener noreferrer">
                  Register
                </a>
              </>
            ) : (
              <p className="m-0">Registration is not open for this session.</p>
            )}
          </InfoCard>
          <Link className={`${btn} w-full px-4 py-[11px] text-[13px]`} href="/resources/webinars">All webinars</Link>
        </aside>
      </div>
    </>
  );
}

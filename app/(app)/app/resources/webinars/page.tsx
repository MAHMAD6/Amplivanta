import type { Metadata } from "next";
import { Presentation } from "lucide-react";
import { ScreenHeader, kitOutline } from "@/components/amplivanta/screen-kit";
import { ResourceList, resourceCrumbs } from "@/components/amplivanta/resources-ui";
import { RESOURCE_WEBINARS } from "@/lib/site-resource-items";

export const metadata: Metadata = { title: "Webinars" };

const UPCOMING = new Set(["upcoming", "registration-open", "registration-closed"]);

export default function WebinarsPage() {
  const entry = (w: (typeof RESOURCE_WEBINARS)[number]) => ({ type: "Webinar" as const, title: w.title, summary: w.summary, href: `/resources/webinars/${w.slug}`, date: w.scheduleLabel, topic: w.format });
  const upcoming = RESOURCE_WEBINARS.filter((w) => UPCOMING.has(w.status)).map(entry);
  const onDemand = RESOURCE_WEBINARS.filter((w) => !UPCOMING.has(w.status)).map(entry);
  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={resourceCrumbs("Webinars")} title="Webinars" subtitle="Live sessions and recordings. Only scheduled or published webinars appear here." />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16.5px] font-semibold text-deep-navy">Upcoming</h2>
          <ResourceList entries={upcoming} empty={{ icon: Presentation, title: "No webinars scheduled", body: "Scheduled sessions appear here with their real date and registration link." }} />
        </section>
        <section className="min-w-0 rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16.5px] font-semibold text-deep-navy">On demand</h2>
          <ResourceList entries={onDemand} empty={{ icon: Presentation, title: "No recordings published", body: "Recordings appear here after a session is published.", action: <a href="/resources/webinars" target="_blank" rel="noopener" className={kitOutline}>Public webinars page</a> }} />
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { ScreenHeader, kitOutline } from "@/components/amplivanta/screen-kit";
import { ResourceList, ResourceSearch, resourceCrumbs } from "@/components/amplivanta/resources-ui";
import { matches, publishedResources } from "@/lib/server/resources-hub";

export const metadata: Metadata = { title: "Videos" };

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const videos = publishedResources().filter((e) => e.type === "Video");
  const shown = q ? videos.filter((v) => matches(q, v.title, v.summary, v.topic)) : videos;
  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={resourceCrumbs("Videos")} title="Videos" subtitle="Product walkthroughs and workflow explainers. Only published videos appear here." />
      {videos.length > 0 && <ResourceSearch action="/app/resources/videos" q={q} placeholder="Search videos" />}
      <section className="rounded-xl border border-line bg-white p-5">
        <ResourceList
          entries={shown}
          empty={
            videos.length
              ? { icon: PlayCircle, title: "No videos match", body: "Try different words.", action: <Link href="/app/resources/videos" className="text-[13px] font-semibold text-[#0B5CFF]">Show all videos</Link> }
              : { icon: PlayCircle, title: "No videos published yet", body: "Walkthroughs will appear here when they are published. Setup guides cover the same first steps today.", action: <Link href="/app/resources/guides" className={kitOutline}>Open setup guides</Link> }
          }
        />
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btn } from "@/components/marketing/site-shell";
import { Crumb, Eyebrow, InfoCard, Note } from "@/components/marketing/site-ui";
import { RESOURCE_VIDEOS } from "@/lib/site-resource-items";

const BY_SLUG = new Map(RESOURCE_VIDEOS.map((v) => [v.slug, v]));

export function generateStaticParams() {
  return RESOURCE_VIDEOS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const v = BY_SLUG.get((await params).slug);
  return v ? { title: v.title, description: v.summary } : {};
}

/** Video watch page, on the reference's Video Detail template. */
export default async function VideoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const video = BY_SLUG.get((await params).slug);
  if (!video) notFound();

  const meta = [video.topic, video.durationLabel, video.publishedLabel].filter(Boolean).join(" · ");

  return (
    <>
      <Crumb items={["Home", "Resources", "Videos", "Video"]} />
      <Eyebrow>VIDEO</Eyebrow>
      <h1 className="m-0 mb-3 text-[32px] font-extrabold leading-[1.08] tracking-[-1.2px] text-site-ink sm:text-[42px]">
        {video.title}
      </h1>
      {meta && <p className="m-0 mb-6 text-[13.5px] font-semibold text-site-muted">{meta}</p>}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="aspect-video w-full overflow-hidden rounded-[18px] border border-site-line bg-site-navy">
            <iframe
              src={video.embedUrl}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>

          <section className="mt-8">
            <h2 className="m-0 mb-3 text-[24px] font-extrabold text-site-ink">About this video</h2>
            <p className="m-0 text-[15px] leading-[1.65] text-site-muted">{video.summary}</p>
            {video.chapters && video.chapters.length > 0 && (
              <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-[14px] text-site-ink">
                {video.chapters.map((c) => <li key={c}>{c}</li>)}
              </ol>
            )}
          </section>

          {video.transcript && (
            <details className="mt-6 rounded-2xl border border-site-line bg-white px-5 py-4">
              <summary className="cursor-pointer text-[14px] font-extrabold text-site-ink">Transcript</summary>
              <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.65] text-site-muted">{video.transcript}</p>
            </details>
          )}
        </div>

        <aside className="h-fit space-y-4">
          <InfoCard title="Video options">
            <div className="mt-1 flex flex-col gap-2">
              <Link className={`${btn} px-4 py-[11px] text-[13px]`} href="/resources/videos">All videos</Link>
              <Link className={`${btn} px-4 py-[11px] text-[13px]`} href="/resources/help-center">Help Center</Link>
              <Link className={`${btn} px-4 py-[11px] text-[13px]`} href="/platform">Explore Platform</Link>
            </div>
          </InfoCard>
          <Note>Captions and transcript depend on the tracks published with this video.</Note>
        </aside>
      </div>
    </>
  );
}

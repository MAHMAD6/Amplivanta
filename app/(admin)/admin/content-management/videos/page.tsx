import type { Metadata } from "next";
import { ContentScreen } from "../../content/content-screen";

export const metadata: Metadata = { title: "Videos" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string; edit?: string }> }) {
  const sp = await searchParams;
  return <ContentScreen contentType="video" searchParams={sp} note="Videos carry the same metadata as other content plus a video URL, which is required before publishing." />;
}

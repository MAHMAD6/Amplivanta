import type { Metadata } from "next";
import { ContentScreen } from "../../content/content-screen";

export const metadata: Metadata = { title: "Webinars & Events" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string; edit?: string }> }) {
  const sp = await searchParams;
  return <ContentScreen contentType="webinar" searchParams={sp} note="Registration is off until a registration link is configured. Registration and attendee counts are only shown when a provider reports them." />;
}

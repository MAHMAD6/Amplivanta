import type { Metadata } from "next";
import { ContentScreen } from "../../content/content-screen";

export const metadata: Metadata = { title: "Lead Magnets & Downloads" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string; edit?: string }> }) {
  const sp = await searchParams;
  return <ContentScreen contentType="lead_magnet" searchParams={sp} note="A lead magnet combines content, a downloadable file and a conversion path. Form-required access needs a lead capture form before publishing; direct download is the alternative." />;
}

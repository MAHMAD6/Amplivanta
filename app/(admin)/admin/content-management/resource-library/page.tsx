import type { Metadata } from "next";
import { ContentScreen } from "../../content/content-screen";

export const metadata: Metadata = { title: "Resources & Articles" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string; edit?: string }> }) {
  const sp = await searchParams;
  return <ContentScreen contentType="article" searchParams={sp} note="Resources and articles use the same editor and lifecycle as blog posts, so taxonomy, SEO and scheduling behave identically." />;
}

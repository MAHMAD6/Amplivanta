import type { Metadata } from "next";
import { ContentScreen } from "../../content/content-screen";

export const metadata: Metadata = { title: "Blog Posts" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string; edit?: string }> }) {
  const sp = await searchParams;
  return <ContentScreen contentType="blog_post" searchParams={sp} note="Blog posts share the platform publishing lifecycle: draft, in review, scheduled, published, archived. Published content is versioned before it is overwritten, and an excerpt is required before publishing." />;
}

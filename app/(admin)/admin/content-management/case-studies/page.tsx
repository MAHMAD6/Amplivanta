import type { Metadata } from "next";
import { ContentScreen } from "../../content/content-screen";

export const metadata: Metadata = { title: "Case Studies" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string; edit?: string }> }) {
  const sp = await searchParams;
  return <ContentScreen contentType="case_study" searchParams={sp} note="Case studies follow the shared lifecycle. Nothing is published without an excerpt, and customer proof is never generated." />;
}

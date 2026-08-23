import { MarketingPage } from "@/components/amplivanta/marketing-page";
import { RESOURCE_PAGES } from "@/lib/marketing-modules";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resources — Amplivanta" };
export default function ResourcesPage() { return <MarketingPage {...RESOURCE_PAGES.index} />; }

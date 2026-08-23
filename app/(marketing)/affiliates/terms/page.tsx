import type { Metadata } from "next";
import { LegalDocument } from "@/components/amplivanta/legal-document";
import { LEGAL_DOCS } from "@/lib/legal-docs";

export const metadata: Metadata = { title: "Affiliate Program Terms — Amplivanta" };

export default function AffiliateTermsPage() {
  return <LegalDocument doc={LEGAL_DOCS["affiliate-terms"]} />;
}

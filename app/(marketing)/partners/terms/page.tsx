import type { Metadata } from "next";
import { LegalDocument } from "@/components/amplivanta/legal-document";
import { LEGAL_DOCS } from "@/lib/legal-docs";

export const metadata: Metadata = { title: "Partner Program Terms — Amplivanta" };

export default function PartnerTermsPage() {
  return <LegalDocument doc={LEGAL_DOCS["partner-terms"]} />;
}

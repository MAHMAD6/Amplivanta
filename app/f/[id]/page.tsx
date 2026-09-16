import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseFields } from "@/lib/marketing/logic";
import { LeadForm } from "@/components/amplivanta/public-marketing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Hosted lead capture form, embeddable in an iframe on any site. */
export default async function HostedFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await db.form.findFirst({ where: { id, status: "active" } });
  if (!form) notFound();
  return (
    <main className="min-h-screen bg-transparent p-4">
      <div className="mx-auto max-w-[520px]">
        <LeadForm countView form={{ id: form.id, fields: parseFields(form.fields), submitButtonText: form.submitButtonText, requireConsent: form.requireConsent, consentText: form.consentText, privacyUrl: form.privacyUrl, termsUrl: form.termsUrl }} heading={form.name} />
      </div>
    </main>
  );
}

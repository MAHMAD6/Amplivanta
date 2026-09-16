import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseBlocks } from "@/lib/marketing/blocks";
import { parseFields, parseVariants, pickVariant } from "@/lib/marketing/logic";
import { LandingBlocks } from "@/components/amplivanta/landing-render";
import { ExperimentCookie, VisitBeacon } from "@/components/amplivanta/public-marketing";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ workspace: string; slug: string }> };

async function load(workspace: string, slug: string) {
  const ws = await db.workspace.findUnique({ where: { slug: workspace }, select: { id: true } });
  if (!ws) return null;
  return db.landingPage.findFirst({ where: { workspaceId: ws.id, slug, status: "published" } });
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { workspace, slug } = await params;
  const page = await load(workspace, slug).catch(() => null);
  if (!page) return { title: "Page not found", robots: { index: false } };
  const title = page.metaTitle || page.title;
  return {
    title: { absolute: title },
    description: page.metaDescription ?? undefined,
    openGraph: { title, description: page.metaDescription ?? undefined, images: page.socialImage && /^https:\/\//.test(page.socialImage) ? [page.socialImage] : undefined },
    robots: page.visibility === "unlisted" ? { index: false, follow: false } : undefined,
  };
}

/** Hosted landing page: serves the latest published version, splitting traffic when an A/B test is running. */
export default async function HostedLandingPage({ params }: P) {
  const { workspace, slug } = await params;
  const page = await load(workspace, slug);
  if (!page) notFound();

  let renderId = page.id;
  let experiment: { id: string; variant: string } | undefined;
  const ex = await db.experiment.findFirst({ where: { workspaceId: page.workspaceId, landingPageId: page.id, status: "running" } });
  if (ex) {
    const variants = parseVariants(ex.variants);
    const jar = await cookies();
    const remembered = variants.find((v) => v.key === jar.get(`av_exp_${ex.id}`)?.value);
    const chosen = remembered ?? pickVariant(variants, Math.random());
    if (chosen) {
      const target = await db.landingPage.findFirst({ where: { id: chosen.landingPageId, workspaceId: page.workspaceId, status: { in: ["published", "draft"] } }, select: { id: true } });
      if (target) renderId = target.id;
      experiment = { id: ex.id, variant: chosen.key };
    }
  }

  const version = await db.landingPageVersion.findFirst({ where: { landingPageId: renderId }, orderBy: { version: "desc" } });
  const source = renderId === page.id ? page : await db.landingPage.findUnique({ where: { id: renderId } });
  const blocks = parseBlocks(version?.content ?? source?.content, "page");
  const formId = source?.formId ?? page.formId;
  const form = formId ? await db.form.findFirst({ where: { id: formId, workspaceId: page.workspaceId, status: "active" } }) : null;

  return (
    <main>
      <VisitBeacon pageId={page.id} experimentId={experiment?.id} variant={experiment?.variant} track={page.analyticsEnabled} />
      {experiment && <ExperimentCookie id={experiment.id} variant={experiment.variant} />}
      <LandingBlocks blocks={blocks} pageId={page.id} form={form ? { id: form.id, fields: parseFields(form.fields), submitButtonText: form.submitButtonText, requireConsent: form.requireConsent, consentText: form.consentText, privacyUrl: form.privacyUrl, termsUrl: form.termsUrl } : null} />
    </main>
  );
}

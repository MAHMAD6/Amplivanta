import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const SOURCES = ["direct", "search", "social", "email", "referral", "paid"];

/** Records one landing page visit (sent by the page after it renders). No cookies or IPs are stored. */
export async function POST(req: Request) {
  const rl = await rateLimit(`lpvisit:${clientIp(req)}`, 30, 60);
  if (!rl.ok) return tooMany(rl);
  const b = (await req.json().catch(() => null)) as { pageId?: string; source?: string; device?: string; experimentId?: string; variant?: string } | null;
  if (!b?.pageId || typeof b.pageId !== "string") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const page = await db.landingPage.findFirst({ where: { id: b.pageId, status: "published", analyticsEnabled: true }, select: { id: true, workspaceId: true } });
  if (!page) return NextResponse.json({ ok: true });
  let experimentId: string | null = null;
  let variant: string | null = null;
  if (typeof b.experimentId === "string" && typeof b.variant === "string" && /^[A-D]$/.test(b.variant)) {
    const ex = await db.experiment.findFirst({ where: { id: b.experimentId, workspaceId: page.workspaceId, status: "running" }, select: { id: true } });
    if (ex) {
      experimentId = ex.id;
      variant = b.variant;
    }
  }
  const visit = await db.landingPageVisit.create({
    data: {
      workspaceId: page.workspaceId,
      landingPageId: page.id,
      source: SOURCES.includes(String(b.source)) ? String(b.source) : "direct",
      device: ["desktop", "tablet", "mobile"].includes(String(b.device)) ? String(b.device) : "desktop",
      experimentId,
      variant,
    },
  });
  return NextResponse.json({ ok: true, visitId: visit.id });
}

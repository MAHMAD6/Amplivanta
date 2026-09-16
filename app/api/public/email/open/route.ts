import { db } from "@/lib/db";
import { verify } from "@/lib/marketing/tokens";

export const dynamic = "force-dynamic";

const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

/** Open pixel. Mail clients that pre-fetch images inflate opens; treat as a signal, not a count of readers. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const s = u.searchParams.get("s") ?? "";
  if (s && verify(`open:${s}`, u.searchParams.get("t"))) {
    await db.emailSend.updateMany({ where: { id: s, openedAt: null }, data: { openedAt: new Date() } }).catch(() => null);
  }
  return new Response(GIF, { headers: { "content-type": "image/gif", "cache-control": "no-store" } });
}

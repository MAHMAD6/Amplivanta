import "server-only";
import { prisma } from "@/lib/prisma";

/** Anonymous public-site event counts for the last `days` days. */
export async function loadSiteEvents(days = 30) {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - days);
  try {
    const rows = await prisma.siteEventAggregate.findMany({
      where: { date: { gte: since } },
      orderBy: { count: "desc" },
      take: 500,
      select: { name: true, path: true, count: true },
    });
    return { connected: true, rows };
  } catch {
    return { connected: false, rows: [] as { name: string; path: string; count: number }[] };
  }
}

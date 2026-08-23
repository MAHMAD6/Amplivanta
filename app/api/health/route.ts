import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Liveness + readiness probe for load balancers and uptime monitors.
 * Returns 200 when the database is reachable, 503 otherwise. No auth (safe —
 * exposes only status, not data).
 */
export async function GET() {
  const started = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      db: "up",
      latencyMs: Date.now() - started,
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ status: "degraded", db: "down", time: new Date().toISOString() }, { status: 503 });
  }
}

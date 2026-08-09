import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return Boolean(session?.user);
}

/**
 * Returns a 401 NextResponse when the caller is not authenticated, otherwise null.
 * Usage: const denied = await requireAdmin(); if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const ok = await isAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

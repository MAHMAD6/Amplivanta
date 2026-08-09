import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamSchema } from "@/lib/validations/team";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  const team = await db.teamMember.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(team);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  const member = await db.teamMember.create({ data: parsed.data });
  return NextResponse.json(member, { status: 201 });
}

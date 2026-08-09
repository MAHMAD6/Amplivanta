import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/validations/review";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const approvedOnly = req.nextUrl.searchParams.get("approved") === "true";
  if (approvedOnly) {
    const reviews = await db.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  }
  // Full list is admin-only
  const denied = await requireAdmin();
  if (denied) return denied;
  const reviews = await db.review.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const review = await db.review.create({
      data: { ...parsed.data, isApproved: false, isFeatured: false },
    });
    return NextResponse.json({ success: true, id: review.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

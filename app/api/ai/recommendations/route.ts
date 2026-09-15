import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, route, requireRole } from "@/lib/tenant";
import { runAiTask } from "@/lib/ai";

// POST /api/ai/recommendations — analyze workspace facts and persist validated recommendations.
export const POST = route(
  async (ctx) => {
    requireRole(ctx, "EDITOR");

    // Minimum necessary context: aggregate counts only, no contact records.
    const [contacts, deals, campaigns] = await Promise.all([
      db.contact.count({ where: { workspaceId: ctx.workspaceId } }),
      db.deal.aggregate({ where: { workspaceId: ctx.workspaceId }, _sum: { value: true }, _count: true }),
      db.campaign.count({ where: { workspaceId: ctx.workspaceId } }),
    ]);
    const prompt = `Workspace facts: ${contacts} contacts; ${deals._count} deals with a combined pipeline value of $${deals._sum.value ?? 0}; ${campaigns} campaigns.`;

    const result = await runAiTask({ workspaceId: ctx.workspaceId, userId: ctx.userId }, "growth_recommendations", { prompt });
    if (!result.ok) throw new ApiError(result.errorClass === "insufficient_credits" ? 402 : 503, result.error);

    const created = await db.$transaction(
      result.value.recommendations.map((r) =>
        db.recommendation.create({
          data: {
            workspaceId: ctx.workspaceId,
            title: r.title,
            body: r.body,
            category: r.category,
            impact: r.impact.toLowerCase(),
            confidence: r.confidence,
            status: "new",
          },
        }),
      ),
    );
    return NextResponse.json({ recommendations: created, live: true }, { status: 201 });
  },
  { limit: 20, windowSec: 3600 },
);

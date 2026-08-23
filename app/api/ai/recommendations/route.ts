import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { route, requireRole } from "@/lib/tenant";
import { generateRecommendations, isAiConfigured } from "@/lib/ai";

// POST /api/ai/recommendations — analyze the workspace and persist fresh recommendations.
export const POST = route(async (ctx) => {
  requireRole(ctx, "EDITOR");

  // Summarize the workspace as context for the model.
  const [contacts, deals, campaigns] = await Promise.all([
    db.contact.count({ where: { workspaceId: ctx.workspaceId } }),
    db.deal.aggregate({ where: { workspaceId: ctx.workspaceId }, _sum: { value: true }, _count: true }),
    db.campaign.count({ where: { workspaceId: ctx.workspaceId } }),
  ]);
  const context = `Workspace has ${contacts} contacts, ${deals._count} deals worth $${
    deals._sum.value ?? 0
  } in pipeline, and ${campaigns} campaigns. Recommend growth actions.`;

  const recs = await generateRecommendations(context);
  const created = await db.$transaction(
    recs.map((r) =>
      db.recommendation.create({
        data: {
          workspaceId: ctx.workspaceId,
          title: r.title,
          body: r.body,
          category: r.category,
          impact: r.impact,
          confidence: r.confidence,
          status: "new",
        },
      }),
    ),
  );
  return NextResponse.json({ recommendations: created, live: isAiConfigured() }, { status: 201 });
});

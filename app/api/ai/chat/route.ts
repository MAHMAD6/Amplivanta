import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError, route, parseBody } from "@/lib/tenant";
import { isAiConfigured, runAiTask } from "@/lib/ai";

const schema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
});

// POST /api/ai/chat — Ask AI Advisor through the AI Gateway. Persists the conversation.
export const POST = route(
  async (ctx, req) => {
    const { message, conversationId } = await parseBody(req, schema);
    if (!isAiConfigured()) throw new ApiError(503, "AI Advisor is not available yet.");

    let aiWorkspace = await db.aiWorkspace.findFirst({ where: { workspaceId: ctx.workspaceId } });
    if (!aiWorkspace) {
      aiWorkspace = await db.aiWorkspace.create({ data: { workspaceId: ctx.workspaceId, name: "Default" } });
    }
    let conversation = conversationId
      ? await db.aiConversation.findFirst({ where: { id: conversationId, aiWorkspaceId: aiWorkspace.id } })
      : null;

    // Recent turns of this conversation only — no other workspace data is sent.
    const history = conversation
      ? await db.aiMessage.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: "desc" }, take: 8, select: { role: true, content: true } })
      : [];
    const prompt = [
      ...history.reverse().map((m) => `${m.role === "user" ? "User" : "Advisor"}: ${m.content.slice(0, 2000)}`),
      `User: ${message}`,
    ].join("\n\n");

    const result = await runAiTask({ workspaceId: ctx.workspaceId, userId: ctx.userId }, "advisor_chat", { prompt, moderationText: message });
    if (!result.ok) {
      throw new ApiError(result.errorClass === "insufficient_credits" ? 402 : result.errorClass === "moderation_block" ? 422 : 503, result.error);
    }

    if (!conversation) {
      conversation = await db.aiConversation.create({ data: { aiWorkspaceId: aiWorkspace.id, title: message.slice(0, 60) } });
    }
    await db.aiMessage.create({ data: { conversationId: conversation.id, role: "user", content: message } });
    await db.aiMessage.create({ data: { conversationId: conversation.id, role: "assistant", content: result.value, model: result.model } });

    return NextResponse.json({ conversationId: conversation.id, reply: result.value, model: result.model, live: true });
  },
  { limit: 60, windowSec: 3600 },
);

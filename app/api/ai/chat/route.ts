import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody } from "@/lib/tenant";
import { complete, isAiConfigured } from "@/lib/ai";

const schema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
});

// POST /api/ai/chat — Ask AI Advisor. Persists the conversation + usage.
export const POST = route(async (ctx, req) => {
  const { message, conversationId } = await parseBody(req, schema);

  // Ensure an AI workspace + conversation exist.
  let aiWorkspace = await db.aiWorkspace.findFirst({ where: { workspaceId: ctx.workspaceId } });
  if (!aiWorkspace) {
    aiWorkspace = await db.aiWorkspace.create({ data: { workspaceId: ctx.workspaceId, name: "Default" } });
  }
  let conversation = conversationId
    ? await db.aiConversation.findFirst({ where: { id: conversationId, aiWorkspaceId: aiWorkspace.id } })
    : null;
  if (!conversation) {
    conversation = await db.aiConversation.create({
      data: { aiWorkspaceId: aiWorkspace.id, title: message.slice(0, 60) },
    });
  }

  await db.aiMessage.create({ data: { conversationId: conversation.id, role: "user", content: message } });

  const result = await complete({
    system: "You are Amplivanta's AI growth advisor. Be specific, concise, and action-oriented.",
    prompt: message,
  });

  await db.aiMessage.create({
    data: { conversationId: conversation.id, role: "assistant", content: result.text, model: result.model },
  });
  await db.aiUsage.create({
    data: { workspaceId: ctx.workspaceId, model: result.model, tokensIn: result.tokensIn, tokensOut: result.tokensOut },
  });

  return NextResponse.json({
    conversationId: conversation.id,
    reply: result.text,
    model: result.model,
    live: isAiConfigured(),
  });
});

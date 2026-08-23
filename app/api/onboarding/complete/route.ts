import { NextResponse } from "next/server";
import { z } from "zod";
import { route, parseBody } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";

const schema = z.object({
  accountType: z.enum(["Individual", "Company"]).optional(),
  goals: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
});

// POST — records onboarding completion as an audit event and returns ok.
// (No dedicated onboarding table in the schema; completion is captured in the
// append-only audit log so it surfaces on the Audit Log page.)
export const POST = route(async (ctx, req) => {
  const data = await parseBody(req, schema);
  await writeAudit(ctx, "onboarding.completed", {
    resourceType: "Workspace",
    resourceId: ctx.workspaceId,
    metadata: {
      accountType: data.accountType ?? "Individual",
      goals: data.goals ?? [],
      channels: data.channels ?? [],
    },
  });
  return NextResponse.json({ ok: true });
});

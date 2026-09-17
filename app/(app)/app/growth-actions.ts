"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/lib/tenant";
import { recalculateGrowthScore } from "@/lib/server/growth-score";

type Result = { ok: true; message: string } | { ok: false; error: string };

/** Recalculates the Growth Score and refreshes detected opportunities. */
export async function recalculateGrowth(): Promise<Result> {
  let ctx;
  try {
    ctx = await getSessionContext();
  } catch {
    return { ok: false, error: "Sign in to a workspace to recalculate the Growth Score." };
  }
  if (ctx.workspaceRole === "VIEWER") return { ok: false, error: "Viewers cannot recalculate the Growth Score." };
  try {
    const view = await recalculateGrowthScore(ctx.workspaceId, ctx.userId);
    revalidatePath("/app", "layout");
    return {
      ok: true,
      message: view.score.status === "scored" ? `Growth Score recalculated: ${view.score.score}` : "Recalculated — not enough connected data to score yet",
    };
  } catch {
    return { ok: false, error: "The Growth Score could not be recalculated right now." };
  }
}

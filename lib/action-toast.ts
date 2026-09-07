import { toast } from "@/lib/toast";

/**
 * Standard shape returned by every server action in this codebase.
 */
export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/**
 * Report a server action's outcome as a toast.
 *
 * Every write flow surfaces its result the same way, so a failure is never
 * silent and never depends on the reader still looking at the part of the page
 * that held an inline banner. Returns whether the action succeeded, so callers
 * can branch without re-reading `res.ok`.
 */
export function toastResult(res: ActionResult): boolean {
  if (res.ok) toast.success(res.message);
  else toast.error(res.error);
  return res.ok;
}

/**
 * A condition the reader should notice but which is not a failure — a disabled
 * feature, a missing prerequisite, an action that did nothing.
 */
export function toastWarning(title: string, description?: string) {
  toast.warning(title, description ? { description } : undefined);
}

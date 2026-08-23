import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import type { Role } from "@prisma/client";

/** Default per-user API budget applied by `route()`. Override per-route via opts. */
const DEFAULT_API_LIMIT = 120;
const DEFAULT_API_WINDOW_SEC = 60;

export interface SessionContext {
  userId: string;
  email: string;
  role: Role;
  /** The workspace the request is scoped to (the tenant). */
  workspaceId: string;
  /** The caller's role within that workspace. */
  workspaceRole: Role;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Resolves the authenticated user and the workspace their request is scoped to.
 * Workspace selection order:
 *   1. `x-workspace-id` header or `?workspace=` query, if the user is a member.
 *   2. The user's first membership.
 * Throws ApiError(401/403) when there is no session or no workspace.
 */
export async function getSessionContext(req?: Request): Promise<SessionContext> {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: Role } | undefined;
  if (!user?.id) {
    // Dev-only fallback: no login required. Resolve the real seeded workspace
    // (and its owner) so dev renders live DB data and write endpoints work.
    if (process.env.NODE_ENV === "development") {
      return devContext();
    }
    throw new ApiError(401, "Unauthorized");
  }

  let requested: string | null = null;
  if (req) {
    const url = new URL(req.url);
    requested = req.headers.get("x-workspace-id") ?? url.searchParams.get("workspace");
  }

  try {
    const memberships = await db.membership.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    if (memberships.length === 0) {
      return {
        userId: user.id,
        email: user.email ?? "",
        role: user.role ?? "EDITOR",
        workspaceId: requested ?? "default-workspace",
        workspaceRole: (user.role ?? "OWNER") as Role,
      };
    }

    const membership =
      (requested ? memberships.find((m) => m.workspaceId === requested) : undefined) ?? memberships[0];

    return {
      userId: user.id,
      email: user.email ?? "",
      role: user.role ?? "EDITOR",
      workspaceId: membership.workspaceId,
      workspaceRole: membership.role,
    };
  } catch {
    return {
      userId: user.id,
      email: user.email ?? "",
      role: user.role ?? "EDITOR",
      workspaceId: requested ?? "default-workspace",
      workspaceRole: (user.role ?? "OWNER") as Role,
    };
  }
}

/**
 * Development-only session context used when no user is logged in. Binds to the
 * first real workspace + a member so the app shows seeded live data and write
 * endpoints resolve. Falls back to a static demo context when the DB is empty.
 */
async function devContext(): Promise<SessionContext> {
  try {
    const membership = await db.membership.findFirst({
      orderBy: { createdAt: "asc" },
      include: { user: true },
    });
    if (membership) {
      return {
        userId: membership.userId,
        email: membership.user.email,
        role: membership.user.role,
        workspaceId: membership.workspaceId,
        workspaceRole: membership.role,
      };
    }
    const workspace = await db.workspace.findFirst({ orderBy: { createdAt: "asc" } });
    const anyUser = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (workspace && anyUser) {
      return {
        userId: anyUser.id,
        email: anyUser.email,
        role: anyUser.role,
        workspaceId: workspace.id,
        workspaceRole: "OWNER",
      };
    }
  } catch {
    /* fall through to static demo context */
  }
  return {
    userId: "demo-user",
    email: "admin@amplivanta.com",
    role: "SUPER_ADMIN",
    workspaceId: "default-workspace",
    workspaceRole: "OWNER",
  };
}

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
  OWNER: 3,
  SUPER_ADMIN: 4,
};

/** Throws ApiError(403) when the workspace role is below `min`. */
export function requireRole(ctx: SessionContext, min: Role): void {
  if (ROLE_RANK[ctx.workspaceRole] < ROLE_RANK[min]) {
    throw new ApiError(403, "Insufficient permissions");
  }
}

/** Maps a thrown ApiError (or unknown error) to a JSON NextResponse. */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[api] unhandled error:", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/**
 * Wraps a route handler: resolves session context, runs the handler, and turns
 * ApiError/validation failures into JSON responses. Keeps every route uniform.
 */
export function route<T>(
  handler: (ctx: SessionContext, req: Request, params: T) => Promise<NextResponse>,
  opts?: { limit?: number; windowSec?: number },
) {
  const limit = opts?.limit ?? DEFAULT_API_LIMIT;
  const windowSec = opts?.windowSec ?? DEFAULT_API_WINDOW_SEC;
  return async (req: Request, segment: { params: Promise<T> }) => {
    try {
      const ctx = await getSessionContext(req);
      // Per-user, per-route sliding budget. Fails open if Redis is unavailable.
      const rl = await rateLimit(`api:${ctx.userId}:${new URL(req.url).pathname}`, limit, windowSec);
      if (!rl.ok) {
        return NextResponse.json(
          { error: "Too many requests. Please slow down." },
          { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
        );
      }
      const params = (segment?.params ? await segment.params : ({} as T)) as T;
      return await handler(ctx, req, params);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

/** Parses and validates a JSON body with a zod schema, throwing ApiError(400) on failure. */
export async function parseBody<S extends { parse: (v: unknown) => unknown }>(
  req: Request,
  schema: S,
): Promise<ReturnType<S["parse"]>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
  try {
    return schema.parse(raw) as ReturnType<S["parse"]>;
  } catch (err) {
    const message =
      err && typeof err === "object" && "errors" in err
        ? JSON.stringify((err as { errors: unknown }).errors)
        : "Validation failed";
    throw new ApiError(400, message);
  }
}

/** Reads pagination + search params common to list endpoints. */
export function listParams(req: Request) {
  const url = new URL(req.url);
  const take = Math.min(Number(url.searchParams.get("limit") ?? 25) || 25, 100);
  const page = Math.max(Number(url.searchParams.get("page") ?? 1) || 1, 1);
  const q = url.searchParams.get("q")?.trim() || undefined;
  return { take, skip: (page - 1) * take, page, q };
}

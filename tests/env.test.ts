import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateEnv } from "@/lib/env";

const KEYS = ["DATABASE_URL", "AUTH_SECRET", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "BETTER_AUTH_URL", "NEXT_PUBLIC_SITE_URL", "REDIS_URL"];

describe("validateEnv", () => {
  let saved: Record<string, string | undefined>;

  beforeEach(() => {
    saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
    for (const k of KEYS) delete process.env[k];
  });
  afterEach(() => {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("fails when DATABASE_URL is missing", () => {
    const r = validateEnv();
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("DATABASE_URL"))).toBe(true);
  });

  it("fails when neither AUTH_SECRET nor NEXTAUTH_SECRET is set", () => {
    process.env.DATABASE_URL = "postgresql://x";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    const r = validateEnv();
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("AUTH_SECRET"))).toBe(true);
  });

  it("passes when required vars are present", () => {
    process.env.DATABASE_URL = "postgresql://x";
    process.env.AUTH_SECRET = "a".repeat(40);
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    const r = validateEnv();
    expect(r.ok).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it("warns on a short secret", () => {
    process.env.DATABASE_URL = "postgresql://x";
    process.env.AUTH_SECRET = "short";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    const r = validateEnv();
    expect(r.warnings.some((w) => w.includes("32 characters"))).toBe(true);
  });
});

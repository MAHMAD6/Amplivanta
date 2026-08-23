/**
 * Runtime environment validation. Import for its side effect early in the server
 * lifecycle (see instrumentation.ts). In production, missing REQUIRED vars throw
 * immediately with a clear message so a misconfigured deploy fails fast instead
 * of erroring deep in a request. In dev, problems are warnings only.
 */

const REQUIRED = ["DATABASE_URL"] as const;
// Either of each pair must be present.
const REQUIRED_EITHER: [string, string][] = [
  ["AUTH_SECRET", "NEXTAUTH_SECRET"],
  ["NEXTAUTH_URL", "BETTER_AUTH_URL"],
];
// Recommended in production; warn if absent.
const RECOMMENDED = ["NEXT_PUBLIC_SITE_URL", "REDIS_URL"] as const;

function present(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

export function validateEnv(): { ok: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const name of REQUIRED) if (!present(name)) errors.push(`Missing required env: ${name}`);
  for (const [a, b] of REQUIRED_EITHER) if (!present(a) && !present(b)) errors.push(`Missing required env: one of ${a} or ${b}`);

  if (present("AUTH_SECRET") || present("NEXTAUTH_SECRET")) {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
    if (secret.length < 32) warnings.push("AUTH_SECRET/NEXTAUTH_SECRET should be at least 32 characters.");
  }
  for (const name of RECOMMENDED) if (!present(name)) warnings.push(`Recommended env not set: ${name}`);

  return { ok: errors.length === 0, errors, warnings };
}

/** Throws in production when required env is missing; logs warnings always. */
export function assertEnv(): void {
  const { ok, errors, warnings } = validateEnv();
  const isProd = process.env.NODE_ENV === "production";
  for (const w of warnings) console.warn(`[env] ${w}`);
  if (!ok) {
    for (const e of errors) console.error(`[env] ${e}`);
    if (isProd) throw new Error(`Invalid environment: ${errors.join("; ")}`);
  }
}

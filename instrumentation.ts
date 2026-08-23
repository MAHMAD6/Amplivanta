/**
 * Next.js calls register() once when the server process boots. We use it to
 * fail fast on invalid environment configuration in production.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertEnv } = await import("@/lib/env");
    assertEnv();
  }
}

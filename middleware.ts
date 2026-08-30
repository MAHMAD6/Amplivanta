import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight edge gate for the authenticated surfaces: /admin, /app, /super.
 * It only checks for the presence of an Auth.js session cookie (edge-safe);
 * the authoritative session + role checks run in each group's server layout.
 */
const PROTECTED = ["/admin", "/app", "/super"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dev keeps the demo surfaces open without login (matches the layout guards).
  if (process.env.NODE_ENV === "development") return NextResponse.next();

  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!needsAuth) return NextResponse.next();

  const hasSession =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    // Behind a reverse proxy the standalone server's own origin is internal
    // (e.g. localhost:3100), so build the redirect from the proxy's forwarded
    // host/proto, falling back to the Host header, then the request origin.
    const fwdHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const fwdProto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
    const base = fwdHost ? `${fwdProto}://${fwdHost}` : req.nextUrl.origin;
    const url = new URL("/login", base);
    // Preserve the requested path (incl. query) so the sign-in form can send
    // the user back to it. Param name `next` matches the layout guards + form.
    const nextPath = pathname + req.nextUrl.search;
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/app/:path*", "/super/:path*"],
};

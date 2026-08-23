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
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/app/:path*", "/super/:path*"],
};

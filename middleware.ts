import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight edge gate: redirects unauthenticated users away from /admin/*.
 * It only checks for the presence of an Auth.js session cookie (edge-safe).
 * The authoritative session check runs in the (admin) layout on the server.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasSession =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  if (pathname.startsWith("/admin") && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

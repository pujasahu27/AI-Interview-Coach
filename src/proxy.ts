import { NextRequest, NextResponse } from "next/server";

// This Next.js version replaces middleware.ts with proxy.ts (export named
// `proxy`, always runs on the nodejs runtime). This check is intentionally
// optimistic (cookie presence only) — real verification happens via
// getCurrentUser()/requireUser() in lib/session.ts on every protected page
// and API route.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/interview",
  "/history",
  "/profile",
  "/paywall",
];
const SESSION_COOKIE_NAME = "session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/login" && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

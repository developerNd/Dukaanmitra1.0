import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session_token")?.value;

  // Paths that are publicly accessible
  const isPublicPath = pathname === "/login";

  // Exclude Next.js internals, favicon, and auth api routes
  const isAssetOrAuthApi =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth");

  if (isAssetOrAuthApi) {
    return NextResponse.next();
  }

  // Redirect unauthenticated requests to login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect logged-in users away from the login page to dashboard
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply proxy to all matching paths except API auth and static files
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

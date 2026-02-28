import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Allow all auth-related routes to pass through
  if (
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/auth/")
  ) {
    return NextResponse.next();
  }

  // Protected admin routes - check for token
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("view", "sign-in");
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    // Token exists - let it through
    // Client-side code will handle refresh if token is expired
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};

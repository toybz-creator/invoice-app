import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionCookieName } from "@/lib/appwrite/session-cookie";

const protectedRoutes = ["/dashboard", "/invoices"];
const authRoutes = ["/forgot-password", "/login", "/signup"];

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSession = Boolean(
    request.cookies.get(
      getSessionCookieName(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID),
    )?.value,
  );

  if (isRouteMatch(pathname, protectedRoutes) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isRouteMatch(pathname, authRoutes) && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/invoices/:path*", "/login", "/signup"],
};

import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.[^/]+$/.test(pathname);

  if (isStaticAsset) {
    return NextResponse.next();
  }

  const token = request.cookies.get("docman_token")?.value;
  const isPublicPath = PUBLIC_PATHS.has(pathname);

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

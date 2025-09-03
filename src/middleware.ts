import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/api/admin") ||
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    if (
      request.nextUrl.pathname === "/api/admin/login" ||
      request.nextUrl.pathname === "/admin"
    ) {
      return NextResponse.next();
    }
    const admin = request.cookies.get("admin")?.value === "1";
    if (!admin) {
      if (request.nextUrl.pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    // 1. Define pages accessible by anyone without signing in
    const isHomePage = pathname === "/";
    const isAuthPage = pathname.startsWith("/auth");
    const isPublicPage = isHomePage || isAuthPage;

    // 2. If trying to access ANY protected page without a token -> Redirect to signin
    if (!token && !isPublicPage) {
        return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // 3. If already logged in and visiting signin/signup -> Redirect to workspaces
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL("/workspaces", request.url));
    }

    return NextResponse.next();
}

// Match all routes EXCEPT static assets, images, favicon, and API routes
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
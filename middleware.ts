import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Define public routes that don't require authentication
const publicRoutes = [
    "/auth/login",
    "/auth/signup",
    "/auth/error",
    "/api/auth", // NextAuth API routes
];

// Define routes that should redirect to login if not authenticated
const protectedRoutes = ["/", "/config", "/profile", "/settings"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static files and API routes (except auth)
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Check authentication for protected routes
    if (
        protectedRoutes.some(
            (route) => pathname === route || pathname.startsWith(route + "/")
        )
    ) {
        try {
            const session = await auth();

            if (!session || !session.user) {
                // Redirect to login with callback URL
                const loginUrl = new URL("/auth/login", request.url);
                loginUrl.searchParams.set("callbackUrl", pathname);
                return NextResponse.redirect(loginUrl);
            }

            // User is authenticated, continue
            return NextResponse.next();
        } catch (error) {
            console.error("Middleware auth error:", error);
            // Redirect to login on auth error
            const loginUrl = new URL("/auth/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // For all other routes, continue
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};

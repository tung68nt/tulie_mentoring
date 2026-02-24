import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isPublicRoute = ["/login", "/register", "/"].includes(nextUrl.pathname) || nextUrl.pathname.startsWith("/.well-known");
    const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/", nextUrl));
        }
        return NextResponse.next();
    }

    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);

        return NextResponse.redirect(
            new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
        );
    }

    // Role-based access control (admin can access everything)
    if (isLoggedIn) {
        const role = req.auth?.user?.role;

        // Admin can access all routes
        if (role === "admin") {
            return NextResponse.next();
        }

        if (nextUrl.pathname.startsWith("/admin") && role !== "admin") {
            return NextResponse.redirect(new URL("/", nextUrl));
        }
        // Use exact prefix check with trailing slash or end-of-string
        // to avoid /mentees being blocked for mentors
        if (nextUrl.pathname.startsWith("/mentor") && !nextUrl.pathname.startsWith("/mentees") && role !== "mentor" && role !== "admin") {
            return NextResponse.redirect(new URL("/", nextUrl));
        }
        if ((nextUrl.pathname === "/mentee" || nextUrl.pathname.startsWith("/mentee/")) && role !== "mentee") {
            return NextResponse.redirect(new URL("/", nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

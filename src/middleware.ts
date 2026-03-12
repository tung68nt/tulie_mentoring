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

        // Admin, Program Manager, and Manager can access admin routes
        const isAdminOrPMOrManager = role === "admin" || role === "program_manager" || role === "manager";
        
        if (nextUrl.pathname.startsWith("/admin") && !isAdminOrPMOrManager) {
            return NextResponse.redirect(new URL("/", nextUrl));
        }

        if (nextUrl.pathname.startsWith("/program-manager") && !isAdminOrPMOrManager) {
            return NextResponse.redirect(new URL("/", nextUrl));
        }

        if (nextUrl.pathname.startsWith("/facilitator") && role !== "facilitator" && role !== "admin") {
            return NextResponse.redirect(new URL("/", nextUrl));
        }
        
        // SECURITY: Use exact prefix check to avoid /mentoring or /mentor-guide being caught
        if ((nextUrl.pathname === "/mentor" || nextUrl.pathname.startsWith("/mentor/")) && !nextUrl.pathname.startsWith("/mentees") && role !== "mentor" && role !== "admin") {
            return NextResponse.redirect(new URL("/", nextUrl));
        }

        if ((nextUrl.pathname === "/mentee" || nextUrl.pathname.startsWith("/mentee/")) && role !== "mentee" && role !== "admin") {
            return NextResponse.redirect(new URL("/", nextUrl));
        }

        // Manager access control
        const managerAllowedRoutes = ["/reports", "/mentees", "/calendar", "/wiki", "/whiteboard", "/slides", "/tickets", "/portfolio", "/admin", "/manager"];
        const isManagerTargetRoute = managerAllowedRoutes.some(route => nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/"));

        if (role === "manager") {
            if (!isManagerTargetRoute && nextUrl.pathname !== "/" && nextUrl.pathname !== "/profile") {
                return NextResponse.redirect(new URL("/manager", nextUrl));
            }
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

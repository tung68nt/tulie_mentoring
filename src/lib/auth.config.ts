import type { NextAuthConfig } from "next-auth";

// This is the Edge-compatible part of the auth config
export const authConfig = {
    providers: [], // Providers are defined in auth.ts
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/admin") ||
                nextUrl.pathname.startsWith("/mentor") ||
                nextUrl.pathname.startsWith("/mentee") ||
                nextUrl.pathname.startsWith("/calendar") ||
                nextUrl.pathname.startsWith("/goals") ||
                nextUrl.pathname.startsWith("/portfolio") ||
                nextUrl.pathname.startsWith("/feedback") ||
                nextUrl.pathname.startsWith("/resources") ||
                nextUrl.pathname.startsWith("/profile");

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
            }
            // Handle session updates
            if (trigger === "update" && session) {
                token.role = session.role || token.role;
                token.firstName = session.firstName || token.firstName;
                token.lastName = session.lastName || token.lastName;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
                (session.user as any).firstName = token.firstName;
                (session.user as any).lastName = token.lastName;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
} satisfies NextAuthConfig;

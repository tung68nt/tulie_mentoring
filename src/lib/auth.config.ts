import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./validators";
import bcrypt from "bcryptjs";

// This is the Edge-compatible part of the auth config
export const authConfig = {
    providers: [
        Credentials({
            async authorize(credentials) {
                const validatedData = loginSchema.safeParse(credentials);

                if (!validatedData.success) return null;

                // Note: Database check MUST happen in auth.ts (Node context)
                // because middleware cannot import Prisma/better-sqlite3.
                // However, NextAuth v5 handles this by having the authorize
                // function run in a Node.js context for the Credentials provider
                // UNLESS middleware itself triggers it. 
                // In practice, we'll keep the logic in auth.ts for authorize.
                return null; // Placeholder, real logic stays in auth.ts
            },
        }),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/admin") ||
                nextUrl.pathname.startsWith("/mentor") ||
                nextUrl.pathname.startsWith("/mentee");

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
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

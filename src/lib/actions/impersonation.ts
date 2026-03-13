"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

const COOKIE_NAME = "impersonateUserId";
const COOKIE_MAX_AGE = 60 * 60 * 2; // 2 hours max

/**
 * Start impersonating a user. Only admin/program_manager can use this.
 */
export async function startImpersonation(targetUserId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    if (!["admin", "program_manager"].includes(role)) {
        throw new Error("Permission denied: Only admin can impersonate");
    }

    // Validate target user exists
    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, firstName: true, lastName: true, role: true },
    });

    if (!targetUser) throw new Error("User not found");

    // Don't impersonate yourself
    if (targetUser.id === session.user.id) {
        throw new Error("Cannot impersonate yourself");
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, targetUserId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });

    return { success: true, user: targetUser };
}

/**
 * Stop impersonating and return to admin view.
 */
export async function stopImpersonation() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

/**
 * Get the currently impersonated user (if any).
 * Returns null if not impersonating.
 */
export async function getImpersonatedUser() {
    const session = await auth();
    if (!session?.user) return null;

    const role = (session.user as any).role;
    if (!["admin", "program_manager"].includes(role)) return null;

    const cookieStore = await cookies();
    const targetUserId = cookieStore.get(COOKIE_NAME)?.value;

    if (!targetUserId) return null;

    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            image: true,
            isActive: true,
        },
    });

    if (!targetUser) {
        // User was deleted, clear cookie
        cookieStore.delete(COOKIE_NAME);
        return null;
    }

    return targetUser;
}

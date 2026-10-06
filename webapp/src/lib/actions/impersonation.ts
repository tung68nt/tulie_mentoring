"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const COOKIE_NAME = "impersonateUserId";
const COOKIE_MAX_AGE = 60 * 60 * 4; // 4 hours

/**
 * Helper to identify if current session belongs to a real admin or program manager
 */
function getRealAdminRole(session: any): string | null {
    if (!session) return null;
    const realRole = session.realRole || session.realAdmin?.role;
    if (realRole && ["admin", "program_manager"].includes(realRole)) {
        return realRole;
    }
    const currentRole = (session.user as any)?.role;
    if (currentRole && ["admin", "program_manager"].includes(currentRole)) {
        return currentRole;
    }
    return null;
}

/**
 * Start impersonating a user. Only admin/program_manager can use this.
 */
export async function startImpersonation(targetUserId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Chưa đăng nhập");

    const realRole = getRealAdminRole(session);
    if (!realRole) {
        throw new Error("Không có quyền: Chỉ Master Admin mới có thể đóng vai");
    }

    const realAdminId = (session as any).realAdmin?.id || (session as any).realAdminId || session.user.id;

    // If trying to impersonate own real account, simply stop impersonating
    if (targetUserId === realAdminId) {
        return stopImpersonation();
    }

    // Validate target user exists
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

    if (!targetUser) throw new Error("Không tìm thấy người dùng này");

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, targetUserId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });

    revalidatePath("/", "layout");

    // Suggest suitable landing page based on target role
    let redirectUrl = "/dashboard";
    if (targetUser.role === "mentee") {
        redirectUrl = "/mentee";
    } else if (targetUser.role === "mentor") {
        redirectUrl = "/mentor";
    } else if (targetUser.role === "admin") {
        redirectUrl = "/admin";
    }

    return {
        success: true,
        user: targetUser,
        redirectUrl,
    };
}

/**
 * Stop impersonating and return to admin view.
 */
export async function stopImpersonation() {
    const session = await auth();
    const realRole = getRealAdminRole(session);
    if (!realRole) {
        throw new Error("Không có quyền dừng đóng vai");
    }

    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);

    revalidatePath("/", "layout");

    return {
        success: true,
        redirectUrl: "/admin/users",
    };
}

/**
 * Get the currently impersonated user (if any).
 * Returns null if not impersonating.
 */
export async function getImpersonatedUser() {
    const session = await auth();
    if (!session?.user) return null;

    const realRole = getRealAdminRole(session);
    if (!realRole) return null;

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

    const realAdmin = (session as any).realAdmin || {
        id: session.user.id,
        firstName: (session.user as any).firstName || "Admin",
        lastName: (session.user as any).lastName || "",
        email: session.user.email,
        role: realRole,
    };

    return {
        ...targetUser,
        realAdmin,
    };
}

/**
 * Get users list for quick switcher modal (Admin only)
 */
export async function getUsersForSwitcher(search?: string, roleFilter?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Chưa đăng nhập");

    const realRole = getRealAdminRole(session);
    if (!realRole) {
        throw new Error("Chỉ quản trị viên mới có thể truy cập danh sách này");
    }

    const where: any = {};

    if (roleFilter && roleFilter !== "all") {
        where.role = roleFilter;
    }

    if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
        ];
    }

    const users = await prisma.user.findMany({
        where,
        take: 30,
        orderBy: [
            { role: "asc" },
            { lastName: "asc" },
            { firstName: "asc" },
        ],
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            image: true,
            isActive: true,
            menteeProfile: {
                select: {
                    major: true,
                    isOnboardingComplete: true,
                    personalityType: true,
                },
            },
            mentorProfile: {
                select: {
                    company: true,
                    jobTitle: true,
                },
            },
        },
    });

    return users;
}

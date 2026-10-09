"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function logActivity(
    action: string,
    entityId?: string,
    entityType?: string,
    metadata?: any
) {
    const session = await auth();
    if (!session?.user) return; // Silent return for background logging

    try {
        await prisma.activityLog.create({
            data: {
                userId: session.user.id!,
                action,
                entityId,
                entityType,
                metadata: metadata ? JSON.stringify(metadata) : null,
            },
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}

export async function getActivityLogs(limit = 10, targetUserId?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    const isAdmin = role === "admin" || role === "manager";

    if (targetUserId && !isAdmin && targetUserId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    const userId = targetUserId || session.user.id;
    if (!userId && !isAdmin) return [];

    const where = (isAdmin && !targetUserId)
        ? {}
        : { userId: userId! };

    const logs = await prisma.activityLog.findMany({
        where,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                }
            }
        },
        take: limit,
    });

    return JSON.parse(JSON.stringify(logs));
}

const PAGE_VIEW_THROTTLE_MS = 5 * 60_000;

/** Ghi nhận lượt xem trang (throttle 5 phút/đường dẫn) để phân tích tần suất truy cập. */
export async function trackPageView(path: string) {
    const session = await auth();
    if (!session?.user?.id) return;
    if (typeof path !== "string" || !path.startsWith("/") || path.length > 200) return;
    // Chuẩn hoá: bỏ query, thay id dài bằng :id để gom nhóm
    const clean = path.split("?")[0].replace(/\/[a-z0-9]{20,}(?=\/|$)/gi, "/:id");

    try {
        const recent = await prisma.activityLog.findFirst({
            where: {
                userId: session.user.id, action: "page_view", entityId: clean,
                createdAt: { gte: new Date(Date.now() - PAGE_VIEW_THROTTLE_MS) },
            },
            select: { id: true },
        });
        if (recent) return;
        await prisma.activityLog.create({
            data: { userId: session.user.id, action: "page_view", entityType: "page", entityId: clean },
        });
    } catch {
        // không để lỗi log ảnh hưởng người dùng
    }
}

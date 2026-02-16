"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications(limit = 20) {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Safety guard: Ensure the ID format is supported by Prisma (CUID/UUID)
    // If it's a long number-only string (Google ID) that hasn't been synced yet, 
    // we return empty instead of letting Prisma crash.
    if (!session.user.id.match(/^[a-z0-9]+$/i)) {
        return [];
    }

    try {
        return await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    } catch (e) {
        console.error("Prisma error in getNotifications:", e);
        return [];
    }
}

export async function getUnreadCount() {
    const session = await auth();
    if (!session?.user?.id) return 0;

    if (!session.user.id.match(/^[a-z0-9]+$/i)) {
        return 0;
    }

    try {
        return await prisma.notification.count({
            where: { userId: session.user.id, isRead: false },
        });
    } catch (e) {
        console.error("Prisma error in getUnreadCount:", e);
        return 0;
    }
}

export async function markAsRead(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.notification.update({
        where: { id },
        data: { isRead: true, readAt: new Date() },
    });

    revalidatePath("/");
}

export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.notification.updateMany({
        where: { userId: session.user.id!, isRead: false },
        data: { isRead: true, readAt: new Date() },
    });

    revalidatePath("/");
}

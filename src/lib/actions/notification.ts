"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications(limit = 20) {
    const session = await auth();
    if (!session?.user) return [];

    return await prisma.notification.findMany({
        where: { userId: session.user.id! },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}

export async function getUnreadCount() {
    const session = await auth();
    if (!session?.user) return 0;

    return await prisma.notification.count({
        where: { userId: session.user.id!, isRead: false },
    });
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

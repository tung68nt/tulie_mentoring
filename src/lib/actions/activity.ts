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

export async function getActivityLogs(limit = 10) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const logs = await prisma.activityLog.findMany({
        where: {
            userId: session.user.id!,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
    });

    return JSON.parse(JSON.stringify(logs));
}

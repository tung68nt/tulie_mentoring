import { prisma } from "@/lib/db";

export type NotificationType = "meeting" | "mentorship" | "goal" | "feedback" | "system" | "ticket" | "social" | "chat";

interface SendNotificationParams {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
}

/**
 * Sends a notification to a specific user and logs it in the database.
 */
export async function sendNotification({
    userId,
    title,
    message,
    type,
    link,
}: SendNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
            },
        });
        return notification;
    } catch (error) {
        console.error("Failed to send notification:", error);
        return null;
    }
}

/**
 * Sends a notification to all users with a specific role.
 */
export async function sendNotificationToRole({
    role,
    title,
    message,
    type,
    link,
}: Omit<SendNotificationParams, "userId"> & { role: string }) {
    try {
        const users = await prisma.user.findMany({
            where: { role, isActive: true },
            select: { id: true },
        });

        if (users.length === 0) return [];

        const notifications = await prisma.notification.createMany({
            data: users.map((user) => ({
                userId: user.id,
                title,
                message,
                type,
                link,
            })),
        });

        return notifications;
    } catch (error) {
        console.error(`Failed to send notification to role ${role}:`, error);
        return null;
    }
}

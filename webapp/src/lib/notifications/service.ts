import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/service";

export type NotificationType = "meeting" | "mentorship" | "goal" | "feedback" | "system" | "ticket" | "social" | "chat";

interface SendNotificationParams {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    sendEmailToo?: boolean;
    emailSubject?: string;
    emailHtml?: string;
}

/**
 * Sends a notification to a specific user and logs it in the database.
 * Optionally sends an email if sendEmailToo is true and SMTP is configured.
 */
export async function sendNotification({
    userId,
    title,
    message,
    type,
    link,
    sendEmailToo = false,
    emailSubject,
    emailHtml,
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

        // Send email if requested
        if (sendEmailToo && emailHtml) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true },
            });

            if (user?.email) {
                const emailSent = await sendEmail({
                    to: user.email,
                    subject: emailSubject || title,
                    html: emailHtml,
                });

                if (emailSent) {
                    await prisma.notification.update({
                        where: { id: notification.id },
                        data: { emailSentAt: new Date() },
                    });
                }
            }
        }

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

/**
 * Send notifications to multiple users at once.
 * Optionally sends email to each user.
 */
export async function sendNotificationToUsers({
    userIds,
    title,
    message,
    type,
    link,
    sendEmailToo = false,
    emailSubject,
    emailHtml,
}: Omit<SendNotificationParams, "userId"> & { userIds: string[] }) {
    if (userIds.length === 0) return [];

    try {
        // Create in-app notifications
        await prisma.notification.createMany({
            data: userIds.map((userId) => ({
                userId,
                title,
                message,
                type,
                link,
            })),
        });

        // Send emails if requested
        if (sendEmailToo && emailHtml) {
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, email: true },
            });

            for (const user of users) {
                if (user.email) {
                    const emailSent = await sendEmail({
                        to: user.email,
                        subject: emailSubject || title,
                        html: emailHtml,
                    });

                    if (emailSent) {
                        // Mark notifications as email-sent
                        await prisma.notification.updateMany({
                            where: { userId: user.id, title, createdAt: { gte: new Date(Date.now() - 5000) } },
                            data: { emailSentAt: new Date() },
                        });
                    }
                }
            }
        }

        return { count: userIds.length };
    } catch (error) {
        console.error("Failed to send notifications to users:", error);
        return null;
    }
}

"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Tự động đồng bộ các thông báo nhắc nhở thiết thực cho người dùng
 * (Khảo sát DISC, Thu hoạch sau họp, Điểm danh...)
 */
async function syncSystemReminders(userId: string, role: string) {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // 1. Nhắc nhở Mentee chưa làm khảo sát đầu vào & Trắc nghiệm DISC
        if (role === "mentee") {
            const profile = await prisma.menteeProfile.findUnique({
                where: { userId },
                select: { isOnboardingComplete: true },
            });

            if (!profile?.isOnboardingComplete) {
                // Kiểm tra xem đã có thông báo nhắc onboarding trong 24h qua chưa
                const existingNotif = await prisma.notification.findFirst({
                    where: {
                        userId,
                        type: "reminder",
                        link: "/mentee/onboarding",
                        createdAt: { gte: oneDayAgo },
                    },
                });

                if (!existingNotif) {
                    await prisma.notification.create({
                        data: {
                            userId,
                            title: "Hoàn thiện hồ sơ & Trắc nghiệm DISC",
                            message: "Bạn chưa hoàn thành trắc nghiệm tính cách. Hãy làm bài để Mentor phân nhóm và thiết kế lộ trình phù hợp.",
                            type: "reminder",
                            link: "/mentee/onboarding",
                        },
                    });
                }
            }

            // 2. Nhắc nhở nộp bản thu hoạch sau họp (Reflection)
            // Lấy các buổi họp đã diễn ra trong vòng 7 ngày qua của mentee
            const recentMeetings = await prisma.meeting.findMany({
                where: {
                    OR: [
                        { status: "completed" },
                        { scheduledAt: { lte: now, gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
                    ],
                    attendances: {
                        some: { userId }
                    }
                },
                take: 3,
                orderBy: { scheduledAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    sessionReflections: {
                        where: { menteeId: userId },
                        select: { id: true, submittedAt: true }
                    }
                }
            });

            for (const meeting of recentMeetings) {
                const hasSubmitted = meeting.sessionReflections.length > 0 && meeting.sessionReflections[0].submittedAt;
                if (!hasSubmitted) {
                    const existingReflectionNotif = await prisma.notification.findFirst({
                        where: {
                            userId,
                            link: `/meetings/${meeting.id}`,
                            title: { contains: "thu hoạch" }
                        }
                    });

                    if (!existingReflectionNotif) {
                        await prisma.notification.create({
                            data: {
                                userId,
                                title: `Nộp thu hoạch: ${meeting.title}`,
                                message: "Phiên họp đã kết thúc. Vui lòng dành 3 phút chia sẻ bài học rút ra và cam kết hành động của bạn.",
                                type: "reflection",
                                link: `/meetings/${meeting.id}`,
                            },
                        });
                    }
                }
            }
        }

        // 3. Nhắc nhở Mentor: Có bản thu hoạch mới cần phản hồi
        if (role === "mentor") {
            const pendingReflections = await prisma.sessionReflection.findMany({
                where: {
                    mentorFeedback: null,
                    submittedAt: { not: null },
                    meeting: {
                        creatorId: userId
                    }
                },
                take: 3,
                include: {
                    meeting: { select: { id: true, title: true } },
                    mentee: { select: { firstName: true, lastName: true } }
                }
            });

            for (const ref of pendingReflections) {
                const existingFeedbackNotif = await prisma.notification.findFirst({
                    where: {
                        userId,
                        link: `/meetings/${ref.meetingId}`,
                        title: { contains: "Cần phản hồi thu hoạch" }
                    }
                });

                if (!existingFeedbackNotif) {
                    await prisma.notification.create({
                        data: {
                            userId,
                            title: `Cần phản hồi thu hoạch: ${ref.mentee.firstName} ${ref.mentee.lastName}`,
                            message: `Mentee đã nộp bài thu hoạch sau buổi "${ref.meeting.title}". Hãy để lại nhận xét và góp ý nhé.`,
                            type: "feedback",
                            link: `/meetings/${ref.meetingId}`,
                        }
                    });
                }
            }
        }
    } catch (e) {
        console.error("Failed to sync system reminders:", e);
    }
}

export async function getNotifications(limit = 25) {
    const session = await auth();
    if (!session?.user?.id) return [];

    if (!session.user.id.match(/^[a-z0-9]+$/i)) {
        return [];
    }

    const userId = session.user.id;
    const role = (session.user as any).role || "mentee";

    // Kích hoạt đồng bộ nhắc nhở thông minh
    await syncSystemReminders(userId, role);

    try {
        return await prisma.notification.findMany({
            where: { userId },
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

export async function deleteNotification(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.notification.delete({
        where: { id },
    });

    revalidatePath("/");
    return { success: true };
}

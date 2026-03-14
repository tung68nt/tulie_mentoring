"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { sendNotificationToUsers } from "@/lib/notifications/service";
import { minutesCreatedTemplate } from "@/lib/email/templates";

export async function createMinutes(data: {
    meetingId: string;
    agenda?: string;
    keyPoints: string;
    actionItems?: string;
    outcome: "productive" | "average" | "needs_improvement";
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const minutes = await prisma.meetingMinutes.create({
        data: {
            meetingId: data.meetingId,
            authorId: session.user.id!,
            agenda: data.agenda,
            keyPoints: data.keyPoints,
            actionItems: data.actionItems,
            outcome: data.outcome,
        },
    });

    // Notify participants about new minutes
    try {
        const meeting = await prisma.meeting.findUnique({
            where: { id: data.meetingId },
            include: {
                mentorship: {
                    select: { mentorId: true, mentees: { select: { menteeId: true } } },
                },
            },
        });

        if (meeting) {
            const authorName = `${(session.user as any).firstName || ""} ${(session.user as any).lastName || ""}`.trim() || "Ai đó";
            const participantIds = meeting.mentorship ? [
                meeting.mentorship.mentorId,
                ...meeting.mentorship.mentees.map(m => m.menteeId),
            ].filter(id => id !== session.user.id) : [];

            const meetingLink = `/meetings/${data.meetingId}`;

            if (participantIds.length > 0) {
                await sendNotificationToUsers({
                    userIds: participantIds,
                    title: `Biên bản: ${meeting.title}`,
                    message: `${authorName} đã tạo biên bản cho cuộc họp "${meeting.title}"`,
                    type: "meeting",
                    link: meetingLink,
                    sendEmailToo: true,
                    emailSubject: `[Tulie] Biên bản cuộc họp: ${meeting.title}`,
                    emailHtml: minutesCreatedTemplate({
                        meetingTitle: meeting.title,
                        authorName,
                        link: `${process.env.NEXTAUTH_URL || "https://mentoring.tulie.vn"}${meetingLink}`,
                    }),
                });
            }
        }
    } catch (notifError) {
        console.error("Failed to send minutes notifications:", notifError);
    }

    revalidatePath(`/meetings/${data.meetingId}`);
    return minutes;
}

export async function getMinutes(meetingId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    return await prisma.meetingMinutes.findFirst({
        where: { meetingId },
        include: {
            author: { select: { firstName: true, lastName: true } },
        },
    });
}

export async function submitMinutes(minutesId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const minutes = await prisma.meetingMinutes.findUnique({
        where: { id: minutesId },
        include: { meeting: { include: { mentorship: { select: { mentorId: true } } } } },
    });

    if (!minutes) throw new Error("Biên bản không tồn tại");
    if (minutes.authorId !== session.user.id) throw new Error("Chỉ tác giả mới có thể nộp biên bản");
    if (minutes.status !== "draft") throw new Error("Chỉ biên bản nháp mới có thể nộp");

    const updated = await prisma.meetingMinutes.update({
        where: { id: minutesId },
        data: { status: "submitted", submittedAt: new Date() },
    });

    // Notify mentor
    if (minutes.meeting.mentorship?.mentorId) {
        const authorName = `${(session.user as any).firstName || ""} ${(session.user as any).lastName || ""}`.trim();
        await sendNotificationToUsers({
            userIds: [minutes.meeting.mentorship.mentorId],
            title: `Biên bản cần duyệt`,
            message: `${authorName} đã nộp biên bản cho cuộc họp "${minutes.meeting.title}"`,
            type: "meeting",
            link: `/meetings/${minutes.meetingId}`,
        }).catch(() => {});
    }

    revalidatePath(`/meetings/${minutes.meetingId}`);
    revalidatePath("/mentor");
    return updated;
}

export async function approveMinutes(minutesId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;

    const minutes = await prisma.meetingMinutes.findUnique({
        where: { id: minutesId },
        include: { meeting: { include: { mentorship: { select: { mentorId: true } } } } },
    });

    if (!minutes) throw new Error("Biên bản không tồn tại");
    if (minutes.status !== "submitted" && minutes.status !== "draft") throw new Error("Biên bản này không thể duyệt");

    // Only mentor of the mentorship or admin can approve
    const isMentor = minutes.meeting.mentorship?.mentorId === session.user.id;
    if (!isMentor && role !== "admin" && role !== "program_manager") {
        throw new Error("Chỉ mentor hoặc admin mới có thể duyệt biên bản");
    }

    const updated = await prisma.meetingMinutes.update({
        where: { id: minutesId },
        data: { status: "approved", approvedAt: new Date() },
    });

    // Notify author
    const approverName = `${(session.user as any).firstName || ""} ${(session.user as any).lastName || ""}`.trim();
    await sendNotificationToUsers({
        userIds: [minutes.authorId],
        title: `Biên bản đã được duyệt`,
        message: `${approverName} đã duyệt biên bản cuộc họp "${minutes.meeting.title}"`,
        type: "meeting",
        link: `/meetings/${minutes.meetingId}`,
    }).catch(() => {});

    revalidatePath(`/meetings/${minutes.meetingId}`);
    revalidatePath("/mentor");
    return updated;
}

export async function rejectMinutes(minutesId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;

    const minutes = await prisma.meetingMinutes.findUnique({
        where: { id: minutesId },
        include: { meeting: { include: { mentorship: { select: { mentorId: true } } } } },
    });

    if (!minutes) throw new Error("Biên bản không tồn tại");
    if (minutes.status !== "submitted" && minutes.status !== "draft") throw new Error("Biên bản này không thể trả lại");

    const isMentor = minutes.meeting.mentorship?.mentorId === session.user.id;
    if (!isMentor && role !== "admin" && role !== "program_manager") {
        throw new Error("Chỉ mentor hoặc admin mới có thể trả lại biên bản");
    }

    const updated = await prisma.meetingMinutes.update({
        where: { id: minutesId },
        data: { status: "draft", submittedAt: null },
    });

    // Notify author to revise
    const reviewerName = `${(session.user as any).firstName || ""} ${(session.user as any).lastName || ""}`.trim();
    await sendNotificationToUsers({
        userIds: [minutes.authorId],
        title: `Biên bản cần chỉnh sửa`,
        message: `${reviewerName} yêu cầu chỉnh sửa biên bản cuộc họp "${minutes.meeting.title}"`,
        type: "meeting",
        link: `/meetings/${minutes.meetingId}`,
    }).catch(() => {});

    revalidatePath(`/meetings/${minutes.meetingId}`);
    revalidatePath("/mentor");
    return updated;
}

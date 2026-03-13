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

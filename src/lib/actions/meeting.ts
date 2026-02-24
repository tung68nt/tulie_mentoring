"use server";

import { prisma } from "@/lib/db";
import { meetingSchema, type MeetingInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { addMinutes } from "date-fns";
import { logActivity } from "./activity";

export async function createMeeting(data: MeetingInput) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const validatedData = meetingSchema.parse(data);

    if ((session.user as any).role === "mentor") {
        const mentorship = await prisma.mentorship.findUnique({
            where: { id: validatedData.mentorshipId },
        });
        if (mentorship?.mentorId !== session.user.id) {
            throw new Error("Unauthorized: You are not the mentor of this mentorship");
        }
    }

    const meeting = await prisma.meeting.create({
        data: {
            ...validatedData,
            creatorId: session.user.id!,
            qrToken: uuidv4(),
            qrExpiresAt: addMinutes(validatedData.scheduledAt, validatedData.duration + 60), // Allow 1 hour grace
        },
    });

    const mentees = await prisma.mentorshipMentee.findMany({
        where: { mentorshipId: validatedData.mentorshipId },
    });

    if (mentees.length > 0) {
        await prisma.attendance.createMany({
            data: mentees.map((m: any) => ({
                meetingId: meeting.id,
                userId: m.menteeId,
                status: "absent",
            })),
        });
    }

    revalidatePath("/calendar");
    revalidatePath(`/admin/mentorships/${validatedData.mentorshipId}`);
    return JSON.parse(JSON.stringify(meeting));
}

export async function getMeetings(filters?: {
    role?: string;
    userId?: string;
    mentorshipId?: string;
    startDate?: Date;
    endDate?: Date;
}) {
    const where: any = {};

    if (filters?.mentorshipId) {
        where.mentorshipId = filters.mentorshipId;
    }

    if (filters?.role === "mentor") {
        where.mentorship = { mentorId: filters.userId };
    } else if (filters?.role === "mentee") {
        where.mentorship = { mentees: { some: { menteeId: filters.userId } } };
    }

    if (filters?.startDate || filters?.endDate) {
        where.scheduledAt = {};
        if (filters.startDate) where.scheduledAt.gte = filters.startDate;
        if (filters.endDate) where.scheduledAt.lte = filters.endDate;
    }

    try {
        const meetings = await prisma.meeting.findMany({
            where,
            include: {
                mentorship: {
                    include: {
                        mentor: { select: { firstName: true, lastName: true, avatar: true } },
                        mentees: { include: { mentee: { select: { firstName: true, lastName: true, avatar: true } } } },
                    },
                },
                creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                attendances: true,
            },
            orderBy: { scheduledAt: "asc" },
        });
        return JSON.parse(JSON.stringify(meetings));
    } catch (error) {
        console.error("Error in getMeetings:", error);
        return [];
    }
}

export async function getMeetingDetail(id: string) {
    try {
        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include: {
                mentorship: {
                    include: {
                        mentor: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                        mentees: { include: { mentee: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
                    },
                },
                attendances: {
                    include: {
                        user: { select: { firstName: true, lastName: true, avatar: true } },
                    },
                },
                minutes: true,
            },
        });
        return meeting ? JSON.parse(JSON.stringify(meeting)) : null;
    } catch (error) {
        console.error("Error in getMeetingDetail:", error);
        return null;
    }
}

export async function checkIn(meetingId: string, token: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
    });

    if (!meeting) throw new Error("Meeting not found");
    if (meeting.qrToken !== token) throw new Error("Mã QR không hợp lệ");

    // Expiry check logic
    if (meeting.qrExpiresAt && new Date() > meeting.qrExpiresAt) {
        throw new Error("Mã QR đã hết hạn");
    }

    const attendance = await prisma.attendance.upsert({
        where: {
            meetingId_userId: {
                meetingId,
                userId: session.user.id!,
            },
        },
        update: {
            checkInTime: new Date(),
            status: "present",
        },
        create: {
            meetingId,
            userId: session.user.id!,
            checkInTime: new Date(),
            status: "present",
        },
    });

    revalidatePath(`/meetings/${meetingId}`);

    // Log activity
    await logActivity("check_in", meetingId, "meeting", { title: meeting.title });

    return JSON.parse(JSON.stringify(attendance));
}

export async function updateMeetingStatus(id: string, status: string) {
    const meeting = await prisma.meeting.update({
        where: { id },
        data: { status },
    });
    revalidatePath("/calendar");
    revalidatePath(`/meetings/${id}`);
    return JSON.parse(JSON.stringify(meeting));
}

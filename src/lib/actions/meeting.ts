"use server";

import { prisma } from "@/lib/db";
import { meetingSchema, type MeetingInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { addMinutes } from "date-fns";
import { logActivity } from "./activity";

function generateCheckInCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}


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
    } else if ((session.user as any).role === "mentee") {
        const mentorship = await prisma.mentorship.findUnique({
            where: { id: validatedData.mentorshipId },
            include: { mentees: true }
        });
        const isParticipant = mentorship?.mentees.some(m => m.menteeId === session.user.id);
        if (!isParticipant) {
            throw new Error("Unauthorized: You are not a participant of this mentorship");
        }
    }

    const meeting = await prisma.meeting.create({
        data: {
            ...validatedData,
            creatorId: session.user.id!,
            qrToken: uuidv4(),
            checkInCode: generateCheckInCode(),
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

export async function checkIn(meetingIdOrCode: string, token?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    let meeting;

    if (token) {
        // QR Check-in
        meeting = await prisma.meeting.findUnique({
            where: { id: meetingIdOrCode },
        });

        if (!meeting) throw new Error("Cuộc họp không tồn tại");
        if (meeting.qrToken !== token) throw new Error("Mã QR không hợp lệ");
    } else if (meetingIdOrCode.length === 6) {
        // Code Check-in (assuming manual codes are 6 chars)
        meeting = await prisma.meeting.findFirst({
            where: { checkInCode: meetingIdOrCode.toUpperCase() },
        });

        if (!meeting) throw new Error("Mã điểm danh không hợp lệ");
    } else {
        // Direct Check-in by Meeting ID (for online meetings)
        meeting = await prisma.meeting.findUnique({
            where: { id: meetingIdOrCode },
            include: {
                mentorship: {
                    include: {
                        mentees: true
                    }
                }
            }
        });

        if (!meeting) throw new Error("Cuộc họp không tồn tại");

        // Ensure user is a participant
        const isParticipant = meeting.mentorship.mentorId === session.user.id ||
            meeting.mentorship.mentees.some(m => m.menteeId === session.user.id);

        if (!isParticipant) throw new Error("Bạn không phải là thành viên của cuộc họp này");

        // allow direct check-in for online meetings, or if it's already scheduled
        if (meeting.type !== "online" && meeting.status !== "scheduled" && meeting.status !== "ongoing") {
            throw new Error("Cuộc họp chưa bắt đầu hoặc đã kết thúc");
        }
    }

    // Expiry check logic
    if (meeting.qrExpiresAt && new Date() > meeting.qrExpiresAt) {
        throw new Error("Mã điểm danh đã hết hạn");
    }

    const meetingId = meeting.id;

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

export async function checkOut(meetingId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    try {
        const attendance = await prisma.attendance.update({
            where: {
                meetingId_userId: {
                    meetingId,
                    userId: session.user.id!,
                },
            },
            data: {
                checkOutTime: new Date(),
            },
        });

        const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });

        revalidatePath(`/meetings/${meetingId}`);

        // Log activity
        await logActivity("check_out", meetingId, "meeting", { title: meeting?.title });

        return JSON.parse(JSON.stringify(attendance));
    } catch (error) {
        console.error("Check-out error:", error);
        throw new Error("Không tìm thấy thông tin điểm danh để check-out");
    }
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

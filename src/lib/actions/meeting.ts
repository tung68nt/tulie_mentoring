"use server";

import { prisma } from "@/lib/db";
import { meetingSchema, type MeetingInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { addMinutes } from "date-fns";
import { logActivity } from "./activity";
import { validateTransition, MEETING_TRANSITIONS } from "@/lib/state-machines";

import { sendNotificationToUsers } from "@/lib/notifications/service";
import { meetingCreatedTemplate } from "@/lib/email/templates";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

function generateCheckInCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}


export async function createMeeting(data: MeetingInput) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const validatedData = meetingSchema.parse(data);

    // Normalize empty mentorshipId to null
    const mentorshipId = validatedData.mentorshipId || null;

    // Authorization check only if mentorship is selected
    if (mentorshipId) {
        if ((session.user as any).role === "mentor") {
            const mentorship = await prisma.mentorship.findUnique({
                where: { id: mentorshipId },
            });
            if (mentorship?.mentorId !== session.user.id) {
                throw new Error("Unauthorized: You are not the mentor of this mentorship");
            }
        } else if ((session.user as any).role === "mentee") {
            const mentorship = await prisma.mentorship.findUnique({
                where: { id: mentorshipId },
                include: { mentees: true }
            });
            const isParticipant = mentorship?.mentees.some(m => m.menteeId === session.user.id);
            if (!isParticipant) {
                throw new Error("Unauthorized: You are not a participant of this mentorship");
            }
        }
    }

    // Calculate sessionNumber if mentorship is selected
    let sessionNumber: number | null = null;
    if (mentorshipId) {
        const existingCount = await prisma.meeting.count({
            where: { mentorshipId },
        });
        sessionNumber = existingCount + 1;
    }

    const { mentorshipId: _removedId, ...restData } = validatedData;

    const meeting = await prisma.meeting.create({
        data: {
            ...restData,
            mentorshipId: mentorshipId || undefined,
            sessionNumber: sessionNumber ?? undefined,
            creatorId: session.user.id!,
            qrToken: uuidv4(),
            checkInCode: generateCheckInCode(),
            qrExpiresAt: addMinutes(validatedData.scheduledAt, validatedData.duration + 60),
        },
    });

    // Create attendance records if mentorship is selected
    if (mentorshipId) {
        const mentees = await prisma.mentorshipMentee.findMany({
            where: { mentorshipId },
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
    }

    // Notify participants
    try {
        if (mentorshipId) {
            const mentorship = await prisma.mentorship.findUnique({
                where: { id: mentorshipId },
                select: { mentorId: true, mentees: { select: { menteeId: true } } },
            });

            if (mentorship) {
                const creatorName = `${(session.user as any).firstName || ""} ${(session.user as any).lastName || ""}`.trim() || "Ai đó";
                const participantIds = [
                    mentorship.mentorId,
                    ...mentorship.mentees.map(m => m.menteeId),
                ].filter(id => id !== session.user.id);

                const meetingLink = `/meetings/${meeting.id}`;
                const scheduledAtStr = format(new Date(validatedData.scheduledAt), "HH:mm - EEEE, dd/MM/yyyy", { locale: vi });
                const sessionLabel = sessionNumber ? ` (Buổi #${sessionNumber})` : "";

                await sendNotificationToUsers({
                    userIds: participantIds,
                    title: `Cuộc họp mới: ${meeting.title}${sessionLabel}`,
                    message: `${creatorName} đã tạo cuộc họp "${meeting.title}"${sessionLabel} vào ${scheduledAtStr}`,
                    type: "meeting",
                    link: meetingLink,
                    sendEmailToo: true,
                    emailSubject: `[Tulie] Cuộc họp mới: ${meeting.title}${sessionLabel}`,
                    emailHtml: meetingCreatedTemplate({
                        meetingTitle: `${meeting.title}${sessionLabel}`,
                        scheduledAt: scheduledAtStr,
                        creatorName,
                        link: `${process.env.NEXTAUTH_URL || "https://mentoring.tulie.vn"}${meetingLink}`,
                    }),
                });
            }
        }
    } catch (notifError) {
        console.error("Failed to send meeting creation notifications:", notifError);
    }

    revalidatePath("/calendar");
    if (mentorshipId) {
        revalidatePath(`/admin/mentorships/${mentorshipId}`);
    }
    return JSON.parse(JSON.stringify(meeting));
}

export async function getNextSessionNumber(mentorshipId: string): Promise<number> {
    const count = await prisma.meeting.count({
        where: { mentorshipId },
    });
    return count + 1;
}

export async function getMeetings(filters?: {
    role?: string;
    userId?: string;
    mentorshipId?: string;
    startDate?: Date;
    endDate?: Date;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const currentUserId = session.user.id;
    const currentUserRole = (session.user as any).role;

    const where: any = {};

    if (filters?.mentorshipId) {
        where.mentorshipId = filters.mentorshipId;
    }

    // Security: scope by role — also include standalone meetings (no mentorship) created by this user
    if (currentUserRole !== "admin" && currentUserRole !== "program_manager" && currentUserRole !== "manager") {
        if (currentUserRole === "mentor") {
            where.OR = [
                { mentorship: { mentorId: currentUserId } },
                { creatorId: currentUserId, mentorshipId: null },
            ];
        } else if (currentUserRole === "mentee") {
            where.OR = [
                { mentorship: { mentees: { some: { menteeId: currentUserId } } } },
                { creatorId: currentUserId, mentorshipId: null },
            ];
        } else if (currentUserRole === "facilitator") {
            const assignments = await prisma.facilitatorAssignment.findMany({
                where: { facilitatorId: currentUserId },
                select: { programCycleId: true, mentorshipId: true },
            });
            const programCycleIds = assignments
                .map(a => a.programCycleId)
                .filter((id): id is string => id !== null);
            const mentorshipIds = assignments
                .map(a => a.mentorshipId)
                .filter((id): id is string => id !== null);

            where.OR = [
                { mentorship: { OR: [{ programCycleId: { in: programCycleIds } }, { id: { in: mentorshipIds } }] } },
                { creatorId: currentUserId, mentorshipId: null },
            ];
        }
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
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

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

        if (!meeting) return null;

        // Security check: Only members, creator, or admin
        const role = (session.user as any).role;
        if (role !== "admin") {
            const isCreator = meeting.creatorId === session.user.id;
            const isMentor = meeting.mentorship?.mentorId === session.user.id;
            const isMentee = meeting.mentorship?.mentees.some(m => m.menteeId === session.user.id) ?? false;
            if (!isCreator && !isMentor && !isMentee) {
                throw new Error("Unauthorized: You do not have access to this meeting");
            }
        }

        return JSON.parse(JSON.stringify(meeting));
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

        // Ensure user is a participant (for meetings with mentorship)
        if (meeting.mentorship) {
            const isParticipant = meeting.mentorship.mentorId === session.user.id ||
                meeting.mentorship.mentees.some(m => m.menteeId === session.user.id);

            if (!isParticipant) throw new Error("Bạn không phải là thành viên của cuộc họp này");
        }

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
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;

    // Fetch meeting with current status
    const meeting = await prisma.meeting.findUnique({
        where: { id },
        include: { mentorship: true }
    });

    if (!meeting) throw new Error("Meeting not found");

    // Security check: Only mentor of the mentorship, creator, PM, or admin can update status
    if (role !== "admin" && role !== "program_manager") {
        if (meeting.mentorship) {
            if (meeting.mentorship.mentorId !== session.user.id) {
                throw new Error("Unauthorized: Only mentors or admins can update meeting status");
            }
        } else if (meeting.creatorId !== session.user.id) {
            throw new Error("Unauthorized: Only the creator or admins can update meeting status");
        }
    }

    // Validate state transition
    const transition = validateTransition(MEETING_TRANSITIONS, meeting.status, status, role);
    if (!transition.valid) {
        throw new Error(transition.error || `Cannot change meeting status from "${meeting.status}" to "${status}"`);
    }

    const updatedMeeting = await prisma.meeting.update({
        where: { id },
        data: { status },
    });

    // Audit log for status change
    await logActivity("update_meeting_status", id, "meeting", {
        title: meeting.title,
        from: meeting.status,
        to: status,
    });

    // Notify participants about status change
    try {
        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include: {
                mentorship: {
                    select: { mentorId: true, mentees: { select: { menteeId: true } } },
                },
            },
        });

        if (meeting) {
            const statusLabels: Record<string, string> = {
                scheduled: "đã lên lịch",
                ongoing: "đang diễn ra",
                completed: "đã hoàn thành",
                cancelled: "đã bị hủy",
            };
            const participantIds = meeting.mentorship ? [
                meeting.mentorship.mentorId,
                ...meeting.mentorship.mentees.map(m => m.menteeId),
            ].filter(uid => uid !== session.user.id) : [];

            if (participantIds.length > 0) {
                await sendNotificationToUsers({
                    userIds: participantIds,
                    title: `Cuộc họp ${statusLabels[status] || status}`,
                    message: `Cuộc họp "${meeting.title}" ${statusLabels[status] || "đã cập nhật trạng thái"}`,
                    type: "meeting",
                    link: `/meetings/${id}`,
                });
            }
        }
    } catch (notifError) {
        console.error("Failed to send meeting status notifications:", notifError);
    }

    revalidatePath("/calendar");
    revalidatePath(`/meetings/${id}`);
    return JSON.parse(JSON.stringify(updatedMeeting));
}

/**
 * Quick Check-in via QR code URL (phone camera scan)
 * Validates: token → participant membership → check-in
 */
export async function quickCheckIn(meetingId: string, token: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // 1. Find the meeting
    const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
            mentorship: {
                include: {
                    mentees: { select: { menteeId: true } },
                },
            },
        },
    });

    if (!meeting) {
        throw new Error("Cuộc họp không tồn tại hoặc đã bị xóa.");
    }

    // 2. Validate QR token
    if (meeting.qrToken !== token) {
        throw new Error("Mã QR không hợp lệ. Vui lòng quét lại.");
    }

    // 3. Check QR expiry
    if (meeting.qrExpiresAt && new Date() > new Date(meeting.qrExpiresAt)) {
        throw new Error("Mã QR đã hết hạn. Vui lòng liên hệ Mentor để làm mới mã.");
    }

    // 4. Check participant membership
    const userId = session.user.id!;
    const isMentor = meeting.mentorship?.mentorId === userId;
    const isMentee = meeting.mentorship?.mentees.some(m => m.menteeId === userId) ?? false;
    const isCreator = meeting.creatorId === userId;

    if (!isMentor && !isMentee && !isCreator) {
        throw new Error("Bạn không thuộc cuộc họp này. Vui lòng kiểm tra lại mã QR — có thể bạn đã quét nhầm mã.");
    }

    // 5. Check if already checked in
    const existingAttendance = await prisma.attendance.findFirst({
        where: { meetingId, userId },
    });

    if (existingAttendance?.checkInTime) {
        // Already checked in — return success
        return { meetingTitle: meeting.title, alreadyCheckedIn: true };
    }

    // 6. Perform check-in
    if (existingAttendance) {
        await prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: {
                status: "present",
                checkInTime: new Date(),
            },
        });
    } else {
        await prisma.attendance.create({
            data: {
                meetingId,
                userId,
                status: "present",
                checkInTime: new Date(),
            },
        });
    }

    revalidatePath("/calendar");
    revalidatePath(`/meetings/${meetingId}`);

    return { meetingTitle: meeting.title, alreadyCheckedIn: false };
}

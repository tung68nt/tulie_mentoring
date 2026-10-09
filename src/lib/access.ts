import { prisma } from "@/lib/db";
import { isAdminLevel } from "@/lib/role-helpers";

// Helper phân quyền dùng chung. Không đặt "use server" để không lộ thành endpoint.

/**
 * Viewer có được XEM dữ liệu của mentee không?
 * - chính mentee
 * - admin / program_manager / manager (lãnh đạo viện, chỉ xem)
 * - mentor của một mentorship chứa mentee
 * - facilitator được gán vào mentorship đó hoặc vào program cycle của nó
 * Mentee khác (kể cả cùng nhóm) KHÔNG được xem.
 */
export async function canViewMentee(viewerId: string, role: string, menteeId: string): Promise<boolean> {
    if (viewerId === menteeId) return true;
    if (isAdminLevel(role)) return true;

    if (role === "mentor") {
        const row = await prisma.mentorshipMentee.findFirst({
            where: { menteeId, mentorship: { mentorId: viewerId } },
            select: { id: true },
        });
        return !!row;
    }

    if (role === "facilitator") {
        const row = await prisma.mentorshipMentee.findFirst({
            where: {
                menteeId,
                mentorship: {
                    OR: [
                        { facilitatorAssignments: { some: { facilitatorId: viewerId } } },
                        { programCycle: { facilitatorAssignments: { some: { facilitatorId: viewerId, mentorshipId: null } } } },
                    ],
                },
            },
            select: { id: true },
        });
        return !!row;
    }

    return false;
}

/** Viewer có được NHẬN XÉT / chấm bài của mentee không? (mentor của cặp, admin, PM) */
export async function canReviewMentee(viewerId: string, role: string, menteeId: string): Promise<boolean> {
    if (role === "admin" || role === "program_manager") return true;
    if (role !== "mentor") return false;
    const row = await prisma.mentorshipMentee.findFirst({
        where: { menteeId, mentorship: { mentorId: viewerId } },
        select: { id: true },
    });
    return !!row;
}

/** Danh sách id mentee mà viewer được xem, null = không giới hạn (admin-level). */
export async function visibleMenteeIds(viewerId: string, role: string): Promise<string[] | null> {
    if (isAdminLevel(role)) return null;
    if (role === "mentee") return [viewerId];

    const where =
        role === "mentor"
            ? { mentorship: { mentorId: viewerId } }
            : role === "facilitator"
              ? {
                    mentorship: {
                        OR: [
                            { facilitatorAssignments: { some: { facilitatorId: viewerId } } },
                            { programCycle: { facilitatorAssignments: { some: { facilitatorId: viewerId, mentorshipId: null } } } },
                        ],
                    },
                }
              : null;
    if (!where) return [];
    const rows = await prisma.mentorshipMentee.findMany({ where, select: { menteeId: true } });
    return [...new Set(rows.map((r) => r.menteeId))];
}

/** Mentee có thuộc mentorship (active) không? */
export async function isMenteeOfMentorship(menteeId: string, mentorshipId: string): Promise<boolean> {
    const row = await prisma.mentorshipMentee.findFirst({
        where: { menteeId, mentorshipId },
        select: { id: true },
    });
    return !!row;
}

/** Facilitator được gán vào mentorship (trực tiếp hoặc qua program cycle)? */
export async function isFacilitatorOfMentorship(facilitatorId: string, mentorshipId: string | null | undefined): Promise<boolean> {
    if (!mentorshipId) return false;
    const row = await prisma.mentorship.findFirst({
        where: {
            id: mentorshipId,
            OR: [
                { facilitatorAssignments: { some: { facilitatorId } } },
                { programCycle: { facilitatorAssignments: { some: { facilitatorId, mentorshipId: null } } } },
            ],
        },
        select: { id: true },
    });
    return !!row;
}

/** Xem được buổi họp? thành viên mentorship, người tạo, facilitator được giao, admin-level. */
export async function canAccessMeeting(userId: string, role: string, meetingId: string, write = false): Promise<boolean> {
    if (role === "admin" || role === "program_manager") return true;
    if (role === "manager") return !write;
    const m = await prisma.meeting.findUnique({
        where: { id: meetingId },
        select: { creatorId: true, mentorshipId: true, mentorship: { select: { mentorId: true, mentees: { select: { menteeId: true } } } } },
    });
    if (!m) return false;
    if (m.creatorId === userId || m.mentorship?.mentorId === userId) return true;
    if (role === "facilitator") return isFacilitatorOfMentorship(userId, m.mentorshipId);
    if (write) return false; // mentee chỉ đọc
    return !!m.mentorship?.mentees.some((x) => x.menteeId === userId);
}

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

/** User có thuộc program cycle (qua mentorship) không? admin-level luôn có. */
export async function isInProgramCycle(userId: string, role: string, programCycleId: string): Promise<boolean> {
    if (isAdminLevel(role)) return true;
    const row = await prisma.mentorship.findFirst({
        where: {
            programCycleId,
            OR: [
                { mentorId: userId },
                { mentees: { some: { menteeId: userId } } },
                { facilitatorAssignments: { some: { facilitatorId: userId } } },
                { programCycle: { facilitatorAssignments: { some: { facilitatorId: userId } } } },
            ],
        },
        select: { id: true },
    });
    return !!row;
}

/** User có xem được bài đăng không (public / program / pair). */
export async function canSeePost(userId: string, role: string, postId: string): Promise<boolean> {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true, visibility: true, programCycleId: true, mentorshipId: true },
    });
    if (!post) return false;
    if (post.authorId === userId || isAdminLevel(role) || post.visibility === "public") return true;
    if (post.visibility === "program") return !!post.programCycleId && isInProgramCycle(userId, role, post.programCycleId);
    if (post.visibility === "pair") {
        if (!post.mentorshipId) return false;
        const row = await prisma.mentorship.findFirst({
            where: {
                id: post.mentorshipId,
                OR: [{ mentorId: userId }, { mentees: { some: { menteeId: userId } } }, { facilitatorAssignments: { some: { facilitatorId: userId } } }],
            },
            select: { id: true },
        });
        return !!row;
    }
    return false;
}

/** Mentorship id mà user là thành viên (mentor, mentee, facilitator được giao). */
export async function myMentorshipIds(userId: string, role: string): Promise<string[]> {
    const rows = await prisma.mentorship.findMany({
        where: {
            OR: [
                { mentorId: userId },
                { mentees: { some: { menteeId: userId } } },
                ...(role === "facilitator"
                    ? [
                          { facilitatorAssignments: { some: { facilitatorId: userId } } },
                          { programCycle: { facilitatorAssignments: { some: { facilitatorId: userId, mentorshipId: null } } } },
                      ]
                    : []),
            ],
        },
        select: { id: true },
    });
    return rows.map((r) => r.id);
}

/** Xem được tài nguyên? public / của mình / group thuộc mentorship của mình / admin-level (trừ private của người khác). */
export async function canViewResource(userId: string, role: string, resourceId: string): Promise<boolean> {
    const r = await prisma.resource.findUnique({
        where: { id: resourceId },
        select: { uploadedById: true, visibility: true, mentorshipId: true },
    });
    if (!r) return false;
    if (r.uploadedById === userId || r.visibility === "public") return true;
    if (r.visibility === "private") return role === "admin";
    if (r.visibility === "group") {
        if (role === "admin" || role === "program_manager" || role === "manager") return true;
        if (!r.mentorshipId) return false;
        return (await myMentorshipIds(userId, role)).includes(r.mentorshipId);
    }
    return false;
}

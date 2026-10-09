"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { canViewMentee, visibleMenteeIds } from "@/lib/access";
import { computeEngagement } from "@/lib/engagement";

async function requireViewer() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const role = (session.user as any).role as string;
    if (role === "mentee") throw new Error("Permission denied");
    return { userId: session.user.id, role };
}

/** Bảng tổng quan mentee trong phạm vi người xem (mentor / facilitator / admin / PM / lãnh đạo). */
export async function getMenteeOverview() {
    const { userId, role } = await requireViewer();
    const ids = await visibleMenteeIds(userId, role);

    const links = await prisma.mentorshipMentee.findMany({
        where: ids ? { menteeId: { in: ids } } : {},
        select: {
            menteeId: true,
            mentee: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true, isActive: true, menteeProfile: { select: { studentId: true, major: true, isOnboardingComplete: true } } } },
            mentorship: { select: { id: true, status: true, mentor: { select: { firstName: true, lastName: true } }, programCycle: { select: { name: true } } } },
        },
        orderBy: { joinedAt: "desc" },
        take: 500,
    });

    const unique = [...new Map(links.map((l) => [l.menteeId, l])).values()];
    const metrics = await computeEngagement(unique.map((l) => l.menteeId));

    return JSON.parse(JSON.stringify(unique.map((l) => ({
        mentee: l.mentee,
        mentorshipId: l.mentorship.id,
        mentorName: `${l.mentorship.mentor.firstName ?? ""} ${l.mentorship.mentor.lastName ?? ""}`.trim(),
        program: l.mentorship.programCycle?.name ?? null,
        metrics: metrics.get(l.menteeId),
    }))));
}

/** Hồ sơ 360 độ của một mentee. Chỉ trả về nếu viewer có quyền xem mentee này. */
export async function getMenteeFullProfile(menteeId: string) {
    const { userId, role } = await requireViewer();
    if (!(await canViewMentee(userId, role, menteeId))) return null;

    const [user, attendances, reflections, submissions, tickets, activity, metrics] = await Promise.all([
        prisma.user.findUnique({
            where: { id: menteeId },
            select: {
                id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, bio: true, createdAt: true,
                menteeProfile: true,
                menteeships: { select: { mentorship: { select: { id: true, mentor: { select: { id: true, firstName: true, lastName: true } }, programCycle: { select: { name: true } } } } } },
            },
        }),
        prisma.attendance.findMany({
            where: { userId: menteeId, checkInTime: { not: null } },
            orderBy: { checkInTime: "desc" }, take: 30,
            select: { id: true, checkInTime: true, lateMinutes: true, selfieFileId: true, meeting: { select: { id: true, title: true, scheduledAt: true } } },
        }),
        prisma.sessionReflection.findMany({
            where: { menteeId, status: { not: "draft" } },
            orderBy: { createdAt: "desc" }, take: 30,
            select: { id: true, status: true, submittedAt: true, linkUrl: true, mentorFeedback: true, meeting: { select: { id: true, title: true, scheduledAt: true } }, files: { where: { status: "ready" }, select: { id: true, fileName: true, size: true } } },
        }),
        prisma.submission.findMany({
            where: { menteeId }, orderBy: { createdAt: "desc" }, take: 30,
            select: { id: true, kind: true, title: true, linkUrl: true, status: true, createdAt: true, files: { where: { status: "ready" }, select: { id: true, fileName: true, size: true } } },
        }),
        prisma.supportTicket.findMany({
            where: { userId: menteeId }, orderBy: { createdAt: "desc" }, take: 10,
            select: { id: true, title: true, status: true, createdAt: true },
        }),
        prisma.activityLog.findMany({
            where: { userId: menteeId }, orderBy: { createdAt: "desc" }, take: 20,
            select: { id: true, action: true, createdAt: true },
        }),
        computeEngagement([menteeId]),
    ]);
    if (!user) return null;

    await audit({ action: "mentee.view_profile", entityType: "user", entityId: menteeId });
    return JSON.parse(JSON.stringify({ user, attendances, reflections, submissions, tickets, activity, metrics: metrics.get(menteeId) }));
}

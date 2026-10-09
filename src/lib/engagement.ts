import { prisma } from "@/lib/db";

// Chỉ số chuyên cần / nhiệt tình của mentee. Công thức (0–100):
//   40% chuyên cần  = số buổi có mặt / số buổi đã diễn ra
//   30% thu hoạch   = số thu hoạch đã nộp / số buổi đã diễn ra (nộp đúng hạn tính đủ, trễ tính 0.5)
//   20% hoạt động   = số ngày có hoạt động trong 14 ngày gần nhất (tối đa 8 ngày = đủ điểm)
//   10% bài nộp     = số bài tập/thực hành nộp trong 30 ngày (tối đa 2 bài = đủ điểm)
export const REFLECTION_DEADLINE_HOURS = 48;

export type EngagementRow = {
    menteeId: string;
    meetingsHeld: number;
    present: number;
    late: number;
    reflectionsSubmitted: number;
    reflectionsOnTime: number;
    submissions30d: number;
    activeDays14d: number;
    actions30d: number;
    lastActiveAt: Date | null;
    score: number;
};

const DAY = 86_400_000;

export async function computeEngagement(menteeIds: string[], now = new Date()): Promise<Map<string, EngagementRow>> {
    const out = new Map<string, EngagementRow>();
    if (menteeIds.length === 0) return out;

    const since14 = new Date(now.getTime() - 14 * DAY);
    const since30 = new Date(now.getTime() - 30 * DAY);

    const [links, activity, submissions, lastActive] = await Promise.all([
        prisma.mentorshipMentee.findMany({
            where: { menteeId: { in: menteeIds }, mentorship: { status: { in: ["active", "completed"] } } },
            select: {
                menteeId: true,
                mentorship: {
                    select: {
                        meetings: {
                            where: { scheduledAt: { lt: now }, status: { not: "cancelled" }, meetingType: "session" },
                            select: {
                                id: true, scheduledAt: true, duration: true,
                                attendances: { select: { userId: true, checkInTime: true, lateMinutes: true } },
                                sessionReflections: { select: { menteeId: true, status: true, submittedAt: true } },
                            },
                        },
                    },
                },
            },
        }),
        prisma.activityLog.findMany({
            where: { userId: { in: menteeIds }, createdAt: { gte: since30 } },
            select: { userId: true, createdAt: true },
        }),
        prisma.submission.groupBy({
            by: ["menteeId"],
            where: { menteeId: { in: menteeIds }, createdAt: { gte: since30 } },
            _count: { _all: true },
        }),
        prisma.activityLog.groupBy({
            by: ["userId"],
            where: { userId: { in: menteeIds } },
            _max: { createdAt: true },
        }),
    ]);

    const subCount = new Map(submissions.map((s) => [s.menteeId, s._count._all]));
    const lastMap = new Map(lastActive.map((a) => [a.userId, a._max.createdAt]));

    for (const id of menteeIds) {
        let held = 0, present = 0, late = 0, submitted = 0, onTime = 0;
        for (const l of links.filter((x) => x.menteeId === id)) {
            for (const m of l.mentorship.meetings) {
                held++;
                const att = m.attendances.find((a) => a.userId === id);
                if (att?.checkInTime) {
                    present++;
                    if ((att.lateMinutes ?? 0) > 0) late++;
                }
                const ref = m.sessionReflections.find((r) => r.menteeId === id && r.status !== "draft");
                if (ref) {
                    submitted++;
                    const deadline = m.scheduledAt.getTime() + (m.duration * 60_000) + REFLECTION_DEADLINE_HOURS * 3600_000;
                    if (!ref.submittedAt || ref.submittedAt.getTime() <= deadline) onTime++;
                }
            }
        }

        const mine = activity.filter((a) => a.userId === id);
        const activeDays = new Set(mine.filter((a) => a.createdAt >= since14).map((a) => a.createdAt.toISOString().slice(0, 10))).size;
        const subs = subCount.get(id) ?? 0;

        const attendanceRate = held ? present / held : 0;
        const reflectionRate = held ? (onTime + (submitted - onTime) * 0.5) / held : 0;
        const activityRate = Math.min(activeDays / 8, 1);
        const subRate = Math.min(subs / 2, 1);
        const score = Math.round(100 * (0.4 * attendanceRate + 0.3 * reflectionRate + 0.2 * activityRate + 0.1 * subRate));

        out.set(id, {
            menteeId: id, meetingsHeld: held, present, late,
            reflectionsSubmitted: submitted, reflectionsOnTime: onTime,
            submissions30d: subs, activeDays14d: activeDays, actions30d: mine.length,
            lastActiveAt: lastMap.get(id) ?? null, score,
        });
    }
    return out;
}

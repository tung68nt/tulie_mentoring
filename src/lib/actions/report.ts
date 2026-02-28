"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export async function getMenteeStats(specificUserId?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    const isAdmin = role === "admin" || role === "viewer";

    // If specificUserId is provided, use it (only if authorized or if it's the current user)
    // If not, use session.user.id for mentees, or global stats for admin/viewer
    const targetUserId = specificUserId || session.user.id;

    if (!targetUserId && !isAdmin) {
        return {
            attendanceRate: 0,
            avgGoalProgress: 0,
            taskCompletionRate: 0,
            totalTasks: 0,
            completedTasks: 0,
            presentMeetings: 0,
            totalMeetings: 0,
            recentActivitiesCount: 0
        };
    }

    // Authorization check: only admin/viewer or the owner can see specific stats
    if (specificUserId && !isAdmin && specificUserId !== session.user.id) {
        throw new Error("Unauthorized access to specific user stats");
    }

    // Determine filter based on whether we want global stats or specific user stats
    const userFilter = (isAdmin && !specificUserId) ? {} : { userId: targetUserId! };
    const menteeFilter = (isAdmin && !specificUserId) ? {} : { menteeId: targetUserId! };
    const goalFilter = (isAdmin && !specificUserId) ? {} : {
        mentorship: {
            mentees: {
                some: { menteeId: targetUserId! }
            }
        }
    };

    // 1. Attendance Rate
    const totalMeetings = await prisma.attendance.count({
        where: userFilter
    });
    const presentMeetings = await prisma.attendance.count({
        where: { ...userFilter, status: "present" }
    });
    const attendanceRate = totalMeetings > 0 ? Math.round((presentMeetings / totalMeetings) * 100) : 0;

    // 2. Goal Progress
    const goals = await prisma.goal.findMany({
        where: goalFilter
    });
    const avgGoalProgress = goals.length > 0
        ? Math.round(goals.reduce((acc, goal) => acc + (goal.currentValue || 0), 0) / goals.length)
        : 0;

    // 3. Tasks Completion
    const totalTasks = await prisma.todoItem.count({
        where: menteeFilter
    });
    const completedTasks = await prisma.todoItem.count({
        where: { ...menteeFilter, status: "done" }
    });
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 4. Activity Trends (count activities in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivitiesCount = await prisma.activityLog.count({
        where: {
            ...userFilter,
            createdAt: { gte: sevenDaysAgo }
        }
    });

    return {
        attendanceRate,
        avgGoalProgress,
        taskCompletionRate,
        totalTasks,
        completedTasks,
        presentMeetings,
        totalMeetings,
        recentActivitiesCount
    };
}

export async function getProgramProgress(specificUserId?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;
    const role = (session.user as any).role;
    const isAdmin = role === "admin" || role === "viewer";
    const targetUserId = specificUserId || userId;

    // Find the current active mentorship for the user (or any active mentorship for admin)
    let mentorship = await prisma.mentorship.findFirst({
        where: {
            mentees: { some: { menteeId: targetUserId } },
            status: "active"
        },
        include: {
            programCycle: true
        }
    });

    // If admin has no mentorship as mentee, find any active mentorship
    if (!mentorship && isAdmin) {
        mentorship = await prisma.mentorship.findFirst({
            where: { status: "active" },
            include: { programCycle: true }
        });
    }

    if (!mentorship) return null;

    const startDate = mentorship.programCycle.startDate;
    const endDate = mentorship.programCycle.endDate;

    // Fetch activity logs for the program period
    const activityFilter = (isAdmin && !specificUserId) ? {} : { userId: targetUserId };
    const activities = await prisma.activityLog.findMany({
        where: {
            ...activityFilter,
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        select: {
            createdAt: true
        }
    });

    // Fetch daily diary entries from portfolio (may not exist for admin)
    let portfolio = null;
    try {
        portfolio = await prisma.portfolio.findUnique({
            where: { menteeId: targetUserId },
            include: {
                entries: {
                    where: { type: "daily_log" },
                    orderBy: { createdAt: "asc" }
                }
            }
        });
    } catch (e) {
        // Portfolio may not exist for this user, that's fine
    }

    // Group activities by day
    const activityMap: Record<string, number> = {};
    activities.forEach(log => {
        const dateStr = log.createdAt.toISOString().split("T")[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    });

    // Group diary entries by day
    const diaryMap: Record<string, any> = {};
    portfolio?.entries?.forEach((entry: any) => {
        const dateStr = entry.createdAt.toISOString().split("T")[0];
        diaryMap[dateStr] = {
            id: entry.id,
            content: entry.content,
            title: entry.title
        };
    });

    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        activityMap,
        diaryMap
    };
}

export async function saveDailyLog(dateStr: string, content: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;
    const date = new Date(dateStr);

    // Find or create portfolio for user
    const portfolio = await prisma.portfolio.upsert({
        where: { menteeId: userId },
        update: {},
        create: { menteeId: userId }
    });

    // Find if there's already an entry for this exact day (within 00:00:00 to 23:59:59)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const existingEntry = await prisma.portfolioEntry.findFirst({
        where: {
            portfolioId: portfolio.id,
            type: "daily_log",
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        }
    });

    if (existingEntry) {
        await prisma.portfolioEntry.update({
            where: { id: existingEntry.id },
            data: { content }
        });
    } else {
        await prisma.portfolioEntry.create({
            data: {
                portfolioId: portfolio.id,
                title: `Nhật ký ngày ${format(date, "dd/MM/yyyy")}`,
                content,
                type: "daily_log",
                createdAt: date // Set the date manually for the entry
            }
        });
    }

    revalidatePath("/reports");
    return { success: true };
}



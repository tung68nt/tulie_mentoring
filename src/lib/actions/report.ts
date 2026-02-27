"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getMenteeStats(specificUserId?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    const isAdmin = role === "admin" || role === "viewer";

    // If specificUserId is provided, use it (only if authorized or if it's the current user)
    // If not, use session.user.id for mentees, or global stats for admin/viewer
    const targetUserId = specificUserId || session.user.id!;

    // Authorization check: only admin/viewer or the owner can see specific stats
    if (specificUserId && !isAdmin && specificUserId !== session.user.id) {
        throw new Error("Unauthorized access to specific user stats");
    }

    // Determine filter based on whether we want global stats or specific user stats
    const userFilter = (isAdmin && !specificUserId) ? {} : { userId: targetUserId };
    const menteeFilter = (isAdmin && !specificUserId) ? {} : { menteeId: targetUserId };

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
        where: (isAdmin && !specificUserId) ? {} : {
            mentorship: {
                mentees: {
                    some: { menteeId: targetUserId }
                }
            }
        }
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

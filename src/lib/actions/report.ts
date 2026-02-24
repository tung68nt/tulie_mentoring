"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getMenteeStats() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const userId = session.user.id!;

    // 1. Attendance Rate
    const totalMeetings = await prisma.attendance.count({
        where: { userId }
    });
    const presentMeetings = await prisma.attendance.count({
        where: { userId, status: "present" }
    });
    const attendanceRate = totalMeetings > 0 ? Math.round((presentMeetings / totalMeetings) * 100) : 0;

    // 2. Goal Progress
    const goals = await prisma.goal.findMany({
        where: {
            mentorship: {
                mentees: {
                    some: { menteeId: userId }
                }
            }
        }
    });
    const avgGoalProgress = goals.length > 0
        ? Math.round(goals.reduce((acc, goal) => acc + (goal.currentValue || 0), 0) / goals.length)
        : 0;

    // 3. Tasks Completion
    const totalTasks = await prisma.todoItem.count({
        where: { menteeId: userId }
    });
    const completedTasks = await prisma.todoItem.count({
        where: { menteeId: userId, status: "done" }
    });
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 4. Activity Trends (count activities in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivitiesCount = await prisma.activityLog.count({
        where: {
            userId,
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

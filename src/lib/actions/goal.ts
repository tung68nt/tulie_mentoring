"use server";

import { prisma } from "@/lib/db";
import { goalSchema, type GoalInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { requireAuth, requireMentorshipAccess, requireGoalAccess } from "@/lib/permissions";
import { logActivity } from "./activity";

export async function createGoal(data: GoalInput) {
    const { userId, role } = await requireAuth();

    const validatedData = goalSchema.parse(data);

    // Verify user has access to this mentorship
    await requireMentorshipAccess(validatedData.mentorshipId, userId, role);

    const { subGoals, ...goalData } = validatedData;

    const goal = await prisma.goal.create({
        data: {
            ...goalData,
            creatorId: userId,
            status: "in_progress",
            subGoals: subGoals && subGoals.length > 0 ? {
                create: subGoals.map(sg => ({
                    title: sg.title,
                    weight: sg.weight,
                    currentValue: sg.currentValue
                }))
            } : undefined
        },
        include: { subGoals: true }
    });

    // If sub-goals exist, calculate initial progress
    if (goal.subGoals.length > 0) {
        await recalculateGoalProgress(goal.id);
    }

    revalidatePath("/goals");
    revalidatePath(`/admin/mentorships/${validatedData.mentorshipId}`);
    return goal;
}

async function recalculateGoalProgress(goalId: string) {
    const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: { subGoals: true }
    });

    if (!goal || goal.subGoals.length === 0) return;

    const totalWeight = goal.subGoals.reduce((sum: number, sg: any) => sum + sg.weight, 0);
    const weightedSum = goal.subGoals.reduce((sum: number, sg: any) => sum + (sg.currentValue * sg.weight), 0);

    // Ensure we don't divide by zero
    const progress = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    await prisma.goal.update({
        where: { id: goalId },
        data: {
            currentValue: progress,
            status: progress >= 100 ? "completed" : "in_progress",
            completedAt: progress >= 100 ? new Date() : null,
        }
    });

    return progress;
}

export async function updateSubGoalProgress(subGoalId: string, value: number, note?: string) {
    const { userId, role } = await requireAuth();

    // Fetch sub-goal with its parent goal to verify access
    const subGoal = await prisma.subGoal.findUnique({
        where: { id: subGoalId },
        include: { goal: { select: { id: true, mentorshipId: true } } }
    });

    if (!subGoal) throw new Error("Sub-goal not found");

    // Verify user has access to the mentorship that owns this goal
    await requireMentorshipAccess(subGoal.goal.mentorshipId, userId, role);

    const updated = await prisma.subGoal.update({
        where: { id: subGoalId },
        data: { currentValue: value },
        include: { goal: true }
    });

    const overallProgress = await recalculateGoalProgress(subGoal.goalId);

    if (note) {
        await prisma.progressNote.create({
            data: {
                goalId: subGoal.goalId,
                note: `[${updated.title}] ${note}`,
                value: overallProgress || 0
            }
        });
    }

    revalidatePath("/goals");
    revalidatePath(`/admin/mentorships/${subGoal.goal.mentorshipId}`);
    return updated;
}

export async function updateGoalProgress(id: string, value: number, note?: string) {
    const { userId, role } = await requireAuth();

    // Verify access to this goal's mentorship
    const { goal: goalMeta } = await requireGoalAccess(id, userId, role);

    // Check if goal has subgoals
    const goalWithSubGoals = await prisma.goal.findUnique({
        where: { id },
        include: { subGoals: true }
    });

    if (goalWithSubGoals?.subGoals.length && goalWithSubGoals.subGoals.length > 0) {
        throw new Error("Mục tiêu này có mục tiêu con, vui lòng cập nhật tiến độ qua các mục tiêu con.");
    }

    const goal = await prisma.goal.update({
        where: { id },
        data: {
            currentValue: value,
            status: value >= 100 ? "completed" : "in_progress",
            completedAt: value >= 100 ? new Date() : null,
            progressNotes: note ? {
                create: {
                    note,
                    value,
                }
            } : undefined,
        },
    });

    revalidatePath("/goals");
    revalidatePath(`/admin/mentorships/${goal.mentorshipId}`);
    return goal;
}

export async function getGoals(mentorshipId: string) {
    const { userId, role } = await requireAuth();

    // Verify user has access to this mentorship
    await requireMentorshipAccess(mentorshipId, userId, role);

    const goals = await prisma.goal.findMany({
        where: { mentorshipId },
        include: {
            subGoals: {
                orderBy: { createdAt: "asc" }
            },
            progressNotes: {
                orderBy: { createdAt: "desc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return JSON.parse(JSON.stringify(goals));
}

export async function confirmGoal(id: string) {
    const { userId, role } = await requireAuth();

    // Only mentors can confirm — and they must be the mentor of this goal's match
    if (role !== "mentor" && role !== "admin" && role !== "program_manager") {
        throw new Error("Only mentors can confirm goals");
    }

    // Verify this mentor belongs to the goal's mentorship
    const { goal } = await requireGoalAccess(id, userId, role);

    // For non-admin, verify they are the mentor (not just any member)
    if (role === "mentor") {
        const mentorship = await prisma.mentorship.findUnique({
            where: { id: goal.mentorshipId },
            select: { mentorId: true },
        });
        if (mentorship?.mentorId !== userId) {
            throw new Error("Unauthorized: Only the assigned mentor can confirm goals");
        }
    }

    const updated = await prisma.goal.update({
        where: { id },
        data: { mentorConfirmed: true },
    });

    // Audit log for sensitive action
    await logActivity("confirm_goal", id, "goal", {
        title: updated.title,
        mentorshipId: goal.mentorshipId,
    });

    revalidatePath("/goals");
    revalidatePath(`/admin/mentorships/${goal.mentorshipId}`);
    return updated;
}

export async function deleteGoal(id: string) {
    const { userId, role } = await requireAuth();

    // Verify access to this goal
    const { goal, memberRole } = await requireGoalAccess(id, userId, role);

    // Mentees cannot delete confirmed goals
    if (memberRole === "mentee" && goal.mentorConfirmed) {
        throw new Error("Cannot delete a confirmed goal");
    }

    await prisma.goal.delete({
        where: { id },
    });

    // Audit log for sensitive action
    await logActivity("delete_goal", id, "goal", {
        mentorshipId: goal.mentorshipId,
        wasConfirmed: goal.mentorConfirmed,
    });

    revalidatePath("/goals");
    revalidatePath(`/admin/mentorships/${goal.mentorshipId}`);
    return goal;
}

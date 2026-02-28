"use server";

import { prisma } from "@/lib/db";
import { goalSchema, type GoalInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createGoal(data: GoalInput) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const validatedData = goalSchema.parse(data);
    const { subGoals, ...goalData } = validatedData;

    const goal = await prisma.goal.create({
        data: {
            ...goalData,
            creatorId: session.user.id!,
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

    const totalWeight = goal.subGoals.reduce((sum, sg) => sum + sg.weight, 0);
    const weightedSum = goal.subGoals.reduce((sum, sg) => sum + (sg.currentValue * sg.weight), 0);

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
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const subGoal = await prisma.subGoal.update({
        where: { id: subGoalId },
        data: { currentValue: value },
        include: { goal: true }
    });

    const overallProgress = await recalculateGoalProgress(subGoal.goalId);

    if (note) {
        await prisma.progressNote.create({
            data: {
                goalId: subGoal.goalId,
                note: `[${subGoal.title}] ${note}`,
                value: overallProgress || 0
            }
        });
    }

    revalidatePath("/goals");
    revalidatePath(`/admin/mentorships/${subGoal.goal.mentorshipId}`);
    return subGoal;
}

export async function updateGoalProgress(id: string, value: number, note?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Check if goal has subgoals. If it does, we shouldn't update progress directly like this
    // but for backward compatibility or simple goals, we allow it.
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
    return await prisma.goal.findMany({
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
}

export async function confirmGoal(id: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "mentor") {
        throw new Error("Only mentors can confirm goals");
    }

    const goal = await prisma.goal.update({
        where: { id },
        data: { mentorConfirmed: true },
    });

    revalidatePath("/goals");
    revalidatePath(`/admin/mentorships/${goal.mentorshipId}`);
    return goal;
}

export async function deleteGoal(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const goal = await prisma.goal.findUnique({
        where: { id },
    });

    if (!goal) throw new Error("Goal not found");

    const role = (session.user as any).role;
    if (role === "mentee" && goal.mentorConfirmed) {
        throw new Error("Cannot delete a confirmed goal");
    }

    await prisma.goal.delete({
        where: { id },
    });

    revalidatePath("/goals");
    revalidatePath(`/admin/mentorships/${goal.mentorshipId}`);
    return goal;
}

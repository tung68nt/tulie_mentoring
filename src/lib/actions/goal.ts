"use server";

import { prisma } from "@/lib/db";
import { goalSchema, type GoalInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createGoal(data: GoalInput) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const validatedData = goalSchema.parse(data);

    const goal = await prisma.goal.create({
        data: {
            ...validatedData,
            creatorId: session.user.id!,
            status: "in_progress",
        },
    });

    revalidatePath("/goals");
    revalidatePath(`/admin/mentorships/${validatedData.mentorshipId}`);
    return goal;
}

export async function updateGoalProgress(id: string, value: number, note?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

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
            progressNotes: {
                orderBy: { createdAt: "desc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function deleteGoal(id: string) {
    const goal = await prisma.goal.delete({
        where: { id },
    });
    revalidatePath("/goals");
    revalidatePath(`/admin/mentorships/${goal.mentorshipId}`);
    return goal;
}

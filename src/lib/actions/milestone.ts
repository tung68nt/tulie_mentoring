"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMilestones(programCycleId?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Get the active program cycle if not specified
    let cycleId = programCycleId;
    if (!cycleId) {
        const activeCycle = await prisma.programCycle.findFirst({
            where: { status: "active" },
            select: { id: true },
            orderBy: { createdAt: "desc" }
        });
        cycleId = activeCycle?.id;
    }

    if (!cycleId) return { milestones: [], programCycle: null };

    const programCycle = await prisma.programCycle.findUnique({
        where: { id: cycleId },
        select: { id: true, name: true, startDate: true, endDate: true, status: true }
    });

    const milestones = await prisma.programMilestone.findMany({
        where: { programCycleId: cycleId },
        orderBy: { date: "asc" },
    });

    return {
        milestones: JSON.parse(JSON.stringify(milestones)),
        programCycle: programCycle ? JSON.parse(JSON.stringify(programCycle)) : null,
    };
}

export async function createMilestone(data: {
    title: string;
    description?: string;
    date: string;
    icon?: string;
    color?: string;
    programCycleId: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;
    if (!["admin", "manager", "program_manager"].includes(role)) {
        throw new Error("Unauthorized");
    }

    const milestone = await prisma.programMilestone.create({
        data: {
            title: data.title,
            description: data.description,
            date: new Date(data.date),
            icon: data.icon || "calendar",
            color: data.color || "blue",
            programCycleId: data.programCycleId,
        }
    });

    revalidatePath("/timeline");
    return JSON.parse(JSON.stringify(milestone));
}

export async function deleteMilestone(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;
    if (!["admin", "manager", "program_manager"].includes(role)) {
        throw new Error("Unauthorized");
    }

    await prisma.programMilestone.delete({ where: { id } });
    revalidatePath("/timeline");
}

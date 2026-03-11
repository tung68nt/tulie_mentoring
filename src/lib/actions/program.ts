"use server";

import { prisma } from "@/lib/db";
import { programCycleSchema, type ProgramCycleInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createProgramCycle(data: ProgramCycleInput) {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager")) {
        throw new Error("Unauthorized");
    }

    const validatedData = programCycleSchema.parse(data);

    const cycle = await prisma.programCycle.create({
        data: {
            name: validatedData.name,
            description: validatedData.description,
            startDate: validatedData.startDate,
            endDate: validatedData.endDate,
            status: validatedData.status,
        },
    });

    revalidatePath("/admin/programs");
    return JSON.parse(JSON.stringify(cycle));
}

export async function updateProgramCycle(id: string, data: ProgramCycleInput) {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager")) {
        throw new Error("Unauthorized");
    }

    const validatedData = programCycleSchema.parse(data);

    const cycle = await prisma.programCycle.update({
        where: { id },
        data: {
            name: validatedData.name,
            description: validatedData.description,
            startDate: validatedData.startDate,
            endDate: validatedData.endDate,
            status: validatedData.status,
        },
    });

    revalidatePath("/admin/programs");
    return JSON.parse(JSON.stringify(cycle));
}

export async function deleteProgramCycle(id: string) {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager")) {
        throw new Error("Unauthorized");
    }

    // Check if there are mentorships associated with this cycle
    const mentorshipCount = await prisma.mentorship.count({
        where: { programCycleId: id },
    });

    if (mentorshipCount > 0) {
        throw new Error("Không thể xóa chương trình đã có mentorship. Vui lòng xóa các mentorship liên quan trước.");
    }

    await prisma.programCycle.delete({
        where: { id },
    });

    revalidatePath("/admin/programs");
    return { success: true };
}

export async function getAllProgramCycles() {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager")) {
        throw new Error("Unauthorized");
    }

    const cycles = await prisma.programCycle.findMany({
        orderBy: { startDate: "desc" },
    });

    return JSON.parse(JSON.stringify(cycles));
}

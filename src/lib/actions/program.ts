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

    try {
        await prisma.programCycle.delete({
            where: { id },
        });

        revalidatePath("/admin/programs");
        return { success: true };
    } catch (err: any) {
        if (err.code === "P2003") {
            return { success: false, error: "Không thể xóa do chương trình này đang được gắn với Quy trình đánh giá thu hoạch, môn học hoặc dữ liệu quan trọng." };
        }
        return { success: false, error: "Lỗi hệ thống khi xóa chương trình." };
    }
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

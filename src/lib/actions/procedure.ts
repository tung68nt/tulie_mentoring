"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Create a new procedure (admin/manager/facilitator only)
export async function createProcedure(data: {
    title: string;
    description?: string;
    type: "file" | "form" | "link";
    fileUrl?: string;
    formFields?: string; // JSON string
    targetRole: "mentee" | "mentor" | "both";
    isRequired?: boolean;
    deadline?: string;
    programCycleId?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;
    if (!["admin", "manager", "facilitator", "program_manager"].includes(role)) {
        throw new Error("Unauthorized");
    }

    const procedure = await prisma.procedure.create({
        data: {
            title: data.title,
            description: data.description,
            type: data.type,
            fileUrl: data.fileUrl,
            formFields: data.formFields,
            targetRole: data.targetRole,
            isRequired: data.isRequired ?? true,
            deadline: data.deadline ? new Date(data.deadline) : null,
            createdById: session.user.id!,
            programCycleId: data.programCycleId || null,
        }
    });

    revalidatePath("/procedures");
    return JSON.parse(JSON.stringify(procedure));
}

// Get procedures (role-aware)
export async function getProcedures() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;
    const userId = session.user.id!;
    const isAdmin = ["admin", "manager", "facilitator", "program_manager"].includes(role);

    const where: any = {};
    if (!isAdmin) {
        // Only show procedures targeting user's role
        where.OR = [
            { targetRole: role },
            { targetRole: "both" },
        ];
    }

    const procedures = await prisma.procedure.findMany({
        where,
        include: {
            submissions: isAdmin ? {
                include: {
                    procedure: { select: { title: true } },
                }
            } : {
                where: { userId },
            },
            programCycle: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return JSON.parse(JSON.stringify(procedures));
}

// Submit a procedure (mentee/mentor)
export async function submitProcedure(procedureId: string, data: {
    fileUrl?: string;
    formData?: string;
    note?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const submission = await prisma.procedureSubmission.upsert({
        where: {
            procedureId_userId: {
                procedureId,
                userId: session.user.id!,
            }
        },
        create: {
            procedureId,
            userId: session.user.id!,
            status: "submitted",
            fileUrl: data.fileUrl,
            formData: data.formData,
            note: data.note,
            submittedAt: new Date(),
        },
        update: {
            status: "submitted",
            fileUrl: data.fileUrl,
            formData: data.formData,
            note: data.note,
            submittedAt: new Date(),
        }
    });

    revalidatePath("/procedures");
    return JSON.parse(JSON.stringify(submission));
}

// Review a submission (admin/manager/facilitator)
export async function reviewSubmission(submissionId: string, data: {
    status: "approved" | "rejected";
    reviewNote?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;
    if (!["admin", "manager", "facilitator", "program_manager"].includes(role)) {
        throw new Error("Unauthorized");
    }

    const updated = await prisma.procedureSubmission.update({
        where: { id: submissionId },
        data: {
            status: data.status,
            reviewNote: data.reviewNote,
            reviewedById: session.user.id!,
            reviewedAt: new Date(),
        }
    });

    revalidatePath("/procedures");
    return JSON.parse(JSON.stringify(updated));
}

// Delete a procedure
export async function deleteProcedure(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;
    if (!["admin", "manager", "facilitator", "program_manager"].includes(role)) {
        throw new Error("Unauthorized");
    }

    await prisma.procedure.delete({ where: { id } });
    revalidatePath("/procedures");
}

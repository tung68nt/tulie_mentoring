"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { canViewMentee, visibleMenteeIds } from "@/lib/access";

const WRITE_ROLES = ["admin", "program_manager"];
const isHttp = (u?: string) => !u || /^https?:\/\//i.test(u);

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
    if (![...WRITE_ROLES, "facilitator"].includes(role)) {
        throw new Error("Unauthorized");
    }
    if (!isHttp(data.fileUrl)) throw new Error("Liên kết không hợp lệ");

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
    // Facilitator chỉ thấy bài nộp của mentee thuộc phạm vi được giao
    const scope = role === "facilitator" ? await visibleMenteeIds(userId, role) : null;

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
                ...(scope ? { where: { userId: { in: scope } } } : {}),
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
    const role = (session.user as any).role;

    const proc = await prisma.procedure.findUnique({ where: { id: procedureId }, select: { targetRole: true } });
    if (!proc || (proc.targetRole !== "both" && proc.targetRole !== role)) throw new Error("Không tìm thấy thủ tục");
    if (!isHttp(data.fileUrl)) throw new Error("Liên kết không hợp lệ");
    if ((data.note?.length ?? 0) > 5000 || (data.formData?.length ?? 0) > 50000) throw new Error("Nội dung quá dài");

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
    if (![...WRITE_ROLES, "facilitator"].includes(role)) {
        throw new Error("Unauthorized");
    }
    const target = await prisma.procedureSubmission.findUnique({ where: { id: submissionId }, select: { userId: true } });
    if (!target) throw new Error("Không tìm thấy bài nộp");
    if (role === "facilitator" && !(await canViewMentee(session.user.id!, role, target.userId))) throw new Error("Unauthorized");

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
    if (!WRITE_ROLES.includes(role)) {
        throw new Error("Unauthorized");
    }

    await prisma.procedure.delete({ where: { id } });
    revalidatePath("/procedures");
}

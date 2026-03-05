"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createEvaluationForm(data: {
    title: string;
    description?: string;
}) {
    const session = await auth();
    if (!session || !["admin", "facilitator", "program_manager"].includes((session.user as any).role)) {
        throw new Error("Unauthorized");
    }

    const form = await prisma.evaluationForm.create({
        data: {
            title: data.title,
            description: data.description,
        },
    });

    revalidatePath("/facilitator/forms");
    return form;
}

export async function updateEvaluationForm(id: string, data: {
    title: string;
    description?: string;
    isActive?: boolean;
}) {
    const session = await auth();
    if (!session || !["admin", "facilitator", "program_manager"].includes((session.user as any).role)) {
        throw new Error("Unauthorized");
    }

    const form = await prisma.evaluationForm.update({
        where: { id },
        data,
    });

    revalidatePath("/facilitator/forms");
    return form;
}

export async function addQuestion(formId: string, data: {
    type: string;
    label: string;
    options?: string;
    order: number;
    weight?: number;
}) {
    const session = await auth();
    if (!session || !["admin", "facilitator", "program_manager"].includes((session.user as any).role)) {
        throw new Error("Unauthorized");
    }

    const question = await prisma.evaluationQuestion.create({
        data: {
            formId,
            ...data,
        },
    });

    revalidatePath(`/facilitator/forms/${formId}`);
    return question;
}

export async function deleteQuestion(id: string, formId: string) {
    const session = await auth();
    if (!session || !["admin", "facilitator", "program_manager"].includes((session.user as any).role)) {
        throw new Error("Unauthorized");
    }

    await prisma.evaluationQuestion.delete({
        where: { id },
    });

    revalidatePath(`/facilitator/forms/${formId}`);
}

export async function getEvaluationForms() {
    return await prisma.evaluationForm.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { questions: true, responses: true } } },
    });
}

export async function getFormWithQuestions(id: string) {
    return await prisma.evaluationForm.findUnique({
        where: { id },
        include: {
            questions: {
                orderBy: { order: "asc" },
            },
        },
    });
}

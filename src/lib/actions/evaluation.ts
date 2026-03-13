"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireAuth, requireEvaluationSubmitAccess, isAdminLevel } from "@/lib/permissions";

// ─── Helpers ──────────────────────────────────────────
async function requireFormAccess() {
    const session = await auth();
    if (!session || !["admin", "facilitator", "program_manager"].includes((session.user as any).role)) {
        throw new Error("Unauthorized");
    }
    return session;
}

// ─── Form CRUD ────────────────────────────────────────
export async function createEvaluationForm(data: {
    title: string;
    description?: string;
}) {
    await requireFormAccess();

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
    title?: string;
    description?: string;
    isActive?: boolean;
}) {
    await requireFormAccess();

    const form = await prisma.evaluationForm.update({
        where: { id },
        data,
    });

    revalidatePath("/facilitator/forms");
    revalidatePath(`/facilitator/forms/${id}`);
    return form;
}

export async function deleteEvaluationForm(id: string) {
    await requireFormAccess();

    await prisma.evaluationForm.delete({
        where: { id },
    });

    revalidatePath("/facilitator/forms");
}

export async function toggleFormActive(id: string) {
    await requireFormAccess();

    const form = await prisma.evaluationForm.findUnique({ where: { id } });
    if (!form) throw new Error("Form not found");

    const updated = await prisma.evaluationForm.update({
        where: { id },
        data: { isActive: !form.isActive },
    });

    revalidatePath("/facilitator/forms");
    revalidatePath(`/facilitator/forms/${id}`);
    return updated;
}

// ─── Question CRUD ────────────────────────────────────
export async function addQuestion(formId: string, data: {
    type: string;
    label: string;
    options?: string;
    order: number;
    weight?: number;
    required?: boolean;
    description?: string;
}) {
    await requireFormAccess();

    const question = await prisma.evaluationQuestion.create({
        data: {
            formId,
            type: data.type,
            label: data.label,
            options: data.options,
            order: data.order,
            weight: data.weight ?? 1.0,
        },
    });

    revalidatePath(`/facilitator/forms/${formId}`);
    return question;
}

export async function updateQuestion(id: string, formId: string, data: {
    label?: string;
    type?: string;
    options?: string;
    weight?: number;
}) {
    await requireFormAccess();

    const question = await prisma.evaluationQuestion.update({
        where: { id },
        data,
    });

    revalidatePath(`/facilitator/forms/${formId}`);
    return question;
}

export async function deleteQuestion(id: string, formId: string) {
    await requireFormAccess();

    await prisma.evaluationQuestion.delete({
        where: { id },
    });

    revalidatePath(`/facilitator/forms/${formId}`);
}

export async function reorderQuestions(formId: string, orderedIds: string[]) {
    await requireFormAccess();

    await prisma.$transaction(
        orderedIds.map((id, index) =>
            prisma.evaluationQuestion.update({
                where: { id },
                data: { order: index + 1 },
            })
        )
    );

    revalidatePath(`/facilitator/forms/${formId}`);
}

// ─── Form Data Fetching ───────────────────────────────
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
            _count: { select: { responses: true } },
        },
    });
}

// ─── Response Submission ──────────────────────────────
export async function submitFormResponse(formId: string, answers: {
    questionId: string;
    value: string;
    score?: number;
}[], targetMenteeId?: string) {
    const { userId, role } = await requireAuth();

    // Only admin, facilitator, program_manager, and mentor can submit evaluations
    await requireEvaluationSubmitAccess(userId, role);

    const response = await prisma.evaluationResponse.create({
        data: {
            formId,
            submitterId: userId,
            targetMenteeId: targetMenteeId || null,
            answers: {
                create: answers.map(a => ({
                    questionId: a.questionId,
                    value: a.value,
                    score: a.score,
                })),
            },
        },
        include: { answers: true },
    });

    revalidatePath(`/facilitator/forms/${formId}`);
    revalidatePath(`/facilitator/forms/${formId}/responses`);
    return response;
}

// ─── Response Fetching ────────────────────────────────
export async function getFormResponses(formId: string) {
    await requireFormAccess();

    return await prisma.evaluationResponse.findMany({
        where: { formId },
        include: {
            submitter: { select: { id: true, firstName: true, lastName: true, email: true, image: true } },
            targetMentee: { select: { id: true, firstName: true, lastName: true, email: true, image: true } },
            answers: {
                include: {
                    question: { select: { id: true, label: true, type: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getFormAnalytics(formId: string) {
    await requireFormAccess();

    const form = await prisma.evaluationForm.findUnique({
        where: { id: formId },
        include: {
            questions: { orderBy: { order: "asc" } },
            responses: {
                include: {
                    answers: true,
                    submitter: { select: { firstName: true, lastName: true } },
                    targetMentee: { select: { firstName: true, lastName: true } },
                },
            },
        },
    });

    if (!form) throw new Error("Form not found");

    const totalResponses = form.responses.length;
    const questionStats = form.questions.map(q => {
        const answers = form.responses.flatMap(r => r.answers.filter(a => a.questionId === q.id));
        const values = answers.map(a => a.value);

        if (q.type === "RATING" || q.type === "SCALE") {
            const nums = values.map(Number).filter(n => !isNaN(n));
            const avg = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
            const min = nums.length > 0 ? Math.min(...nums) : 0;
            const max = nums.length > 0 ? Math.max(...nums) : 0;
            return { questionId: q.id, label: q.label, type: q.type, count: nums.length, avg: Math.round(avg * 100) / 100, min, max };
        }

        if (q.type === "MULTIPLE_CHOICE" || q.type === "CHECKBOX" || q.type === "DROPDOWN") {
            const distribution: Record<string, number> = {};
            values.forEach(v => {
                // CHECKBOX may have comma-separated values
                const choices = v.split(",").map(c => c.trim());
                choices.forEach(c => { distribution[c] = (distribution[c] || 0) + 1; });
            });
            return { questionId: q.id, label: q.label, type: q.type, count: values.length, distribution };
        }

        // TEXT, PARAGRAPH, DATE
        return { questionId: q.id, label: q.label, type: q.type, count: values.length, sampleAnswers: values.slice(0, 5) };
    });

    return { formId, totalResponses, questionStats };
}

// ─── Delete Response ──────────────────────────────────
export async function deleteFormResponse(responseId: string, formId: string) {
    await requireFormAccess();

    await prisma.evaluationResponse.delete({
        where: { id: responseId },
    });

    revalidatePath(`/facilitator/forms/${formId}/responses`);
}

// ─── Get mentees for evaluation target selection ──────
export async function getMenteesForEvaluation() {
    const { userId, role } = await requireAuth();

    // Admin/PM see all mentees
    if (isAdminLevel(role)) {
        return await prisma.user.findMany({
            where: { role: "mentee" },
            select: { id: true, firstName: true, lastName: true, email: true, image: true },
            orderBy: { firstName: "asc" },
        });
    }

    // Facilitators see only mentees in their assigned programs
    if (role === "facilitator") {
        const assignments = await prisma.facilitatorAssignment.findMany({
            where: { facilitatorId: userId },
            select: { programCycleId: true, mentorshipId: true },
        });

        const programCycleIds = assignments
            .map(a => a.programCycleId)
            .filter((id): id is string => id !== null);
        const mentorshipIds = assignments
            .map(a => a.mentorshipId)
            .filter((id): id is string => id !== null);

        return await prisma.user.findMany({
            where: {
                role: "mentee",
                menteeships: {
                    some: {
                        mentorship: {
                            OR: [
                                { programCycleId: { in: programCycleIds } },
                                { id: { in: mentorshipIds } },
                            ],
                        },
                    },
                },
            },
            select: { id: true, firstName: true, lastName: true, email: true, image: true },
            orderBy: { firstName: "asc" },
        });
    }

    // Mentors see only their own mentees
    if (role === "mentor") {
        return await prisma.user.findMany({
            where: {
                role: "mentee",
                menteeships: {
                    some: {
                        mentorship: {
                            mentorId: userId,
                        },
                    },
                },
            },
            select: { id: true, firstName: true, lastName: true, email: true, image: true },
            orderBy: { firstName: "asc" },
        });
    }

    throw new Error("Unauthorized: Cannot access mentee list for evaluation");
}

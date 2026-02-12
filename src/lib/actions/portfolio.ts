"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getPortfolio(menteeId?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const targetId = menteeId || session.user.id!;

    return await prisma.portfolio.findFirst({
        where: { menteeId: targetId },
        include: {
            mentee: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    menteeProfile: true,
                },
            },
        },
    });
}

export async function upsertPortfolio(data: {
    personalityMbti?: string;
    personalityDisc?: string;
    personalityHolland?: string;
    competencies?: string;
    shortTermGoals?: string;
    longTermGoals?: string;
    finalGoalsAchieved?: number;
    finalSkillsGained?: string;
    finalMentorFeedback?: string;
    finalSelfAssessment?: string;
    finalRecommendations?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const existing = await prisma.portfolio.findFirst({
        where: { menteeId: session.user.id! },
    });

    if (existing) {
        const portfolio = await prisma.portfolio.update({
            where: { id: existing.id },
            data: {
                ...data,
                initialCompletedAt: data.personalityMbti && !existing.initialCompletedAt
                    ? new Date()
                    : existing.initialCompletedAt,
            },
        });
        revalidatePath("/portfolio");
        return portfolio;
    }

    const portfolio = await prisma.portfolio.create({
        data: {
            menteeId: session.user.id!,
            ...data,
            initialCompletedAt: data.personalityMbti ? new Date() : null,
        },
    });

    revalidatePath("/portfolio");
    return portfolio;
}

export async function completePortfolio(data: {
    finalGoalsAchieved: number;
    finalSkillsGained: string;
    finalMentorFeedback: string;
    finalSelfAssessment: string;
    finalRecommendations: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const existing = await prisma.portfolio.findFirst({
        where: { menteeId: session.user.id! },
    });

    if (!existing) throw new Error("Portfolio not found");

    const portfolio = await prisma.portfolio.update({
        where: { id: existing.id },
        data: {
            ...data,
            finalCompletedAt: new Date(),
        },
    });

    revalidatePath("/portfolio");
    return portfolio;
}

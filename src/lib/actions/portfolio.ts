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
    shortTermGoals?: string;
    longTermGoals?: string;
    initialStrengths?: string;
    initialWeaknesses?: string;
    initialChallenges?: string;
    initialStartupIdeas?: string;
    initialPersonalNotes?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;
    const existing = await prisma.portfolio.findFirst({
        where: { menteeId: userId },
    });

    // Update MenteeProfile as well to keep current state in sync
    await prisma.menteeProfile.update({
        where: { userId: userId },
        data: {
            strengths: data.initialStrengths,
            weaknesses: data.initialWeaknesses,
            currentChallenges: data.initialChallenges,
            startupIdeas: data.initialStartupIdeas,
            personalNotes: data.initialPersonalNotes,
        }
    });

    if (existing) {
        const portfolio = await prisma.portfolio.update({
            where: { id: existing.id },
            data: {
                ...data,
                initialCompletedAt: (data.personalityMbti || data.initialChallenges) && !existing.initialCompletedAt
                    ? new Date()
                    : existing.initialCompletedAt,
            },
        });
        revalidatePath("/portfolio");
        return portfolio;
    }

    const portfolio = await prisma.portfolio.create({
        data: {
            menteeId: userId,
            ...data,
            initialCompletedAt: (data.personalityMbti || data.initialChallenges) ? new Date() : null,
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
    finalStrengths?: string;
    finalWeaknesses?: string;
    finalChallenges?: string;
    finalStartupIdeas?: string;
    finalPersonalNotes?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;
    const existing = await prisma.portfolio.findFirst({
        where: { menteeId: userId },
    });

    if (!existing) throw new Error("Portfolio not found");

    // Update MenteeProfile to latest state
    await prisma.menteeProfile.update({
        where: { userId: userId },
        data: {
            strengths: data.finalStrengths,
            weaknesses: data.finalWeaknesses,
            currentChallenges: data.finalChallenges,
            startupIdeas: data.finalStartupIdeas,
            personalNotes: data.finalPersonalNotes,
        }
    });

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

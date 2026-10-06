"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getPortfolio(menteeId?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;
    const role = (session.user as any).role;
    const targetId = menteeId || userId;

    // Security check
    if (role !== "admin" && targetId !== userId) {
        // Only admin or the user themselves can see the portfolio
        // Check if mentor?
        if (role === "mentor") {
            const isMentor = await prisma.mentorship.findFirst({
                where: {
                    mentorId: userId,
                    mentees: { some: { menteeId: targetId } }
                }
            });
            if (!isMentor) throw new Error("Unauthorized");
        } else {
            throw new Error("Unauthorized");
        }
    }

    const portfolio = await prisma.portfolio.findUnique({
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
            entries: {
                orderBy: { createdAt: "desc" }
            },
            snapshots: {
                orderBy: { createdAt: "desc" }
            }
        },
    });

    return JSON.parse(JSON.stringify(portfolio));
}

export async function updatePortfolio(data: {
    personalityMbti?: string;
    personalityDisc?: string;
    personalityHolland?: string;
    shortTermGoals?: string;
    longTermGoals?: string;
    strengths?: string;
    weaknesses?: string;
    challenges?: string;
    startupIdeas?: string;
    personalNotes?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;

    // Update MenteeProfile as well for shared access
    if (data.strengths || data.weaknesses || data.challenges || data.startupIdeas || data.personalNotes) {
        await prisma.menteeProfile.update({
            where: { userId: userId },
            data: {
                strengths: data.strengths,
                weaknesses: data.weaknesses,
                currentChallenges: data.challenges,
                startupIdeas: data.startupIdeas,
                personalNotes: data.personalNotes,
            }
        }).catch(() => null); // Ignore if no menteeProfile exists yet
    }

    const portfolio = await prisma.portfolio.upsert({
        where: { menteeId: userId },
        update: data,
        create: {
            menteeId: userId,
            ...data
        }
    });

    revalidatePath("/portfolio");
    return JSON.parse(JSON.stringify(portfolio));
}

export async function addPortfolioEntry(data: {
    title: string;
    content: string;
    type?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;
    const portfolio = await prisma.portfolio.findUnique({
        where: { menteeId: userId }
    });

    if (!portfolio) throw new Error("Portfolio not found. Please initialize your portfolio first.");

    const entry = await prisma.portfolioEntry.create({
        data: {
            portfolioId: portfolio.id,
            title: data.title,
            content: data.content,
            type: data.type || "reflection"
        }
    });

    revalidatePath("/portfolio");
    return JSON.parse(JSON.stringify(entry));
}

export async function createPortfolioSnapshot(title: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;
    const portfolio = await prisma.portfolio.findUnique({
        where: { menteeId: userId }
    });

    if (!portfolio) throw new Error("Portfolio not found.");

    const snapshotData = {
        personalityMbti: portfolio.personalityMbti,
        personalityDisc: portfolio.personalityDisc,
        personalityHolland: portfolio.personalityHolland,
        shortTermGoals: portfolio.shortTermGoals,
        longTermGoals: portfolio.longTermGoals,
        strengths: portfolio.strengths,
        weaknesses: portfolio.weaknesses,
        challenges: portfolio.challenges,
        startupIdeas: portfolio.startupIdeas,
        personalNotes: portfolio.personalNotes,
    };

    const snapshot = await prisma.portfolioSnapshot.create({
        data: {
            portfolioId: portfolio.id,
            title: title || `Snapshot ${new Date().toLocaleDateString()}`,
            data: JSON.stringify(snapshotData)
        }
    });

    revalidatePath("/portfolio");
    return JSON.parse(JSON.stringify(snapshot));
}

export async function deletePortfolioEntry(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const entry = await prisma.portfolioEntry.findUnique({
        where: { id },
        include: { portfolio: true }
    });

    if (!entry || entry.portfolio.menteeId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    await prisma.portfolioEntry.delete({
        where: { id }
    });

    revalidatePath("/portfolio");
}

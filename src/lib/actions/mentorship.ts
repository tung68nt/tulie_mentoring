"use server";

import { prisma } from "@/lib/db";
import { mentorshipSchema, type MentorshipInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createMentorship(data: MentorshipInput) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        throw new Error("Unauthorized");
    }

    const validatedData = mentorshipSchema.parse(data);

    const mentorship = await prisma.mentorship.create({
        data: {
            mentorId: validatedData.mentorId,
            programCycleId: validatedData.programCycleId,
            type: validatedData.type,
            startDate: validatedData.startDate,
            endDate: validatedData.endDate,
            status: "active",
            mentees: {
                create: validatedData.menteeIds.map((id) => ({
                    menteeId: id,
                })),
            },
        },
    });

    revalidatePath("/admin/mentorships");
    return mentorship;
}

export async function getMentorships() {
    return await prisma.mentorship.findMany({
        include: {
            mentor: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                },
            },
            mentees: {
                include: {
                    mentee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            },
            programCycle: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getMentorshipDetail(id: string) {
    return await prisma.mentorship.findUnique({
        where: { id },
        include: {
            mentor: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    bio: true,
                    mentorProfile: true,
                },
            },
            mentees: {
                include: {
                    mentee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            menteeProfile: true,
                        },
                    },
                },
            },
            programCycle: true,
            meetings: {
                orderBy: { scheduledAt: "desc" },
                take: 10,
                include: {
                    attendances: true,
                },
            },
            goals: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
}

export async function getProgramCycles() {
    return await prisma.programCycle.findMany({
        where: { status: "active" },
        orderBy: { startDate: "desc" },
    });
}

export async function getEligibleMentors() {
    return await prisma.user.findMany({
        where: { role: "mentor", isActive: true },
        select: { id: true, firstName: true, lastName: true },
    });
}

export async function getEligibleMentees() {
    return await prisma.user.findMany({
        where: { role: "mentee", isActive: true },
        select: { id: true, firstName: true, lastName: true },
    });
}

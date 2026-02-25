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
    return JSON.parse(JSON.stringify(mentorship));
}

export async function getMentorships() {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const role = (session.user as any).role;

    const where: any = {};
    if (role !== "admin") {
        if (role === "mentor") {
            where.mentorId = userId;
        } else if (role === "mentee") {
            where.mentees = { some: { menteeId: userId } };
        }
    }

    try {
        const mentorships = await prisma.mentorship.findMany({
            where,
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
        return JSON.parse(JSON.stringify(mentorships));
    } catch (error) {
        console.error("Error in getMentorships:", error);
        return [];
    }
}

export async function getMentorshipDetail(id: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const role = (session.user as any).role;

    try {
        const mentorship = await prisma.mentorship.findUnique({
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
                    take: 20,
                    include: {
                        attendances: true,
                        sessionReflections: {
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
                    },
                },
                goals: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!mentorship) return null;

        // Security check: Only admin or members of the mentorship can view details
        if (role !== "admin") {
            const isMentor = mentorship.mentorId === userId;
            const isMentee = mentorship.mentees.some(m => m.menteeId === userId);
            if (!isMentor && !isMentee) {
                throw new Error("Unauthorized access to mentorship details");
            }
        }

        // Flatten reflections for the UI
        const sessionReflections = mentorship.meetings.flatMap(m =>
            m.sessionReflections.map(r => ({
                ...r,
                meeting: { title: m.title, id: m.id }
            }))
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return JSON.parse(JSON.stringify({
            ...mentorship,
            sessionReflections
        }));
    } catch (error) {
        console.error("Error in getMentorshipDetail:", error);
        return null;
    }
}

export async function getProgramCycles() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const cycles = await prisma.programCycle.findMany({
        where: { status: "active" },
        orderBy: { startDate: "desc" },
    });
    return JSON.parse(JSON.stringify(cycles));
}

export async function getEligibleMentors() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        throw new Error("Unauthorized");
    }
    const mentors = await prisma.user.findMany({
        where: { role: "mentor", isActive: true },
        select: { id: true, firstName: true, lastName: true },
    });
    return JSON.parse(JSON.stringify(mentors));
}

export async function getEligibleMentees() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        throw new Error("Unauthorized");
    }
    const mentees = await prisma.user.findMany({
        where: { role: "mentee", isActive: true },
        select: { id: true, firstName: true, lastName: true },
    });
    return JSON.parse(JSON.stringify(mentees));
}

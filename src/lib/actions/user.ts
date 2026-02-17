"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data,
    });

    revalidatePath("/profile");
    return JSON.parse(JSON.stringify(user));
}

export async function getUserProfile(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                mentorProfile: true,
                menteeProfile: true,
            },
        });
        return user ? JSON.parse(JSON.stringify(user)) : null;
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        return null;
    }
}

export async function getAllUsers() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") return [];

    return await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function getUserDetail(userId: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") throw new Error("Unauthorized");

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                mentorProfile: true,
                menteeProfile: true,
                mentorships: {
                    include: {
                        mentees: { include: { mentee: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
                        programCycle: { select: { name: true } },
                        _count: { select: { meetings: true, goals: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
                menteeships: {
                    include: {
                        mentorship: {
                            include: {
                                mentor: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                                programCycle: { select: { name: true } },
                                _count: { select: { meetings: true, goals: true } },
                            },
                        },
                    },
                },
                attendances: {
                    select: { status: true },
                },
                feedbackReceived: {
                    select: { rating: true, content: true, createdAt: true, fromUser: { select: { firstName: true, lastName: true } } },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
            },
        });
        return user ? JSON.parse(JSON.stringify(user)) : null;
    } catch (error) {
        console.error("Error in getUserDetail:", error);
        return null;
    }
}

export async function deleteUser(userId: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        throw new Error("Unauthorized");
    }

    await prisma.user.delete({
        where: { id: userId },
    });

    revalidatePath("/admin/users");
}

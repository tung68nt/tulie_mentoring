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

    // Whitelist only allowed fields to prevent mass assignment
    const { firstName, lastName, phone, bio, avatar } = data;

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            firstName,
            lastName,
            phone,
            bio,
            avatar,
        },
    });

    revalidatePath("/profile");
    return JSON.parse(JSON.stringify(user));
}

export async function getUserProfile(userId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

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
        throw error;
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

export async function updateUserRole(userId: string, newRole: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        throw new Error("Unauthorized");
    }

    // Prevent changing own role
    if (userId === session.user.id) {
        throw new Error("Cannot change your own role");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return JSON.parse(JSON.stringify(updatedUser));
}

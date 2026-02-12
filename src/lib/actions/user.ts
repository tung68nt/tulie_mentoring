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
    return user;
}

export async function getUserProfile(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            mentorProfile: true,
            menteeProfile: true,
        },
    });
}

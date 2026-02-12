"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAvailability(mentorId?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const targetId = mentorId || session.user.id!;

    return await prisma.availability.findMany({
        where: { userId: targetId, isActive: true },
        orderBy: { dayOfWeek: "asc" },
    });
}

export async function setAvailability(slots: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    duration?: number;
}[]) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    if ((session.user as any).role !== "mentor" && (session.user as any).role !== "admin") {
        throw new Error("Only mentors can set availability");
    }

    // Remove existing and recreate
    await prisma.availability.deleteMany({
        where: { userId: session.user.id! },
    });

    const created = await prisma.availability.createMany({
        data: slots.map(slot => ({
            userId: session.user!.id!,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: slot.duration || 60,
        })),
    });

    revalidatePath("/profile");
    revalidatePath("/calendar");
    return created;
}

const dayNames = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export async function getMentorAvailableSlots(mentorId: string) {
    const slots = await prisma.availability.findMany({
        where: { userId: mentorId, isActive: true },
        orderBy: { dayOfWeek: "asc" },
    });

    return slots.map(slot => ({
        ...slot,
        dayName: dayNames[slot.dayOfWeek],
    }));
}

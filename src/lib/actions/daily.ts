"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function getDiariesAndHabits(dateStr: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;
    // Normalize date securely
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    const habits = await prisma.habit.findMany({
        where: { userId, isActive: true },
        include: {
            logs: {
                where: { date }
            }
        },
        orderBy: { createdAt: "asc" }
    });

    const diary = await prisma.dailyDiary.findFirst({
        where: { userId, date }
    });

    return JSON.parse(JSON.stringify({
        habits,
        diary
    }));
}

export async function toggleHabitLog(habitId: string, dateStr: string, completed: boolean) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const habit = await prisma.habit.findFirst({
        where: { id: habitId, userId: session.user.id }
    });
    if (!habit) throw new Error("Unauthorized");

    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    const log = await prisma.habitLog.upsert({
        where: {
            habitId_date: {
                habitId,
                date
            }
        },
        update: { completed },
        create: {
            habitId,
            date,
            completed
        }
    });

    if (completed) {
        await logActivity("complete_habit", habitId, "habit", { title: habit.title });
    }

    revalidatePath("/daily");
    return JSON.parse(JSON.stringify(log));
}

export async function createHabit(title: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const habit = await prisma.habit.create({
        data: {
            title,
            userId: session.user.id
        }
    });

    revalidatePath("/daily");
    return JSON.parse(JSON.stringify(habit));
}

export async function updateDailyDiary(dateStr: string, content: string, mood?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    const diary = await prisma.dailyDiary.upsert({
        where: {
            userId_date: {
                userId: session.user.id,
                date
            }
        },
        update: { content, mood: mood || null },
        create: {
            userId: session.user.id,
            date,
            content,
            mood: mood || null
        }
    });

    await logActivity("update_diary", diary.id, "daily_diary", { date: dateStr, mood });

    revalidatePath("/daily");
    return JSON.parse(JSON.stringify(diary));
}

export async function deleteHabit(habitId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.habit.delete({
        where: {
            id: habitId,
            userId: session.user.id
        }
    });

    revalidatePath("/daily");
}

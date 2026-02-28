"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { format } from "date-fns";

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

    const allDiaries = await prisma.dailyDiary.findMany({
        where: { userId },
        select: { date: true }
    });
    const submittedDates = allDiaries.map(d => format(new Date(d.date), "yyyy-MM-dd"));

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            menteeships: {
                include: {
                    mentorship: {
                        include: {
                            programCycle: true,
                            goals: {
                                where: {
                                    dueDate: { not: null },
                                    status: { not: "completed" }
                                },
                                select: { dueDate: true, title: true }
                            }
                        }
                    }
                },
                where: {
                    status: "active"
                }
            }
        }
    });

    const activeMentorship = user?.menteeships?.[0]?.mentorship;

    let programStartDate = activeMentorship?.startDate || activeMentorship?.programCycle?.startDate || user?.createdAt || new Date();
    let programEndDate = activeMentorship?.endDate || activeMentorship?.programCycle?.endDate || new Date(programStartDate.getTime() + 61 * 24 * 60 * 60 * 1000);

    // Ensure we have a valid Date object if they came from JSON
    programStartDate = new Date(programStartDate);
    programEndDate = new Date(programEndDate);

    const diffTime = Math.abs(programEndDate.getTime() - programStartDate.getTime());
    let programDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Ensure we don't have unrealistic 0 or negative days
    if (programDays <= 0) programDays = 62;

    // Collect deadlines
    const deadlines: any[] = [];
    if (activeMentorship?.goals) {
        activeMentorship.goals.forEach((goal: any) => {
            if (goal.dueDate) {
                deadlines.push({
                    date: format(new Date(goal.dueDate), "yyyy-MM-dd"),
                    title: goal.title,
                    type: "goal"
                });
            }
        });
    }
    deadlines.push({
        date: format(programEndDate, "yyyy-MM-dd"),
        title: "Kết thúc chương trình",
        type: "program_end"
    });

    return JSON.parse(JSON.stringify({
        habits,
        diary,
        submittedDates,
        deadlines,
        programInfo: {
            startDate: programStartDate,
            endDate: programEndDate,
            totalDays: programDays
        }
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

export async function getProgramGridData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    // Fetch user with mentorship and program cycle
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            menteeships: {
                include: {
                    mentorship: {
                        include: {
                            programCycle: true,
                            goals: {
                                where: {
                                    dueDate: { not: null },
                                    status: { not: "completed" }
                                },
                                select: { dueDate: true, title: true }
                            }
                        }
                    }
                },
                where: { status: "active" }
            }
        }
    });

    const activeMentorship = user?.menteeships?.[0]?.mentorship;
    let programStartDate = activeMentorship?.startDate || activeMentorship?.programCycle?.startDate || user?.createdAt || new Date();
    let programEndDate = activeMentorship?.endDate || activeMentorship?.programCycle?.endDate || new Date(programStartDate.getTime() + 61 * 24 * 60 * 60 * 1000);

    programStartDate = new Date(programStartDate);
    programEndDate = new Date(programEndDate);

    // Fetch all diaries to mark submitted days
    const allDiaries = await prisma.dailyDiary.findMany({
        where: { userId },
        select: { date: true }
    });
    const submittedDates = allDiaries.map(d => format(new Date(d.date), "yyyy-MM-dd"));

    // Collect deadlines
    const deadlines: any[] = [];

    // Goal deadlines
    if (activeMentorship?.goals) {
        activeMentorship.goals.forEach(goal => {
            if (goal.dueDate) {
                deadlines.push({
                    date: format(new Date(goal.dueDate), "yyyy-MM-dd"),
                    title: goal.title,
                    type: "goal"
                });
            }
        });
    }

    // Program end date
    deadlines.push({
        date: format(programEndDate, "yyyy-MM-dd"),
        title: "Kết thúc chương trình",
        type: "program_end"
    });

    return JSON.parse(JSON.stringify({
        startDate: programStartDate,
        endDate: programEndDate,
        submittedDates,
        deadlines
    }));
}

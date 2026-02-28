"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function getTasks() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const tasks = await prisma.todoItem.findMany({
        where: {
            menteeId: session.user.id!
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return JSON.parse(JSON.stringify(tasks));
}

export async function createTask(data: {
    title: string;
    priority?: string;
    description?: string;
    dueDate?: Date;
    startDate?: Date;
    reflectionId?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");

        const task = await prisma.todoItem.create({
            data: {
                title: data.title,
                description: data.description || null,
                priority: data.priority || "medium",
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                reflectionId: data.reflectionId || null,
                menteeId: session.user.id!,
                status: "todo",
                column: "todo",
                checklist: JSON.stringify([]),
                completedPercentage: 0
            }
        });

        revalidatePath("/tasks");

        // Log activity
        await logActivity("create_task", task.id, "task", { title: task.title });

        return JSON.parse(JSON.stringify(task));
    } catch (error) {
        console.error("Error in createTask:", error);
        throw error;
    }
}

export async function updateTask(id: string, data: any) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const task = await prisma.todoItem.update({
        where: { id, menteeId: session.user.id! },
        data
    });

    revalidatePath("/tasks");
    return JSON.parse(JSON.stringify(task));
}

export async function deleteTask(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.todoItem.delete({
        where: { id, menteeId: session.user.id! }
    });

    revalidatePath("/tasks");
}

export async function updateTaskStatus(id: string, status: string, column?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const existingTask = await prisma.todoItem.findUnique({
        where: { id, menteeId: session.user.id! }
    });

    if (!existingTask) throw new Error("Task not found");

    const updateData: any = {
        status,
        column: column || status
    };

    if (status === "done" && existingTask.status !== "done") {
        updateData.completedPercentage = 100;
        if (!existingTask.actualCompletedAt) {
            updateData.actualCompletedAt = new Date();
        }
    }

    if (status === "doing" && existingTask.status !== "doing" && !existingTask.actualStartDate) {
        updateData.actualStartDate = new Date();
    }

    const task = await prisma.todoItem.update({
        where: { id, menteeId: session.user.id! },
        data: updateData
    });

    revalidatePath("/tasks");

    // Log activity if completed
    if (status === "done" && existingTask.status !== "done") {
        await logActivity("complete_task", id, "task", { title: task.title });
    }

    return JSON.parse(JSON.stringify(task));
}

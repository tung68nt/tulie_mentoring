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
    dueDate?: Date;
    reflectionId?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const task = await prisma.todoItem.create({
        data: {
            title: data.title,
            priority: data.priority || "medium",
            dueDate: data.dueDate,
            reflectionId: data.reflectionId,
            menteeId: session.user.id!,
            status: "todo",
            column: "todo"
        }
    });

    revalidatePath("/tasks");

    // Log activity
    await logActivity("create_task", task.id, "task", { title: task.title });

    return JSON.parse(JSON.stringify(task));
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

    const task = await prisma.todoItem.update({
        where: { id, menteeId: session.user.id! },
        data: {
            status,
            column: column || status
        }
    });

    revalidatePath("/tasks");

    // Log activity if completed
    if (status === "done") {
        await logActivity("complete_task", id, "task", { title: task.title });
    }

    return JSON.parse(JSON.stringify(task));
}

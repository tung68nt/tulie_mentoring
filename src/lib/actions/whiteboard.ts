"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function createWhiteboard(data: { title: string; description?: string }) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const whiteboard = await prisma.whiteboard.create({
        data: {
            title: data.title,
            description: data.description,
            creatorId: session.user.id!,
            artboards: {
                create: {
                    order: 0,
                    name: "Page 1",
                },
            },
        },
        include: {
            artboards: true,
        },
    });

    await logActivity("create_whiteboard", whiteboard.id, "whiteboard", { title: whiteboard.title });

    revalidatePath("/whiteboard");
    return JSON.parse(JSON.stringify(whiteboard));
}

export async function getWhiteboards() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const whiteboards = await prisma.whiteboard.findMany({
        where: {
            OR: [
                { creatorId: session.user.id! },
                { status: "public" }
            ]
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return JSON.parse(JSON.stringify(whiteboards));
}

export async function getWhiteboardDetail(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const whiteboard = await prisma.whiteboard.findUnique({
        where: { id },
        include: {
            artboards: {
                orderBy: { order: "asc" },
            },
            creator: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                },
            },
        },
    });

    if (!whiteboard) throw new Error("Whiteboard not found");

    // Check permission
    if (whiteboard.status === "private" && whiteboard.creatorId !== session.user.id) {
        throw new Error("Access denied");
    }

    return JSON.parse(JSON.stringify(whiteboard));
}

export async function updateWhiteboard(id: string, data: any) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const whiteboard = await prisma.whiteboard.findUnique({
        where: { id },
    });

    if (!whiteboard) throw new Error("Whiteboard not found");
    if (whiteboard.creatorId !== session.user.id) throw new Error("Access denied");

    const updated = await prisma.whiteboard.update({
        where: { id },
        data,
    });

    revalidatePath(`/whiteboard/${id}`);
    return JSON.parse(JSON.stringify(updated));
}

export async function saveArtboard(id: string, data: { elements: any; appState: any }) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const artboard = await prisma.artboard.findUnique({
        where: { id },
        include: { whiteboard: true },
    });

    if (!artboard) throw new Error("Artboard not found");
    if (artboard.whiteboard.creatorId !== session.user.id) throw new Error("Access denied");

    const updated = await prisma.artboard.update({
        where: { id },
        data: {
            elements: data.elements,
            appState: data.appState,
            updatedAt: new Date(),
        },
    });

    // Also update whiteboard updatedAt
    await prisma.whiteboard.update({
        where: { id: artboard.whiteboardId },
        data: { updatedAt: new Date() },
    });

    return JSON.parse(JSON.stringify(updated));
}

export async function deleteWhiteboard(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const whiteboard = await prisma.whiteboard.findUnique({
        where: { id },
    });

    if (!whiteboard) throw new Error("Whiteboard not found");
    if (whiteboard.creatorId !== session.user.id) throw new Error("Access denied");

    await prisma.whiteboard.delete({
        where: { id },
    });

    revalidatePath("/whiteboard");
}

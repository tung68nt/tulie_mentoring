"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function createWhiteboard(data: { title: string; description?: string }) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Auto-link to mentorship
    const role = (session.user as any).role;
    const mentorship = await prisma.mentorship.findFirst({
        where: role === "mentee" ? { mentees: { some: { menteeId: session.user.id } } } : { mentorId: session.user.id },
        select: { id: true }
    });

    const whiteboard = await prisma.whiteboard.create({
        data: {
            title: data.title,
            description: data.description,
            creatorId: session.user.id!,
            mentorshipId: mentorship?.id,
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

    const role = (session.user as any).role;
    const isAdmin = role === "admin" || role === "viewer";

    const where: any = {};
    if (!isAdmin) {
        const mentorships = await prisma.mentorship.findMany({
            where: role === "mentee" ? { mentees: { some: { menteeId: session.user.id } } } : { mentorId: session.user.id },
            select: { id: true }
        });
        const mentorshipIds = mentorships.map(m => m.id);

        where.OR = [
            { creatorId: session.user.id! },
            { mentorshipId: { in: mentorshipIds } }
        ];
    }

    const whiteboards = await prisma.whiteboard.findMany({
        where,
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

    const role = (session.user as any).role;
    const isAdmin = role === "admin" || role === "viewer";

    if (!isAdmin) {
        // If it belongs to a mentorship, check if user is part of it
        if (whiteboard.mentorshipId) {
            const mentorship = await prisma.mentorship.findFirst({
                where: {
                    id: whiteboard.mentorshipId,
                    OR: [
                        { mentorId: session.user.id! },
                        { mentees: { some: { menteeId: session.user.id! } } }
                    ]
                }
            });
            if (!mentorship && whiteboard.creatorId !== session.user.id) {
                throw new Error("Truy cập bị từ chối: Whiteboard thuộc về một Mentorship khác");
            }
        } else if (whiteboard.status === "private" && whiteboard.creatorId !== session.user.id) {
            throw new Error("Access denied");
        }
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

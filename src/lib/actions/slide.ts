"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function createSlide(data: { title: string; description?: string }) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const slide = await prisma.slide.create({
        data: {
            title: data.title,
            description: data.description,
            creatorId: session.user.id!,
            content: "# Welcome to your first slide\n---\n## Second Slide\n- Bullet point\n- Another one\n---\n## Third Slide\nEnjoy presenting!",
            theme: "black",
        }
    });

    await logActivity("create_slide", slide.id, "slide", { title: slide.title });

    revalidatePath("/slides");
    return JSON.parse(JSON.stringify(slide));
}

export async function getSlides() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const slides = await prisma.slide.findMany({
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

    return JSON.parse(JSON.stringify(slides));
}

export async function getSlideDetail(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const slide = await prisma.slide.findUnique({
        where: { id },
        include: {
            creator: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                },
            },
        },
    });

    if (!slide) throw new Error("Slide not found");

    // Check permission
    if (slide.status === "private" && slide.creatorId !== session.user.id) {
        throw new Error("Access denied");
    }

    return JSON.parse(JSON.stringify(slide));
}

export async function updateSlide(id: string, data: any) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const slide = await prisma.slide.findUnique({
        where: { id },
    });

    if (!slide) throw new Error("Slide not found");
    if (slide.creatorId !== session.user.id) throw new Error("Access denied");

    const updated = await prisma.slide.update({
        where: { id },
        data,
    });

    revalidatePath(`/slides/${id}`);
    revalidatePath("/slides");
    return JSON.parse(JSON.stringify(updated));
}

export async function deleteSlide(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const slide = await prisma.slide.findUnique({
        where: { id },
    });

    if (!slide) throw new Error("Slide not found");
    if (slide.creatorId !== session.user.id) throw new Error("Access denied");

    await prisma.slide.delete({
        where: { id },
    });

    revalidatePath("/slides");
}

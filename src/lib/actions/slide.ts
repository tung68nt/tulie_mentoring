"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function createSlide(data: { title: string; description?: string }) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Auto-link to mentorship
    const role = (session.user as any).role;
    const mentorship = await prisma.mentorship.findFirst({
        where: role === "mentee" ? { mentees: { some: { menteeId: session.user.id } } } : { mentorId: session.user.id },
        select: { id: true }
    });

    const slide = await prisma.slide.create({
        data: {
            title: data.title,
            description: data.description,
            creatorId: session.user.id!,
            mentorshipId: mentorship?.id,
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

    const slides = await prisma.slide.findMany({
        where,
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

    const role = (session.user as any).role;
    const isAdmin = role === "admin" || role === "viewer";

    if (!isAdmin) {
        // If it belongs to a mentorship, check if user is part of it
        if (slide.mentorshipId) {
            const mentorship = await prisma.mentorship.findFirst({
                where: {
                    id: slide.mentorshipId,
                    OR: [
                        { mentorId: session.user.id! },
                        { mentees: { some: { menteeId: session.user.id! } } }
                    ]
                }
            });
            if (!mentorship && slide.creatorId !== session.user.id) {
                throw new Error("Truy cập bị từ chối: Tài liệu thuyết trình thuộc về một Mentorship khác");
            }
        } else if (slide.status === "private" && slide.creatorId !== session.user.id) {
            throw new Error("Access denied");
        }
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

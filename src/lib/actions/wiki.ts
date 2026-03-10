"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')     // Remove all non-word chars
        .replace(/--+/g, '-');        // Replace multiple - with single -
}

export async function createWikiPage(data: {
    title: string;
    content: string;
    category?: string;
    visibility?: "public" | "mentor_only" | "mentee_only";
    coverImage?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const slug = `${slugify(data.title)}-${Math.random().toString(36).substring(2, 7)}`;

    // Auto-link to mentorship if user is part of one
    let mentorshipId = null;
    if (session.user) {
        const role = (session.user as any).role;
        const mentorship = await prisma.mentorship.findFirst({
            where: role === "mentee" ? { mentees: { some: { menteeId: session.user.id } } } : { mentorId: session.user.id },
            select: { id: true }
        });
        if (mentorship) mentorshipId = mentorship.id;
    }

    const page = await prisma.wikiPage.create({
        data: {
            title: data.title,
            slug,
            content: data.content,
            category: data.category,
            visibility: data.visibility || (mentorshipId ? "private" : "public"),
            coverImage: data.coverImage,
            authorId: session.user.id!,
            mentorshipId,
        }
    });

    // Log activity
    await logActivity("create_wiki_page", page.id, "wiki", { title: page.title });

    revalidatePath("/wiki");
    return JSON.parse(JSON.stringify(page));
}

export async function getWikiPages(category?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;

    // Filter by visibility based on role
    const where: any = {};
    if (category) where.category = category;

    const mentorships = await prisma.mentorship.findMany({
        where: role === "mentee" ? { mentees: { some: { menteeId: session.user.id } } } : { mentorId: session.user.id },
        select: { id: true }
    });
    const mentorshipIds = mentorships.map(m => m.id);

    if (role === "mentee") {
        where.OR = [
            { authorId: session.user.id },
            { visibility: "public" },
            { mentorshipId: { in: mentorshipIds } }
        ];
    } else if (role === "mentor") {
        where.OR = [
            { authorId: session.user.id },
            { visibility: "public" },
            { mentorshipId: { in: mentorshipIds } }
        ];
    }
    // Admins see all

    const pages = await prisma.wikiPage.findMany({
        where,
        include: {
            author: {
                select: {
                    firstName: true,
                    lastName: true,
                }
            }
        },
        orderBy: {
            updatedAt: "desc"
        }
    });

    return JSON.parse(JSON.stringify(pages));
}

export async function getWikiPageDetail(slug: string, isPublic: boolean = false) {
    const session = await auth();
    // Allow public access if isPublic is true, otherwise require auth
    if (!isPublic && !session?.user) throw new Error("Unauthorized");

    const page = await prisma.wikiPage.findUnique({
        where: { slug },
        include: {
            author: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                }
            }
        }
    });

    if (!page) throw new Error("Page not found");

    if (!isPublic) {
        const role = (session?.user as any)?.role;
        const isAdmin = role === "admin" || role === "viewer";

        if (!isAdmin) {
            // If it belongs to a mentorship, check if user is part of it
            if (page.mentorshipId) {
                const mentorship = await prisma.mentorship.findFirst({
                    where: {
                        id: page.mentorshipId,
                        OR: [
                            { mentorId: session?.user?.id },
                            { mentees: { some: { menteeId: session?.user?.id } } }
                        ]
                    }
                });
                if (!mentorship && page.authorId !== session?.user?.id) {
                    throw new Error("Truy cập bị từ chối: Tài liệu thuộc về một Mentorship khác");
                }
            }

            if (page.visibility === "mentor_only" && role !== "mentor") {
                throw new Error("Truy cập bị từ chối: Tài liệu dành riêng cho Mentor");
            }
            if (page.visibility === "mentee_only" && role !== "mentee") {
                throw new Error("Truy cập bị từ chối: Tài liệu dành riêng cho Mentee");
            }
        }
    }

    return JSON.parse(JSON.stringify(page));
}

export async function updateWikiPage(id: string, data: any) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const page = await prisma.wikiPage.findUnique({
        where: { id },
        select: { authorId: true }
    });

    if (!page) throw new Error("Page not found");

    const role = (session.user as any).role;
    if (role === "mentee" && page.authorId !== session.user.id) {
        throw new Error("Permission denied");
    }

    // Whitelist only allowed fields to prevent mass assignment
    const { title, content, category, visibility, coverImage } = data;

    const updatedPage = await prisma.wikiPage.update({
        where: { id },
        data: {
            title,
            content,
            category,
            visibility,
            coverImage,
            updatedAt: new Date()
        }
    });

    // Log activity
    await logActivity("update_wiki_page", id, "wiki", { title: updatedPage.title });

    revalidatePath("/wiki");
    revalidatePath(`/wiki/${updatedPage.slug}`);
    return JSON.parse(JSON.stringify(updatedPage));
}

export async function deleteWikiPage(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const page = await prisma.wikiPage.findUnique({
        where: { id },
        select: { authorId: true }
    });

    if (!page) throw new Error("Page not found");

    const role = (session.user as any).role;
    // Mentees can only delete their own pages, Admin/Mentor can delete any
    if (role === "mentee" && page.authorId !== session.user.id) {
        throw new Error("Permission denied");
    }

    await prisma.wikiPage.delete({
        where: { id }
    });

    revalidatePath("/wiki");
}

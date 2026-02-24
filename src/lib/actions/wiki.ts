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
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const slug = `${slugify(data.title)}-${Math.random().toString(36).substring(2, 7)}`;

    const page = await prisma.wikiPage.create({
        data: {
            title: data.title,
            slug,
            content: data.content,
            category: data.category,
            visibility: data.visibility || "public",
            authorId: session.user.id!,
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

    if (role === "mentee") {
        where.visibility = { in: ["public", "mentee_only"] };
    } else if (role === "mentor") {
        where.visibility = { in: ["public", "mentor_only"] };
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

export async function getWikiPageDetail(slug: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

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

    const updatedPage = await prisma.wikiPage.update({
        where: { id },
        data: {
            ...data,
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

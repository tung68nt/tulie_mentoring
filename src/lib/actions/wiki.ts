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
        // Handle Vietnamese đ/Đ before normalization
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        // Remove diacritics: normalize to NFD then strip combining marks
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

export async function createWikiPage(data: {
    title: string;
    content: string;
    category?: string;
    visibility?: "private" | "mentorship" | "public" | "selected";
    coverImage?: string;
    shareWithUserIds?: string[];
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const slug = `${slugify(data.title)}-${Math.random().toString(36).substring(2, 7)}`;

    // Auto-link to mentorship if user is part of one
    let mentorshipId = null;
    const role = (session.user as any).role;
    if (role === "mentor" || role === "mentee") {
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
            visibility: data.visibility || "private",
            coverImage: data.coverImage,
            authorId: session.user.id!,
            mentorshipId,
        }
    });

    // Create shares if visibility is "selected"
    if (data.visibility === "selected" && data.shareWithUserIds?.length) {
        await prisma.wikiPageShare.createMany({
            data: data.shareWithUserIds.map(userId => ({
                wikiPageId: page.id,
                userId,
            })),
            skipDuplicates: true,
        });
    }

    await logActivity("create_wiki_page", page.id, "wiki", { title: page.title });

    revalidatePath("/wiki");
    return JSON.parse(JSON.stringify(page));
}

/**
 * Get wiki pages grouped into 3 sections:
 * - myPages: pages authored by the current user
 * - sharedPages: pages shared with this user (via mentorship or selected sharing)
 * - communityPages: public pages by others
 */
export async function getWikiPages(category?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    const userId = session.user.id!;
    const isAdmin = role === "admin" || role === "manager" || role === "program_manager";

    const categoryFilter = category ? { category } : {};

    // 1. My pages (authored by me)
    const myPages = await prisma.wikiPage.findMany({
        where: { authorId: userId, ...categoryFilter },
        include: {
            author: { select: { firstName: true, lastName: true, avatar: true } },
            shares: { select: { userId: true } },
        },
        orderBy: { updatedAt: "desc" },
    });

    // 2. Shared with me (mentorship + selected shares)
    let sharedPages: any[] = [];
    if (!isAdmin) {
        const mentorships = await prisma.mentorship.findMany({
            where: role === "mentee"
                ? { mentees: { some: { menteeId: userId } } }
                : role === "mentor" ? { mentorId: userId } : {},
            select: { id: true },
        });
        const mentorshipIds = mentorships.map(m => m.id);

        sharedPages = await prisma.wikiPage.findMany({
            where: {
                authorId: { not: userId },
                ...categoryFilter,
                OR: [
                    // Mentorship visibility: pages from my mentorship
                    ...(mentorshipIds.length > 0 ? [{
                        visibility: "mentorship",
                        mentorshipId: { in: mentorshipIds },
                    }] : []),
                    // Selected visibility: shared specifically with me
                    {
                        visibility: "selected",
                        shares: { some: { userId } },
                    },
                ],
            },
            include: {
                author: { select: { firstName: true, lastName: true, avatar: true } },
            },
            orderBy: { updatedAt: "desc" },
        });
    } else {
        // Admin/manager sees all non-public, non-own pages as "shared"
        sharedPages = await prisma.wikiPage.findMany({
            where: {
                authorId: { not: userId },
                visibility: { not: "public" },
                ...categoryFilter,
            },
            include: {
                author: { select: { firstName: true, lastName: true, avatar: true } },
            },
            orderBy: { updatedAt: "desc" },
        });
    }

    // 3. Community pages (public)
    const communityPages = await prisma.wikiPage.findMany({
        where: {
            visibility: "public",
            authorId: { not: userId },
            ...categoryFilter,
        },
        include: {
            author: { select: { firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { updatedAt: "desc" },
    });

    return {
        myPages: JSON.parse(JSON.stringify(myPages)),
        sharedPages: JSON.parse(JSON.stringify(sharedPages)),
        communityPages: JSON.parse(JSON.stringify(communityPages)),
    };
}

export async function getWikiPageDetail(slug: string, isPublic: boolean = false) {
    const session = await auth();
    if (!isPublic && !session?.user) throw new Error("Unauthorized");

    const page = await prisma.wikiPage.findUnique({
        where: { slug },
        include: {
            author: {
                select: { firstName: true, lastName: true, avatar: true }
            },
            shares: {
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } }
                }
            }
        }
    });

    if (!page) throw new Error("Page not found");

    if (!isPublic) {
        const role = (session?.user as any)?.role;
        const isAdmin = role === "admin" || role === "manager";
        const userId = session?.user?.id;

        if (!isAdmin && page.authorId !== userId) {
            if (page.visibility === "private") {
                throw new Error("Truy cập bị từ chối: Tài liệu riêng tư");
            }

            if (page.visibility === "mentorship" && page.mentorshipId) {
                const mentorship = await prisma.mentorship.findFirst({
                    where: {
                        id: page.mentorshipId,
                        OR: [
                            { mentorId: userId },
                            { mentees: { some: { menteeId: userId } } }
                        ]
                    }
                });
                if (!mentorship) {
                    throw new Error("Truy cập bị từ chối: Tài liệu thuộc Mentorship khác");
                }
            }

            if (page.visibility === "selected") {
                const hasAccess = page.shares.some(s => s.userId === userId);
                if (!hasAccess) {
                    throw new Error("Truy cập bị từ chối: Bạn không nằm trong danh sách chia sẻ");
                }
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
    const isAdmin = role === "admin" || role === "manager" || role === "program_manager";
    // SECURITY: Only author or admin can update
    if (!isAdmin && page.authorId !== session.user.id) {
        throw new Error("Permission denied: Only the author or admin can update this page");
    }

    const { title, content, category, visibility, coverImage, shareWithUserIds } = data;

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

    // Update shares if visibility is "selected"
    if (visibility === "selected" && shareWithUserIds) {
        // Remove old shares
        await prisma.wikiPageShare.deleteMany({ where: { wikiPageId: id } });
        // Add new shares
        if (shareWithUserIds.length > 0) {
            await prisma.wikiPageShare.createMany({
                data: shareWithUserIds.map((userId: string) => ({
                    wikiPageId: id,
                    userId,
                })),
                skipDuplicates: true,
            });
        }
    } else if (visibility !== "selected") {
        // Clear shares if not selected mode
        await prisma.wikiPageShare.deleteMany({ where: { wikiPageId: id } });
    }

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
    const isAdmin = role === "admin" || role === "manager" || role === "program_manager";
    // SECURITY: Only author or admin can delete
    if (!isAdmin && page.authorId !== session.user.id) {
        throw new Error("Permission denied: Only the author or admin can delete this page");
    }

    await prisma.wikiPage.delete({
        where: { id }
    });

    revalidatePath("/wiki");
}

export async function searchUsersForSharing(query: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const users = await prisma.user.findMany({
        where: {
            id: { not: session.user.id! },
            isActive: true,
            OR: [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
            ],
        },
        select: { id: true, firstName: true, lastName: true, email: true },
        take: 20,
        orderBy: { firstName: "asc" },
    });

    return JSON.parse(JSON.stringify(users));
}

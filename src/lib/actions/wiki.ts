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
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

// ─── WikiCategory CRUD ───────────────────────────────────────────

export async function createWikiCategory(data: {
    name: string;
    description?: string;
    icon?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    if (!["admin", "manager", "program_manager", "mentor"].includes(role)) {
        throw new Error("Permission denied");
    }

    const maxOrder = await prisma.wikiCategory.aggregate({ _max: { order: true } });
    const slug = `${slugify(data.name)}-${Math.random().toString(36).substring(2, 5)}`;

    const category = await prisma.wikiCategory.create({
        data: {
            name: data.name,
            slug,
            description: data.description,
            icon: data.icon,
            order: (maxOrder._max.order ?? -1) + 1,
        },
    });

    revalidatePath("/wiki");
    return JSON.parse(JSON.stringify(category));
}

export async function updateWikiCategory(id: string, data: {
    name?: string;
    description?: string;
    icon?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    if (!["admin", "manager", "program_manager", "mentor"].includes(role)) {
        throw new Error("Permission denied");
    }

    const category = await prisma.wikiCategory.update({
        where: { id },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.icon !== undefined && { icon: data.icon }),
        },
    });

    revalidatePath("/wiki");
    return JSON.parse(JSON.stringify(category));
}

export async function deleteWikiCategory(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    if (!["admin", "manager", "program_manager"].includes(role)) {
        throw new Error("Permission denied: Only admin/manager can delete categories");
    }

    await prisma.wikiCategory.delete({ where: { id } });
    revalidatePath("/wiki");
}

export async function reorderCategories(orderedIds: string[]) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await Promise.all(
        orderedIds.map((id, index) =>
            prisma.wikiCategory.update({ where: { id }, data: { order: index } })
        )
    );

    revalidatePath("/wiki");
}

// ─── Wiki CRUD ───────────────────────────────────────────────────

export async function createWiki(data: {
    title: string;
    categoryId: string;
    description?: string;
    coverImage?: string;
    visibility?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    if (!["admin", "manager", "program_manager", "mentor"].includes(role)) {
        throw new Error("Permission denied");
    }

    const maxOrder = await prisma.wiki.aggregate({
        _max: { order: true },
        where: { categoryId: data.categoryId },
    });

    const slug = `${slugify(data.title)}-${Math.random().toString(36).substring(2, 5)}`;

    const wiki = await prisma.wiki.create({
        data: {
            title: data.title,
            slug,
            description: data.description,
            coverImage: data.coverImage,
            categoryId: data.categoryId,
            authorId: session.user.id!,
            visibility: data.visibility || "private",
            order: (maxOrder._max.order ?? -1) + 1,
        },
    });

    await logActivity("create_wiki", wiki.id, "wiki", { title: wiki.title });
    revalidatePath("/wiki");
    return JSON.parse(JSON.stringify(wiki));
}

export async function updateWiki(id: string, data: {
    title?: string;
    description?: string;
    coverImage?: string;
    visibility?: string;
    categoryId?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const wiki = await prisma.wiki.findUnique({ where: { id }, select: { authorId: true } });
    if (!wiki) throw new Error("Wiki not found");

    const role = (session.user as any).role;
    const isAdmin = ["admin", "manager", "program_manager"].includes(role);
    if (!isAdmin && wiki.authorId !== session.user.id) {
        throw new Error("Permission denied");
    }

    const updated = await prisma.wiki.update({
        where: { id },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
            ...(data.visibility && { visibility: data.visibility }),
            ...(data.categoryId && { categoryId: data.categoryId }),
        },
    });

    revalidatePath("/wiki");
    return JSON.parse(JSON.stringify(updated));
}

export async function deleteWiki(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const wiki = await prisma.wiki.findUnique({ where: { id }, select: { authorId: true } });
    if (!wiki) throw new Error("Wiki not found");

    const role = (session.user as any).role;
    const isAdmin = ["admin", "manager", "program_manager"].includes(role);
    if (!isAdmin && wiki.authorId !== session.user.id) {
        throw new Error("Permission denied");
    }

    await prisma.wiki.delete({ where: { id } });
    revalidatePath("/wiki");
}

export async function reorderWikis(categoryId: string, orderedIds: string[]) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await Promise.all(
        orderedIds.map((id, index) =>
            prisma.wiki.update({ where: { id }, data: { order: index } })
        )
    );

    revalidatePath("/wiki");
}

// ─── Wiki Structure (for Sidebar) ───────────────────────────────

export async function getWikiStructure() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    let categories = await prisma.wikiCategory.findMany({
        orderBy: { order: "asc" },
        include: {
            wikis: {
                orderBy: { order: "asc" },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    order: true,
                    visibility: true,
                    pages: {
                        orderBy: { order: "asc" },
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            order: true,
                            wikiId: true,
                        },
                    },
                },
            },
        },
    });

    // Auto-create default category if none exist
    if (categories.length === 0) {
        const defaultCat = await prisma.wikiCategory.create({
            data: {
                name: "Chung",
                slug: "chung",
                order: 0,
            },
            include: {
                wikis: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        order: true,
                        visibility: true,
                        pages: { select: { id: true, title: true, slug: true, order: true, wikiId: true } }
                    }
                }
            }
        });
        categories = [defaultCat];
        
        // Recover orphaned wikis if any somehow exist without category (e.g. from forced migrations)
        // Prisma will crash if we try to reference a null categoryId, but if there's any hacky data, we can try to link them.
    }

    return JSON.parse(JSON.stringify(categories));
}

// ─── WikiPage CRUD (updated) ────────────────────────────────────

export async function createWikiPage(data: {
    title: string;
    content: string;
    wikiId?: string;
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

    // Get max order in wiki
    let maxOrder = 0;
    if (data.wikiId) {
        const agg = await prisma.wikiPage.aggregate({
            _max: { order: true },
            where: { wikiId: data.wikiId },
        });
        maxOrder = (agg._max.order ?? -1) + 1;
    }

    const page = await prisma.wikiPage.create({
        data: {
            title: data.title,
            slug,
            content: data.content,
            wikiId: data.wikiId || null,
            visibility: data.visibility || "private",
            coverImage: data.coverImage,
            authorId: session.user.id!,
            mentorshipId,
            order: maxOrder,
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
 * Get wiki pages — can filter by wikiId
 */
export async function getWikiPages(wikiId?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    const userId = session.user.id!;
    const isAdmin = role === "admin" || role === "manager" || role === "program_manager";

    const wikiFilter = wikiId ? { wikiId } : {};

    // 1. My pages
    const myPages = await prisma.wikiPage.findMany({
        where: { authorId: userId, ...wikiFilter },
        include: {
            author: { select: { firstName: true, lastName: true, avatar: true } },
            shares: { select: { userId: true } },
            wiki: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { order: "asc" },
    });

    // 2. Shared with me
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
                ...wikiFilter,
                OR: [
                    ...(mentorshipIds.length > 0 ? [{
                        visibility: "mentorship",
                        mentorshipId: { in: mentorshipIds },
                    }] : []),
                    {
                        visibility: "selected",
                        shares: { some: { userId } },
                    },
                ],
            },
            include: {
                author: { select: { firstName: true, lastName: true, avatar: true } },
                wiki: { select: { id: true, title: true, slug: true } },
            },
            orderBy: { order: "asc" },
        });
    } else {
        sharedPages = await prisma.wikiPage.findMany({
            where: {
                authorId: { not: userId },
                visibility: { not: "public" },
                ...wikiFilter,
            },
            include: {
                author: { select: { firstName: true, lastName: true, avatar: true } },
                wiki: { select: { id: true, title: true, slug: true } },
            },
            orderBy: { order: "asc" },
        });
    }

    // 3. Community pages
    const communityPages = await prisma.wikiPage.findMany({
        where: {
            visibility: "public",
            authorId: { not: userId },
            ...wikiFilter,
        },
        include: {
            author: { select: { firstName: true, lastName: true, avatar: true } },
            wiki: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { order: "asc" },
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
            wiki: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    category: {
                        select: { id: true, name: true, slug: true }
                    },
                }
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
    if (!isAdmin && page.authorId !== session.user.id) {
        throw new Error("Permission denied: Only the author or admin can update this page");
    }

    const { title, content, wikiId, visibility, coverImage, shareWithUserIds } = data;

    const updatedPage = await prisma.wikiPage.update({
        where: { id },
        data: {
            title,
            content,
            wikiId: wikiId || null,
            visibility,
            coverImage,
            updatedAt: new Date()
        }
    });

    // Update shares if visibility is "selected"
    if (visibility === "selected" && shareWithUserIds) {
        await prisma.wikiPageShare.deleteMany({ where: { wikiPageId: id } });
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
        await prisma.wikiPageShare.deleteMany({ where: { wikiPageId: id } });
    }

    await logActivity("update_wiki_page", id, "wiki", { title: updatedPage.title });

    revalidatePath("/wiki");
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
    if (!isAdmin && page.authorId !== session.user.id) {
        throw new Error("Permission denied: Only the author or admin can delete this page");
    }

    await prisma.wikiPage.delete({ where: { id } });
    revalidatePath("/wiki");
}

export async function reorderPages(wikiId: string, orderedIds: string[]) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await Promise.all(
        orderedIds.map((id, index) =>
            prisma.wikiPage.update({ where: { id }, data: { order: index } })
        )
    );

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

// ─── Wiki Detail ─────────────────────────────────────────────────

export async function getWikiDetail(slug: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const wiki = await prisma.wiki.findUnique({
        where: { slug },
        include: {
            author: { select: { firstName: true, lastName: true, avatar: true } },
            category: { select: { id: true, name: true, slug: true } },
            pages: {
                orderBy: { order: "asc" },
                include: {
                    author: { select: { firstName: true, lastName: true, avatar: true } },
                },
            },
        },
    });

    if (!wiki) throw new Error("Wiki not found");

    return JSON.parse(JSON.stringify(wiki));
}

// ─── Get All Wiki Categories (for forms) ─────────────────────────

export async function getWikiCategories() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const categories = await prisma.wikiCategory.findMany({
        orderBy: { order: "asc" },
        include: {
            wikis: {
                orderBy: { order: "asc" },
                select: { id: true, title: true, slug: true },
            },
        },
    });

    return JSON.parse(JSON.stringify(categories));
}

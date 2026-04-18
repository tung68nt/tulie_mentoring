"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function createPost(data: {
    content: string;
    type?: string;
    visibility?: "public" | "program" | "pair";
    programCycleId?: string;
    attachments?: { type: string; url: string; name?: string; size?: number }[];
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;

    const post = await prisma.post.create({
        data: {
            content: data.content,
            type: data.type || "general",
            visibility: data.visibility || "program",
            programCycleId: data.programCycleId,
            authorId: userId,
            attachments: data.attachments ? {
                create: data.attachments
            } : undefined
        }
    });

    await logActivity("create_post", post.id, "post");

    revalidatePath("/social");
    return JSON.parse(JSON.stringify(post));
}

export async function getPosts(options?: {
    programCycleId?: string;
    limit?: number;
    cursor?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const { programCycleId, limit = 10, cursor } = options || {};

    const posts = await prisma.post.findMany({
        where: {
            programCycleId: programCycleId,
            // Logic for visibility:
            // "public": everyone
            // "program": same program cycle
            // "pair": only mentor/mentee pair (needs more complex logic if implemented)
        },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
            author: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    role: true,
                }
            },
            attachments: true,
            _count: {
                select: {
                    comments: true,
                    reactions: true,
                }
            },
            reactions: {
                select: {
                    type: true,
                    userId: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return JSON.parse(JSON.stringify(posts));
}

export async function addComment(data: {
    postId: string;
    content: string;
    parentId?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;

    const comment = await prisma.comment.create({
        data: {
            postId: data.postId,
            authorId: userId,
            content: data.content,
            parentId: data.parentId,
        }
    });

    await logActivity("comment_post", data.postId, "post");

    revalidatePath("/social");
    return JSON.parse(JSON.stringify(comment));
}

export async function toggleReaction(data: {
    postId: string;
    type: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;

    const existing = await prisma.postReaction.findUnique({
        where: {
            postId_userId_type: {
                postId: data.postId,
                userId: userId,
                type: data.type
            }
        }
    });

    if (existing) {
        await prisma.postReaction.delete({
            where: { id: existing.id }
        });
    } else {
        await prisma.postReaction.create({
            data: {
                postId: data.postId,
                userId: userId,
                type: data.type
            }
        });
    }

    revalidatePath("/social");
}

export async function getComments(postId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const comments = await prisma.comment.findMany({
        where: {
            postId: postId,
            parentId: null,
        },
        include: {
            author: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    role: true,
                }
            },
            replies: {
                include: {
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            role: true,
                        }
                    },
                    replies: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                    role: true,
                                }
                            }
                        },
                        orderBy: { createdAt: "asc" }
                    }
                },
                orderBy: { createdAt: "asc" }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return JSON.parse(JSON.stringify(comments));
}

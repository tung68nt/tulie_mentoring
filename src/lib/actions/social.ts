"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { canSeePost, isInProgramCycle } from "@/lib/access";

const safeUrl = (u: string) => /^https?:\/\//i.test(u);

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
    const role = (session.user as any).role as string;

    if (typeof data.content !== "string" || !data.content.trim() || data.content.length > 5000) throw new Error("Nội dung không hợp lệ");
    if (data.attachments?.some((a) => !safeUrl(a.url))) throw new Error("Liên kết đính kèm không hợp lệ");
    if (data.visibility === "pair") throw new Error("Bài đăng riêng cặp chưa được hỗ trợ");
    if (data.visibility !== "public" && data.programCycleId && !(await isInProgramCycle(userId, role, data.programCycleId))) {
        throw new Error("Bạn không thuộc chương trình này");
    }
    if (data.visibility === "public" && !["admin", "program_manager", "facilitator"].includes(role)) {
        throw new Error("Bạn không có quyền đăng bài công khai");
    }

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

    const { limit: rawLimit = 10, cursor } = options || {};
    const limit = Math.min(Math.max(1, Number(rawLimit) || 10), 50);
    const role = (session.user as any).role as string;
    const programCycleId =
        options?.programCycleId && (await isInProgramCycle(session.user.id!, role, options.programCycleId))
            ? options.programCycleId
            : undefined;

    const posts = await prisma.post.findMany({
        where: {
            ...(programCycleId ? { programCycleId } : {}),
            OR: [
                { visibility: "public" },
                ...(programCycleId ? [{ visibility: "program", programCycleId }] : []),
            ]
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
    if (!(await canSeePost(userId, (session.user as any).role, data.postId))) throw new Error("Không tìm thấy bài đăng");
    if (typeof data.content !== "string" || !data.content.trim() || data.content.length > 2000) throw new Error("Nội dung không hợp lệ");

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
    if (!(await canSeePost(userId, (session.user as any).role, data.postId))) throw new Error("Không tìm thấy bài đăng");
    if (typeof data.type !== "string" || data.type.length > 20) throw new Error("Loại phản ứng không hợp lệ");

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
    if (!(await canSeePost(session.user.id!, (session.user as any).role, postId))) return [];

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

"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { attachFiles } from "@/lib/files";
import { myMentorshipIds } from "@/lib/access";
import { removeObjects } from "@/lib/storage";
import { httpUrlSchema } from "@/lib/validators";

const createSchema = z
    .object({
        title: z.string().trim().min(1).max(200),
        description: z.string().trim().max(3000).optional(),
        type: z.enum(["file", "link", "document"]),
        linkUrl: httpUrlSchema.optional().or(z.literal("")),
        category: z.string().trim().max(60).default("Khác"),
        visibility: z.enum(["public", "private", "group"]),
        mentorshipId: z.string().max(64).optional(),
        fileIds: z.array(z.string().max(64)).max(1).default([]),
    })
    .refine((d) => (d.type === "link" ? !!d.linkUrl : d.type === "file" ? d.fileIds.length === 1 : true), {
        message: "Hãy cung cấp liên kết hoặc tệp đính kèm",
    });

export async function createResource(input: unknown) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;
    const role = (session.user as any).role as string;
    if (role === "manager") throw new Error("Unauthorized");

    const parsed = createSchema.safeParse(input);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
    const d = parsed.data;

    // Công khai toàn hệ thống chỉ dành cho admin / PM / facilitator / mentor
    if (d.visibility === "public" && role === "mentee") throw new Error("Mentee chỉ chia sẻ trong nhóm hoặc riêng tư");

    let mentorshipId: string | null = null;
    if (d.visibility === "group") {
        const mine = await myMentorshipIds(userId, role);
        mentorshipId = d.mentorshipId && mine.includes(d.mentorshipId) ? d.mentorshipId : mine[0] ?? null;
        if (!mentorshipId) throw new Error("Bạn chưa thuộc nhóm mentoring nào");
    }

    const resource = await prisma.resource.create({
        data: {
            title: d.title,
            description: d.description,
            type: d.type,
            linkUrl: d.type === "link" ? d.linkUrl : null,
            category: d.category,
            visibility: d.visibility,
            mentorshipId,
            uploadedById: userId,
        },
    });
    try {
        await attachFiles({ ownerId: userId, purpose: "resource", fileIds: d.fileIds, target: { resourceId: resource.id } });
    } catch (e) {
        await prisma.resource.delete({ where: { id: resource.id } });
        throw e;
    }

    revalidatePath("/resources");
    return JSON.parse(JSON.stringify(resource));
}

export async function getResources(category?: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const role = (session.user as any).role as string;
    const userId = session.user.id;

    const where: any = {};
    if (category) where.category = category;

    if (role !== "admin") {
        const mine = await myMentorshipIds(userId, role);
        const seesAllGroups = role === "program_manager" || role === "manager";
        where.OR = [
            { visibility: "public" },
            { uploadedById: userId },
            seesAllGroups ? { visibility: "group" } : { visibility: "group", mentorshipId: { in: mine } },
        ];
    }

    const resources = await prisma.resource.findMany({
        where,
        include: {
            uploadedBy: { select: { firstName: true, lastName: true } },
            files: { where: { status: "ready" }, select: { id: true, fileName: true, size: true } },
        },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        take: 500,
    });
    return JSON.parse(JSON.stringify(resources));
}

/** Ghim tài liệu lên đầu (mentor của nhóm, facilitator, admin/PM, hoặc người đăng). */
export async function togglePinResource(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const role = (session.user as any).role as string;
    const r = await prisma.resource.findUnique({ where: { id }, select: { pinned: true, uploadedById: true, mentorshipId: true } });
    if (!r) throw new Error("Không tìm thấy tài liệu");
    const isOwner = r.uploadedById === session.user.id;
    const staff = role === "admin" || role === "program_manager" || role === "mentor" || role === "facilitator";
    const inGroup = r.mentorshipId ? (await myMentorshipIds(session.user.id, role)).includes(r.mentorshipId) : role === "admin" || role === "program_manager";
    if (!isOwner && !(staff && inGroup)) throw new Error("Unauthorized");
    await prisma.resource.update({ where: { id }, data: { pinned: !r.pinned } });
    revalidatePath("/resources");
}

export async function deleteResource(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new Error("Resource not found");

    const role = (session.user as any).role;
    if (resource.uploadedById !== session.user.id && role !== "admin" && role !== "program_manager") {
        throw new Error("Unauthorized to delete this resource");
    }

    const files = await prisma.fileAsset.findMany({ where: { resourceId: id }, select: { id: true, path: true } });
    await prisma.resource.delete({ where: { id } });
    if (files.length) {
        await removeObjects(files.map((f) => f.path)).catch(() => {});
        await prisma.fileAsset.deleteMany({ where: { id: { in: files.map((f) => f.id) } } });
    }
    revalidatePath("/resources");
}

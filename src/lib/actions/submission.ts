"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { attachFiles } from "@/lib/files";
import { canReviewMentee, visibleMenteeIds } from "@/lib/access";
import { logActivity } from "./activity";

const httpUrl = z
    .string()
    .trim()
    .max(500)
    .url()
    .refine((u) => /^https?:\/\//i.test(u), "Chỉ chấp nhận liên kết http(s)");

const createSchema = z
    .object({
        kind: z.enum(["assignment", "practice", "other"]),
        title: z.string().trim().min(1, "Nhập tiêu đề").max(200),
        note: z.string().trim().max(5000).optional(),
        linkUrl: httpUrl.optional().or(z.literal("")),
        fileIds: z.array(z.string().max(64)).max(5).default([]),
    })
    .refine((d) => d.fileIds.length > 0 || !!d.linkUrl || !!d.note, { message: "Hãy đính kèm tệp, liên kết hoặc ghi chú" });

const submissionSelect = {
    id: true, kind: true, title: true, note: true, linkUrl: true, status: true, feedback: true,
    reviewedAt: true, createdAt: true, menteeId: true,
    mentee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    files: { where: { status: "ready" }, select: { id: true, fileName: true, size: true } },
} as const;

export async function createSubmission(input: unknown) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Bạn cần đăng nhập." };
    if ((session.user as any).role !== "mentee") return { error: "Chỉ mentee mới nộp bài." };
    const userId = session.user.id;

    const parsed = createSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
    const d = parsed.data;

    // Mentorship đang hoạt động của mentee; bài nộp luôn gắn với cặp/nhóm này.
    const link = await prisma.mentorshipMentee.findFirst({
        where: { menteeId: userId, mentorship: { status: "active" } },
        orderBy: { joinedAt: "desc" },
        select: { mentorshipId: true },
    });
    if (!link) return { error: "Bạn chưa thuộc cặp/nhóm mentoring nào đang hoạt động." };

    // Giới hạn tần suất: tối đa 20 bài/giờ
    const recent = await prisma.submission.count({ where: { menteeId: userId, createdAt: { gte: new Date(Date.now() - 3600_000) } } });
    if (recent >= 20) return { error: "Bạn nộp quá nhiều, vui lòng thử lại sau." };

    try {
        const sub = await prisma.submission.create({
            data: {
                menteeId: userId, mentorshipId: link.mentorshipId, kind: d.kind, title: d.title,
                note: d.note || null, linkUrl: d.linkUrl || null,
            },
            select: { id: true },
        });
        try {
            await attachFiles({ ownerId: userId, purpose: "submission", fileIds: d.fileIds, target: { submissionId: sub.id } });
        } catch (e) {
            await prisma.submission.delete({ where: { id: sub.id } });
            throw e;
        }
        await logActivity("submit_assignment", sub.id, "submission", { kind: d.kind });
        revalidatePath("/submissions");
        return { success: true };
    } catch (e: any) {
        return { error: typeof e?.message === "string" && e.message.startsWith("Tệp") || e?.message === "Có tệp không hợp lệ." ? e.message : "Không nộp được bài. Vui lòng thử lại." };
    }
}

export async function deleteSubmission(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Bạn cần đăng nhập." };
    const sub = await prisma.submission.findUnique({ where: { id }, select: { menteeId: true, status: true } });
    if (!sub || sub.menteeId !== session.user.id) return { error: "Không tìm thấy bài nộp." };
    if (sub.status === "reviewed") return { error: "Bài đã được nhận xét, không thể xoá." };
    await prisma.submission.delete({ where: { id } });
    revalidatePath("/submissions");
    return { success: true };
}

/** Danh sách bài nộp trong phạm vi người xem được phép (mentee: của mình; mentor/facilitator: theo cặp; admin/manager: tất cả). */
export async function listSubmissions(filter?: { status?: string; menteeId?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const role = (session.user as any).role as string;

    const ids = await visibleMenteeIds(session.user.id, role);
    const where: any = {};
    if (ids) where.menteeId = { in: ids };
    if (filter?.menteeId) {
        if (ids && !ids.includes(filter.menteeId)) return [];
        where.menteeId = filter.menteeId;
    }
    if (filter?.status && ["submitted", "reviewed", "needs_revision"].includes(filter.status)) where.status = filter.status;

    const rows = await prisma.submission.findMany({
        where, orderBy: { createdAt: "desc" }, take: 200, select: submissionSelect,
    });
    return JSON.parse(JSON.stringify(rows));
}

const reviewSchema = z.object({
    id: z.string().min(1).max(64),
    status: z.enum(["reviewed", "needs_revision"]),
    feedback: z.string().trim().max(5000).default(""),
});

export async function reviewSubmission(input: unknown) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Bạn cần đăng nhập." };
    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) return { error: "Dữ liệu không hợp lệ." };
    const { id, status, feedback } = parsed.data;

    const sub = await prisma.submission.findUnique({ where: { id }, select: { menteeId: true } });
    if (!sub || !(await canReviewMentee(session.user.id, (session.user as any).role, sub.menteeId))) {
        return { error: "Không tìm thấy bài nộp." };
    }
    if (status === "needs_revision" && !feedback) return { error: "Hãy ghi rõ nội dung cần chỉnh sửa." };

    await prisma.submission.update({
        where: { id },
        data: { status, feedback: feedback || null, reviewedById: session.user.id, reviewedAt: new Date() },
    });
    await audit({ action: "submission.review", entityType: "submission", entityId: id, details: { status } });
    revalidatePath("/submissions");
    return { success: true };
}

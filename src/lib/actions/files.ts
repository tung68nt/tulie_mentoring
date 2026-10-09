"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canViewMentee, canViewResource } from "@/lib/access";
import { audit } from "@/lib/audit";
import {
    FILE_RULES,
    buildObjectPath,
    createSignedDownload,
    createSignedUpload,
    sanitizeFileName,
    storageBucket,
} from "@/lib/storage";

const requestSchema = z.object({
    purpose: z.enum(["selfie", "reflection", "submission", "resource"]),
    fileName: z.string().min(1).max(255),
    mimeType: z.string().min(1).max(120),
    size: z.number().int().positive(),
});

const MAX_PENDING_PER_HOUR = 30;

/**
 * Bước 1 của upload: server kiểm tra quyền/loại/dung lượng, tạo bản ghi FileAsset (pending)
 * và trả signed upload token. Client upload trực tiếp lên Supabase Storage.
 */
export async function requestUpload(input: unknown) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Bạn cần đăng nhập." };
    const userId = session.user.id;
    const role = (session.user as any).role as string;

    const parsed = requestSchema.safeParse(input);
    if (!parsed.success) return { error: "Dữ liệu tệp không hợp lệ." };
    const { purpose, fileName, mimeType, size } = parsed.data;

    if (purpose === "selfie" && role !== "mentee") return { error: "Chỉ mentee cần selfie check-in." };

    const rule = FILE_RULES[purpose];
    if (!rule.types[mimeType]) return { error: "Loại tệp không được hỗ trợ." };
    if (size > rule.maxSize) return { error: `Tệp vượt quá ${Math.round(rule.maxSize / 1024 / 1024)}MB.` };

    const recent = await prisma.fileAsset.count({
        where: { ownerId: userId, createdAt: { gte: new Date(Date.now() - 3600_000) } },
    });
    if (recent >= MAX_PENDING_PER_HOUR) return { error: "Bạn tải lên quá nhiều, vui lòng thử lại sau." };

    try {
        const path = buildObjectPath(purpose, userId, mimeType);
        const signed = await createSignedUpload(path);
        const file = await prisma.fileAsset.create({
            data: { ownerId: userId, purpose, path, fileName: sanitizeFileName(fileName), mimeType, size },
            select: { id: true },
        });
        return { fileId: file.id, path: signed.path, token: signed.token, bucket: storageBucket() };
    } catch (e) {
        console.error("[requestUpload]", e);
        return { error: "Không thể bắt đầu tải lên. Vui lòng thử lại." };
    }
}

/** Link tải có hạn 5 phút; chỉ chủ file hoặc người có quyền xem mentee đó mới lấy được. */
export async function getFileDownloadUrl(fileId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Bạn cần đăng nhập." };

    const file = await prisma.fileAsset.findUnique({ where: { id: fileId } });
    if (!file || file.status !== "ready") return { error: "Không tìm thấy tệp." };

    const viewerRole = (session.user as any).role as string;
    const allowed = file.resourceId
        ? await canViewResource(session.user.id, viewerRole, file.resourceId)
        : await canViewMentee(session.user.id, viewerRole, file.ownerId);
    if (!allowed) return { error: "Bạn không có quyền xem tệp này." };

    try {
        if (file.purpose === "selfie" && file.ownerId !== session.user.id) {
            await audit({ action: "file.view_selfie", entityType: "file", entityId: file.id });
        }
        return { url: await createSignedDownload(file.path, file.fileName) };
    } catch {
        return { error: "Không tạo được liên kết tải xuống." };
    }
}

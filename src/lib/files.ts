import { prisma } from "@/lib/db";
import { FILE_RULES, MAX_FILES_PER_ITEM, removeObjects, verifyObject, type FilePurpose } from "@/lib/storage";

// Helper nội bộ (không phải server action) để gắn file đã upload vào bản ghi.

/**
 * Xác minh các file thuộc người dùng, đúng mục đích, object thật sự tồn tại trên Storage,
 * rồi đánh dấu ready và gắn vào đích (reflection/submission). Ném lỗi nếu có file không hợp lệ.
 */
export async function attachFiles(opts: {
    ownerId: string;
    purpose: Exclude<FilePurpose, "selfie">;
    fileIds: string[];
    target: { reflectionId: string } | { submissionId: string };
}) {
    const ids = [...new Set(opts.fileIds)];
    if (ids.length === 0) return;
    if (ids.length > MAX_FILES_PER_ITEM) throw new Error(`Tối đa ${MAX_FILES_PER_ITEM} tệp.`);

    const files = await prisma.fileAsset.findMany({
        where: { id: { in: ids }, ownerId: opts.ownerId, purpose: opts.purpose },
    });
    if (files.length !== ids.length) throw new Error("Có tệp không hợp lệ.");

    const rule = FILE_RULES[opts.purpose];
    for (const f of files) {
        if (f.status === "ready") continue;
        const ok = await verifyObject(f.path, { size: f.size, mimeType: f.mimeType, maxSize: rule.maxSize });
        if (!ok) throw new Error(`Tệp "${f.fileName}" chưa tải lên thành công.`);
    }

    await prisma.fileAsset.updateMany({
        where: { id: { in: ids } },
        data: { status: "ready", ...opts.target },
    });
}

/** Xác minh selfie và đánh dấu ready (chưa gắn, Attendance sẽ trỏ tới). */
export async function confirmSelfie(ownerId: string, fileId: string) {
    const f = await prisma.fileAsset.findFirst({
        where: { id: fileId, ownerId, purpose: "selfie", attendance: null },
    });
    if (!f) throw new Error("Ảnh selfie không hợp lệ.");
    if (Date.now() - f.createdAt.getTime() > 10 * 60_000) throw new Error("Ảnh selfie đã hết hạn, vui lòng chụp lại.");
    const ok = await verifyObject(f.path, { size: f.size, mimeType: f.mimeType, maxSize: FILE_RULES.selfie.maxSize });
    if (!ok) throw new Error("Ảnh selfie chưa tải lên thành công.");
    await prisma.fileAsset.update({ where: { id: f.id }, data: { status: "ready" } });
    return f;
}

/** Dọn file pending quá 2 giờ (gọi từ cron). */
export async function cleanupStaleFiles() {
    const stale = await prisma.fileAsset.findMany({
        where: { status: "pending", createdAt: { lt: new Date(Date.now() - 2 * 3600_000) } },
        select: { id: true, path: true },
        take: 200,
    });
    await removeObjects(stale.map((s) => s.path)).catch(() => {});
    await prisma.fileAsset.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } });
    return stale.length;
}

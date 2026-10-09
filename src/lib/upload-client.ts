"use client";

import { createClient } from "@supabase/supabase-js";
import { requestUpload } from "@/lib/actions/files";

type Purpose = "selfie" | "reflection" | "submission";

/** Thu nhỏ ảnh về tối đa 960px, JPEG 0.8, để selfie nhẹ (~100-200KB). */
export async function compressImage(blob: Blob, maxSide = 960, quality = 0.8): Promise<Blob> {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Không xử lý được ảnh"))), "image/jpeg", quality)
    );
}

/**
 * Upload trực tiếp lên Supabase Storage bằng signed URL do server cấp.
 * Trả về fileId (đã là bản ghi FileAsset) để gửi kèm khi lưu thu hoạch/bài nộp/check-in.
 */
export async function uploadFile(
    file: Blob,
    purpose: Purpose,
    fileName: string
): Promise<{ fileId: string } | { error: string }> {
    const req = await requestUpload({ purpose, fileName, mimeType: file.type, size: file.size });
    if ("error" in req) return { error: req.error ?? "Không thể tải lên." };

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return { error: "Storage chưa được cấu hình." };

    const supabase = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.storage.from(req.bucket).uploadToSignedUrl(req.path, req.token, file, {
        contentType: file.type,
    });
    if (error) return { error: "Tải tệp lên thất bại. Vui lòng thử lại." };
    return { fileId: req.fileId };
}

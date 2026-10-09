import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// Server-only: dùng service role key, KHÔNG import từ client component.
// Không đặt "use server" ở đây để các hàm không bị lộ thành endpoint.

export type FilePurpose = "selfie" | "reflection" | "submission";

const MB = 1024 * 1024;

const DOC_TYPES: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/plain": "txt",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
};

export const FILE_RULES: Record<FilePurpose, { maxSize: number; types: Record<string, string> }> = {
    selfie: { maxSize: 2 * MB, types: { "image/jpeg": "jpg" } },
    reflection: { maxSize: 10 * MB, types: DOC_TYPES },
    submission: { maxSize: 10 * MB, types: DOC_TYPES },
};

export const MAX_FILES_PER_ITEM = 5;

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "tulie-files";

export function storageBucket() {
    return BUCKET;
}

let client: SupabaseClient | null = null;
function admin(): SupabaseClient {
    if (client) return client;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error("Storage chưa được cấu hình (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    }
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    return client;
}

/** Đường dẫn object do server sinh, không dùng bất kỳ phần nào của tên file người dùng. */
export function buildObjectPath(purpose: FilePurpose, ownerId: string, mimeType: string): string {
    const ext = FILE_RULES[purpose].types[mimeType];
    return `${purpose}/${ownerId}/${randomUUID()}.${ext}`;
}

export function sanitizeFileName(name: string): string {
    const cleaned = name.replace(/[\u0000-\u001f\\/:*?"<>|]+/g, "_").trim();
    return cleaned.slice(0, 120) || "file";
}

export async function createSignedUpload(path: string) {
    const { data, error } = await admin().storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new Error("Không tạo được liên kết tải lên.");
    return { token: data.token, path: data.path };
}

/** Xác minh object tồn tại và khớp kích thước/loại đã khai báo. */
export async function verifyObject(path: string, expected: { size: number; mimeType: string; maxSize: number }) {
    const { data, error } = await admin().storage.from(BUCKET).info(path);
    if (error || !data) return false;
    const size = Number(data.size ?? 0);
    const mime = String(data.contentType ?? "").split(";")[0].trim();
    return size > 0 && size <= expected.maxSize && size <= expected.size + 1024 && mime === expected.mimeType;
}

export async function createSignedDownload(path: string, fileName: string, expiresInSec = 300) {
    const { data, error } = await admin().storage.from(BUCKET).createSignedUrl(path, expiresInSec, { download: fileName });
    if (error || !data) throw new Error("Không tạo được liên kết tải xuống.");
    return data.signedUrl;
}

export async function removeObjects(paths: string[]) {
    if (paths.length === 0) return;
    await admin().storage.from(BUCKET).remove(paths);
}

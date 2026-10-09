import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { timingSafeEqual } from "crypto";
import { cleanupStaleFiles } from "@/lib/files";

/**
 * GET /api/cron/keepalive
 *
 * Chạy 1 truy vấn thật vào DB để Supabase không auto-pause (free tier pause sau 7 ngày không hoạt động).
 * Gọi định kỳ (<= 3 ngày/lần) từ GitHub Actions (.github/workflows/keepalive.yml) hoặc crontab VPS.
 * Bảo vệ bằng CRON_SECRET.
 */
export const dynamic = "force-dynamic";

function isAuthorized(header: string | null) {
    const secret = process.env.CRON_SECRET;
    if (!secret || !header) return false;
    const a = Buffer.from(header);
    const b = Buffer.from(`Bearer ${secret}`);
    return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
    if (!isAuthorized(request.headers.get("authorization"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.$queryRaw`SELECT 1`;
        const users = await prisma.user.count();
        // Dọn file upload dở dang (best-effort, không ảnh hưởng keep-alive)
        const cleaned = await cleanupStaleFiles().catch(() => -1);
        return NextResponse.json({ ok: true, users, cleaned, at: new Date().toISOString() });
    } catch (error) {
        console.error("[keepalive] DB check failed:", error);
        return NextResponse.json({ ok: false }, { status: 503 });
    }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { visibleMenteeIds } from "@/lib/access";
import { computeEngagement } from "@/lib/engagement";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["admin", "program_manager", "manager", "facilitator"];
const MAX_ROWS = 50_000;

/** Chặn CSV/Excel formula injection: ô bắt đầu bằng = + - @ tab CR bị prefix dấu nháy. */
function cell(v: unknown): string {
    let s = v instanceof Date ? v.toISOString() : v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
}
const toCsv = (header: string[], rows: unknown[][]) =>
    "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");

function parseDate(v: string | null, fallback: Date) {
    const d = v ? new Date(v) : null;
    return d && !isNaN(d.getTime()) ? d : fallback;
}

export async function GET(request: Request, { params }: { params: Promise<{ type: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role as string;
    if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { type } = await params;
    const url = new URL(request.url);
    const now = new Date();
    const from = parseDate(url.searchParams.get("from"), new Date(now.getTime() - 90 * 86_400_000));
    const to = parseDate(url.searchParams.get("to"), now);

    const ids = await visibleMenteeIds(session.user.id, role); // null = tất cả
    const userFilter = ids ? { in: ids } : undefined;
    const name = (u: { firstName: string | null; lastName: string | null }) => `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();

    let csv: string;
    if (type === "activity") {
        const logs = await prisma.activityLog.findMany({
            where: { ...(userFilter && { userId: userFilter }), user: { role: "mentee" }, createdAt: { gte: from, lte: to } },
            orderBy: { createdAt: "desc" }, take: MAX_ROWS,
            select: { createdAt: true, action: true, entityType: true, entityId: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        });
        csv = toCsv(["Thời gian", "Mentee ID", "Họ tên", "Email", "Hành động", "Đối tượng", "ID đối tượng"],
            logs.map((l) => [l.createdAt, l.user.id, name(l.user), l.user.email, l.action, l.entityType, l.entityId]));
    } else if (type === "attendance") {
        const rows = await prisma.attendance.findMany({
            where: { ...(userFilter && { userId: userFilter }), user: { role: "mentee" }, meeting: { scheduledAt: { gte: from, lte: to } } },
            orderBy: { meeting: { scheduledAt: "desc" } }, take: MAX_ROWS,
            select: {
                checkInTime: true, lateMinutes: true, status: true, checkInIp: true, selfieFileId: true,
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                meeting: { select: { title: true, scheduledAt: true } },
            },
        });
        csv = toCsv(["Buổi họp", "Giờ họp", "Mentee ID", "Họ tên", "Email", "Giờ check-in", "Trễ (phút)", "Có selfie", "IP", "Trạng thái"],
            rows.map((r) => [r.meeting.title, r.meeting.scheduledAt, r.user.id, name(r.user), r.user.email, r.checkInTime, r.lateMinutes ?? "", r.selfieFileId ? "có" : "không", r.checkInIp, r.checkInTime ? "present" : "absent"]));
    } else if (type === "engagement") {
        const mentees = await prisma.user.findMany({
            where: { role: "mentee", isActive: true, ...(ids && { id: { in: ids } }) },
            select: { id: true, firstName: true, lastName: true, email: true }, take: 5000,
        });
        const metrics = await computeEngagement(mentees.map((m) => m.id));
        csv = toCsv(["Mentee ID", "Họ tên", "Email", "Buổi đã họp", "Có mặt", "Đi muộn", "Thu hoạch đã nộp", "Thu hoạch đúng hạn", "Bài nộp 30 ngày", "Ngày hoạt động 14 ngày", "Hành động 30 ngày", "Hoạt động gần nhất", "Điểm"],
            mentees.map((m) => { const e = metrics.get(m.id)!; return [m.id, name(m), m.email, e.meetingsHeld, e.present, e.late, e.reflectionsSubmitted, e.reflectionsOnTime, e.submissions30d, e.activeDays14d, e.actions30d, e.lastActiveAt, e.score]; }));
    } else {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await audit({ action: "data.export", severity: "warning", entityType: "export", entityId: type, details: { from, to } });
    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${type}-${now.toISOString().slice(0, 10)}.csv"`,
            "Cache-Control": "no-store",
        },
    });
}

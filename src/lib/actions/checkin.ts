"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { confirmSelfie } from "@/lib/files";
import { logActivity } from "./activity";

// Mentee tự check-in trong khung giờ buổi họp, bắt buộc selfie. Không cần mentor mở mã.
const OPEN_BEFORE_MIN = 15; // mở trước giờ họp
const CLOSE_AFTER_END_MIN = 15; // đóng sau khi buổi họp kết thúc
const LATE_AFTER_MIN = 10; // trễ quá số phút này tính là đi muộn

const MIN = 60_000;

export type OpenCheckinMeeting = {
    id: string;
    title: string;
    scheduledAt: string;
    duration: number;
    type: string;
    location: string | null;
    meetingUrl: string | null;
    checkedIn: boolean;
    checkInTime: string | null;
    opensAt: string;
    closesAt: string;
    isOpen: boolean;
};

/** Các buổi họp của mentee trong ngày gần đây/sắp tới và trạng thái check-in. */
export async function getMyCheckinMeetings(): Promise<OpenCheckinMeeting[]> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    const now = Date.now();
    const meetings = await prisma.meeting.findMany({
        where: {
            status: { not: "cancelled" },
            scheduledAt: { gte: new Date(now - 24 * 3600_000), lte: new Date(now + 48 * 3600_000) },
            mentorship: { mentees: { some: { menteeId: userId } } },
        },
        orderBy: { scheduledAt: "asc" },
        select: {
            id: true, title: true, scheduledAt: true, duration: true, type: true, location: true, meetingUrl: true,
            attendances: { where: { userId }, select: { checkInTime: true } },
        },
    });

    return meetings.map((m) => {
        const opens = m.scheduledAt.getTime() - OPEN_BEFORE_MIN * MIN;
        const closes = m.scheduledAt.getTime() + (m.duration + CLOSE_AFTER_END_MIN) * MIN;
        const checkInTime = m.attendances[0]?.checkInTime ?? null;
        return {
            id: m.id,
            title: m.title,
            scheduledAt: m.scheduledAt.toISOString(),
            duration: m.duration,
            type: m.type,
            location: m.location,
            meetingUrl: m.meetingUrl,
            checkedIn: !!checkInTime,
            checkInTime: checkInTime?.toISOString() ?? null,
            opensAt: new Date(opens).toISOString(),
            closesAt: new Date(closes).toISOString(),
            isOpen: now >= opens && now <= closes,
        };
    });
}

const inputSchema = z.object({
    meetingId: z.string().min(1).max(64),
    selfieFileId: z.string().min(1).max(64),
});

export async function selfieCheckIn(input: unknown) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Bạn cần đăng nhập." };
    const userId = session.user.id;
    if ((session.user as any).role !== "mentee") return { error: "Chỉ mentee dùng check-in selfie." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { error: "Dữ liệu không hợp lệ." };
    const { meetingId, selfieFileId } = parsed.data;

    // Thời điểm do SERVER quyết định, không tin giờ từ client.
    const now = new Date();

    const meeting = await prisma.meeting.findFirst({
        where: {
            id: meetingId,
            status: { not: "cancelled" },
            mentorship: { mentees: { some: { menteeId: userId } } },
        },
        select: { id: true, title: true, scheduledAt: true, duration: true },
    });
    // Cùng một thông báo cho "không tồn tại" và "không thuộc về bạn" để tránh dò ID.
    if (!meeting) return { error: "Không tìm thấy buổi họp." };

    const opens = meeting.scheduledAt.getTime() - OPEN_BEFORE_MIN * MIN;
    const closes = meeting.scheduledAt.getTime() + (meeting.duration + CLOSE_AFTER_END_MIN) * MIN;
    if (now.getTime() < opens) return { error: "Chưa đến giờ check-in." };
    if (now.getTime() > closes) return { error: "Đã hết thời gian check-in của buổi họp này." };

    const existing = await prisma.attendance.findUnique({
        where: { meetingId_userId: { meetingId, userId } },
        select: { checkInTime: true },
    });
    if (existing?.checkInTime) return { success: true, alreadyCheckedIn: true, title: meeting.title };

    let ip: string | undefined;
    let ua: string | undefined;
    try {
        const h = await headers();
        ip = (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "").trim().slice(0, 64) || undefined;
        ua = h.get("user-agent")?.slice(0, 300) || undefined;
    } catch {}

    try {
        const selfie = await confirmSelfie(userId, selfieFileId);
        const lateMin = Math.max(0, Math.floor((now.getTime() - meeting.scheduledAt.getTime()) / MIN));

        await prisma.attendance.upsert({
            where: { meetingId_userId: { meetingId, userId } },
            create: {
                meetingId, userId, status: "present", checkInTime: now, selfieFileId: selfie.id,
                checkInIp: ip, checkInUa: ua, lateMinutes: lateMin > LATE_AFTER_MIN ? lateMin : 0,
            },
            update: {
                status: "present", checkInTime: now, selfieFileId: selfie.id,
                checkInIp: ip, checkInUa: ua, lateMinutes: lateMin > LATE_AFTER_MIN ? lateMin : 0,
            },
        });

        await audit({ action: "attendance.selfie_checkin", entityType: "meeting", entityId: meetingId, details: { lateMinutes: lateMin } });
        await logActivity("check_in", meetingId, "meeting", { title: meeting.title, method: "selfie" });
        revalidatePath("/checkin");
        revalidatePath(`/meetings/${meetingId}`);
        return { success: true, alreadyCheckedIn: false, title: meeting.title };
    } catch (e: any) {
        // Lỗi unique (selfie đã dùng cho lần khác) hoặc selfie không hợp lệ
        return { error: typeof e?.message === "string" && e.message.includes("selfie") ? e.message : "Không thể check-in. Vui lòng thử lại." };
    }
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatStr: string = "dd/MM/yyyy") {
    return format(new Date(date), formatStr);
}

export function formatDateTime(date: Date | string) {
    return format(new Date(date), "dd/MM/yyyy HH:mm");
}

export function formatTime(date: Date | string) {
    return format(new Date(date), "HH:mm");
}

export function formatRelative(date: Date | string) {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
}

export function getInitials(firstName: string, lastName: string) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getRoleLabel(role: string) {
    const labels: Record<string, string> = {
        admin: "Quản trị viên",
        mentor: "Mentor",
        mentee: "Mentee",
    };
    return labels[role] || role;
}

export function getStatusColor(status: string) {
    // Pure Vercel BnW — no colors, only grayscale
    const colors: Record<string, string> = {
        active: "bg-black text-white",
        completed: "bg-[#fafafa] text-black border border-[#eaeaea]",
        pending: "bg-[#fafafa] text-[#666] border border-[#eaeaea]",
        cancelled: "bg-[#fafafa] text-[#999] border border-[#eaeaea] line-through",
        draft: "bg-[#fafafa] text-[#999] border border-[#eaeaea]",
        scheduled: "bg-black text-white",
        in_progress: "bg-[#333] text-white",
        present: "bg-black text-white",
        absent: "bg-[#fafafa] text-[#999] border border-[#eaeaea]",
        late: "bg-[#fafafa] text-[#666] border border-[#eaeaea]",
        submitted: "bg-[#333] text-white",
        approved: "bg-black text-white",
    };
    return colors[status] || "bg-[#fafafa] text-[#666] border border-[#eaeaea]";
}

export function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
        active: "Đang hoạt động",
        pending: "Chờ xác nhận",
        completed: "Hoàn thành",
        cancelled: "Đã hủy",
        draft: "Bản nháp",
        scheduled: "Đã lên lịch",
        in_progress: "Đang diễn ra",
        present: "Có mặt",
        absent: "Vắng mặt",
        late: "Đi muộn",
        excused: "Có phép",
        submitted: "Đã nộp",
        approved: "Đã duyệt",
        not_started: "Chưa bắt đầu",
        paused: "Tạm dừng",
        withdrawn: "Đã rút",
        archived: "Đã lưu trữ",
    };
    return labels[status] || status;
}

export function getMeetingTypeLabel(type: string) {
    const labels: Record<string, string> = {
        offline: "Trực tiếp",
        online: "Trực tuyến",
        session: "Buổi mentoring",
        workshop: "Workshop",
        checkin: "Check-in",
    };
    return labels[type] || type;
}

export function generateSlug(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function truncate(str: string, length: number) {
    if (str.length <= length) return str;
    return str.slice(0, length) + "...";
}

export function calculateProgress(current: number, target: number) {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
}

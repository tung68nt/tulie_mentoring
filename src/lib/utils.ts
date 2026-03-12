import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

const VN_WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
const VN_WEEKDAYS_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getVNDateParts(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: VN_TIMEZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, weekday: "short",
  });
  const parts = fmt.formatToParts(d);
  const get = (type: string) => parts.find(p => p.type === type)?.value || "";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") === "24" ? "00" : get("hour"),
    minute: get("minute"),
    second: get("second"),
    weekday: new Intl.DateTimeFormat("en-US", { timeZone: VN_TIMEZONE, weekday: "long" }).format(d),
    dayOfWeek: Number(new Intl.DateTimeFormat("en-US", { timeZone: VN_TIMEZONE }).format(d).split("/")[1]) ? undefined : undefined,
  };
}

function getVNDayOfWeek(d: Date): number {
  // 0 = Sunday, 1 = Monday, ...
  const dayStr = new Intl.DateTimeFormat("en-US", { timeZone: VN_TIMEZONE, weekday: "short" }).format(d);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[dayStr] ?? 0;
}

export function formatDate(date: Date | string | number, pattern: string = "dd/MM/yyyy") {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";

  // Special pattern: PPP = Vietnamese long date (e.g., "12 tháng 3, 2026")
  if (pattern === "PPP") {
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: VN_TIMEZONE,
      year: "numeric", month: "long", day: "numeric",
    }).format(d);
  }

  const p = getVNDateParts(d);
  const dow = getVNDayOfWeek(d);
  const monthShort = new Intl.DateTimeFormat("en-US", { timeZone: VN_TIMEZONE, month: "short" }).format(d);

  // Use token replacement (longest match first) to avoid collisions like MM eating mm
  const tokens: [string, string][] = [
    ["EEEE", VN_WEEKDAYS[dow]],
    ["EEE", VN_WEEKDAYS_SHORT[dow]],
    ["yyyy", p.year],
    ["MMM", monthShort],
    ["MM", p.month],
    ["dd", p.day],
    ["HH", p.hour],
    ["mm", p.minute],
  ];

  let result = pattern;
  // Replace tokens with placeholders first, then substitute values
  const placeholders: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const [token, value] = tokens[i];
    const placeholder = `\x00${i}\x00`;
    placeholders.push(value);
    result = result.replace(token, placeholder);
  }
  for (let i = 0; i < placeholders.length; i++) {
    result = result.replace(`\x00${i}\x00`, placeholders[i]);
  }
  return result;
}

export function formatRelative(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} tuần trước`;
  return formatDate(d);
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Quản trị viên",
    mentor: "Mentor",
    mentee: "Mentee",
    manager: "Manager",
    program_manager: "User Manager",
    facilitator: "Facilitator",
  };
  return labels[role] || role;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "Đang hoạt động",
    inactive: "Ngừng hoạt động",
    completed: "Hoàn thành",
    pending: "Chờ duyệt",
    cancelled: "Đã hủy",
    in_progress: "Đang diễn ra",
    scheduled: "Đã lên lịch",
    draft: "Nháp",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-primary text-primary-foreground",
    inactive: "bg-muted text-muted-foreground",
    completed: "bg-primary text-primary-foreground",
    pending: "bg-secondary text-secondary-foreground",
    cancelled: "bg-destructive/10 text-destructive",
    in_progress: "bg-primary text-primary-foreground",
    scheduled: "bg-secondary text-secondary-foreground",
    draft: "bg-muted text-muted-foreground",
  };
  return colors[status] || "bg-secondary text-secondary-foreground";
}

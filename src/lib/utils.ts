import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number, pattern: string = "dd/MM/yyyy") {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return pattern
    .replace("dd", day)
    .replace("MM", month)
    .replace("yyyy", String(year))
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("MMM", d.toLocaleString('en-US', { month: 'short' }));
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

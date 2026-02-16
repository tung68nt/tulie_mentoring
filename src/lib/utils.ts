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

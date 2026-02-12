import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
    children?: ReactNode;
    status?: string;
    variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
    size?: "sm" | "md";
    className?: string;
}

export function Badge({ children, status, variant = "default", size = "sm", className }: BadgeProps) {
    if (status) {
        // Map status to Geist semantic colors
        const statusVariants: Record<string, string> = {
            active: "border-[#0070f3] text-[#0070f3] bg-[#0070f3]/5",
            completed: "border-[#0070f3] text-[#0070f3] bg-[#0070f3]/5",
            pending: "border-[#f5a623] text-[#f5a623] bg-[#f5a623]/5",
            absent: "border-[#ee0000] text-[#ee0000] bg-[#ee0000]/5",
            offline: "border-[#888] text-[#888] bg-[#888]/5",
        };

        return (
            <span
                className={cn(
                    "inline-flex items-center font-medium border rounded-full px-2 py-0.5",
                    size === "sm" ? "text-[10px]" : "text-[12px]",
                    statusVariants[status] || "border-[#eaeaea] text-[#666] bg-[#fafafa]",
                    className
                )}
            >
                {children || getStatusLabel(status)}
            </span>
        );
    }

    const variants = {
        default: "bg-[#fafafa] text-[#666] border-[#eaeaea]",
        success: "bg-[#0070f3]/5 text-[#0070f3] border-[#0070f3]",
        warning: "bg-[#f5a623]/5 text-[#f5a623] border-[#f5a623]",
        error: "bg-[#ee0000]/5 text-[#ee0000] border-[#ee0000]",
        info: "bg-[#0070f3]/5 text-[#0070f3] border-[#0070f3]",
        outline: "border-[#eaeaea] text-[#666] bg-white",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center font-medium border rounded-full px-2 py-0.5",
                size === "sm" ? "text-[10px]" : "text-[12px]",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
    children?: ReactNode;
    status?: string;
    variant?: "default" | "success" | "warning" | "error" | "info" | "outline" | "solid";
    size?: "sm" | "md";
    className?: string;
}

export function Badge({ children, status, variant = "default", size = "sm", className }: BadgeProps) {
    if (status) {
        // Vercel BnW: use getStatusColor for consistent grayscale badges
        return (
            <span
                className={cn(
                    "inline-flex items-center font-medium rounded-full px-2.5 py-0.5",
                    size === "sm" ? "text-[10px]" : "text-[12px]",
                    getStatusColor(status),
                    className
                )}
            >
                {children || getStatusLabel(status)}
            </span>
        );
    }

    // Vercel BnW variants — no colors
    const variants = {
        default: "bg-[#f5f5f5] text-[#666] border border-[#eee]",
        solid: "bg-black text-white hover:bg-[#111]",
        success: "bg-black text-white px-3 shadow-sm",
        warning: "bg-[#333] text-white",
        error: "bg-[#fafafa] text-[#999] border border-[#eaeaea]",
        info: "bg-white text-black border border-black/20 shadow-sm",
        outline: "border border-[#eee] text-[#888] bg-white hover:border-black/20 hover:text-black transition-colors",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center font-bold rounded-full transition-all duration-200",
                size === "sm" ? "text-[10px] px-2 py-0.5" : "text-[11px] px-3 py-1",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

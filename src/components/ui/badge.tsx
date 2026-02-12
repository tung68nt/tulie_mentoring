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
        default: "bg-[#fafafa] text-[#666] border border-[#eaeaea]",
        solid: "bg-black text-white",
        success: "bg-black text-white",
        warning: "bg-[#333] text-white",
        error: "bg-[#fafafa] text-[#999] border border-[#eaeaea]",
        info: "bg-[#fafafa] text-black border border-[#eaeaea]",
        outline: "border border-[#eaeaea] text-[#666] bg-white",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center font-medium rounded-full px-2.5 py-0.5",
                size === "sm" ? "text-[10px]" : "text-[12px]",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

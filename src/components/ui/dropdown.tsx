"use client"

import * as React from "react"
import {
    DropdownMenu as DropdownMenuRoot,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem as DropdownMenuItemPrimitive,
    DropdownMenuSeparator as DropdownMenuSeparatorPrimitive,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Dropdown Menu ─────────────────────────────────── */
interface DropdownMenuProps {
    children: React.ReactNode;
    trigger?: React.ReactNode;
    align?: "left" | "right" | "start" | "end" | "center";
    className?: string;
}

export function DropdownMenu({ children, trigger, align = "end", className }: DropdownMenuProps) {
    // Map old align values to shadcn align values
    const shadcnAlign = align === "left" ? "start" : align === "right" ? "end" : align;

    return (
        <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
                <button
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all outline-none"
                    onClick={(e) => e.stopPropagation()}
                >
                    {trigger || <MoreHorizontal className="w-4 h-4" />}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={shadcnAlign} className={cn("min-w-[160px]", className)}>
                {children}
            </DropdownMenuContent>
        </DropdownMenuRoot>
    );
}

/* ─── Dropdown Item ─────────────────────────────────── */
interface DropdownItemProps {
    children: React.ReactNode;
    onClick?: () => void;
    icon?: React.ReactNode;
    destructive?: boolean;
    className?: string;
}

export function DropdownItem({ children, onClick, icon, destructive, className }: DropdownItemProps) {
    return (
        <DropdownMenuItemPrimitive
            onClick={onClick}
            variant={destructive ? "destructive" : "default"}
            className={className}
        >
            {icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{icon}</span>}
            {children}
        </DropdownMenuItemPrimitive>
    );
}

/* ─── Dropdown Separator ────────────────────────────── */
export function DropdownSeparator() {
    return <DropdownMenuSeparatorPrimitive />;
}

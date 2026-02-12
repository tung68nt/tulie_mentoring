"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

/* ─── Dropdown Menu ─────────────────────────────────── */
interface DropdownMenuProps {
    children: React.ReactNode;
    trigger?: React.ReactNode;
    align?: "left" | "right";
    className?: string;
}

export function DropdownMenu({ children, trigger, align = "right", className }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div ref={ref} className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded-md hover:bg-[#fafafa] text-[#999] hover:text-black transition-all"
            >
                {trigger || <MoreHorizontal className="w-4 h-4" />}
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute top-full mt-1 min-w-[160px] bg-white border border-[#eaeaea] rounded-lg shadow-lg py-1 z-50 animate-scale-in",
                    align === "right" ? "right-0" : "left-0",
                    className
                )}>
                    {/* Pass close handler to children */}
                    <div onClick={() => setIsOpen(false)}>
                        {children}
                    </div>
                </div>
            )}
        </div>
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
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
                destructive
                    ? "text-red-600 hover:bg-red-50"
                    : "text-[#333] hover:bg-[#fafafa]",
                className
            )}
        >
            {icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{icon}</span>}
            {children}
        </button>
    );
}

/* ─── Dropdown Separator ────────────────────────────── */
export function DropdownSeparator() {
    return <div className="my-1 h-px bg-[#eaeaea]" />;
}

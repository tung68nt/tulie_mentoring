"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TabsProps {
    tabs: Array<{ id: string; label: string; icon?: ReactNode }>;
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
    variant?: "pill" | "underline";
}

export function Tabs({ tabs, activeTab, onChange, className, variant = "underline" }: TabsProps) {
    return (
        <div
            className={cn(
                "flex",
                variant === "pill" ? "gap-1 p-1 bg-[#fafafa] rounded-[8px] border border-[#eaeaea]" : "border-b border-[#eaeaea]",
                className
            )}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-all duration-200",
                            variant === "underline"
                                ? cn(
                                    "border-b-2 -mb-[1px]",
                                    isActive
                                        ? "border-black text-black"
                                        : "border-transparent text-[#666] hover:text-black"
                                )
                                : cn(
                                    "rounded-[6px]",
                                    isActive
                                        ? "bg-white text-black shadow-[0_2px_4px_rgba(0,0,0,0.08)] border border-[#eaeaea]"
                                        : "text-[#666] hover:text-black"
                                )
                        )}
                    >
                        {tab.icon && tab.icon}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

"use client";

import { Bell, Search, Menu, HelpCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NotificationPanel } from "@/components/features/notifications/notification-panel";
import Link from "next/link";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    link?: string | null;
    isRead: boolean;
    createdAt: Date;
}

interface HeaderProps {
    userName?: string;
    userRole?: string;
    avatar?: string | null;
    onMenuClick?: () => void;
    notifications?: Notification[];
    unreadCount?: number;
}

const roleLabels: Record<string, string> = {
    admin: "Quản trị Hệ thống",
    mentor: "Mentor",
    mentee: "Mentee",
};

export function Header({ userName, userRole, avatar, onMenuClick, notifications = [], unreadCount = 0 }: HeaderProps) {
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <header className="fixed top-0 right-0 left-0 lg:left-[var(--sidebar-width)] bg-white/80 backdrop-blur-md border-b border-[#eaeaea] z-40 transition-all">
            <div className="h-14 px-4 sm:px-6 flex items-center justify-between max-w-[1400px] mx-auto">
                {/* Left: Menu + Search */}
                <div className="flex items-center gap-3 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-md hover:bg-[#fafafa] text-[#666] hover:text-black transition-all"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className={cn(
                        "relative hidden md:block transition-all duration-300",
                        isSearchFocused ? "w-[400px]" : "w-[260px]"
                    )}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhanh..."
                            className="w-full h-9 pl-10 pr-4 bg-[#fafafa] border border-[#eaeaea] rounded-md text-sm text-black placeholder:text-[#999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all"
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                    </div>
                </div>

                {/* Right: Actions + User */}
                <div className="flex items-center gap-1.5">
                    {/* Notification Panel */}
                    <NotificationPanel
                        notifications={notifications}
                        unreadCount={unreadCount}
                    />

                    {/* Help */}
                    <button className="hidden sm:flex p-2 rounded-md hover:bg-[#fafafa] text-[#666] hover:text-black transition-all">
                        <HelpCircle className="w-[18px] h-[18px]" />
                    </button>

                    <div className="h-5 w-px bg-[#eaeaea] mx-1.5" />

                    {/* User profile */}
                    <Link href="/profile" className="flex items-center gap-2.5 pl-1 group cursor-pointer rounded-md hover:bg-[#fafafa] pr-2 py-1.5 transition-all">
                        <Avatar
                            firstName={userName?.split(" ")[0] || "U"}
                            lastName={userName?.split(" ").slice(1).join(" ") || ""}
                            src={avatar}
                            size="sm"
                            className="ring-1 ring-[#eaeaea] group-hover:ring-black/20 transition-all"
                        />
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-medium text-black leading-none mb-0.5">{userName || "Người dùng"}</p>
                            <p className="text-[10px] text-[#999] leading-none">{roleLabels[userRole || ""] || userRole || "Vai trò"}</p>
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}

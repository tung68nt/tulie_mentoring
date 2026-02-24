"use client";

import { Menu, HelpCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { NotificationPanel } from "@/components/features/notifications/notification-panel";
import { GlobalSearch } from "@/components/features/search/global-search";
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
    return (
        <header className="fixed top-0 right-0 left-0 lg:left-[var(--sidebar-width)] h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 transition-all">
            <div className="h-16 px-6 flex items-center justify-between max-w-[1400px] mx-auto">
                {/* Left: Menu + Search */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="hidden md:block">
                        <GlobalSearch />
                    </div>
                </div>

                {/* Right: Actions + User */}
                <div className="flex items-center gap-2">
                    {/* Notification Panel */}
                    <NotificationPanel
                        notifications={notifications}
                        unreadCount={unreadCount}
                    />

                    {/* Help */}
                    <button className="hidden sm:flex p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                        <HelpCircle className="w-[18px] h-[18px]" />
                    </button>

                    <div className="h-6 w-px bg-border mx-2" />

                    {/* User profile */}
                    <Link href="/profile" className="flex items-center gap-3 pl-1 group cursor-pointer rounded-xl hover:bg-muted pr-2 py-1.5 transition-all">
                        <Avatar
                            firstName={userName?.split(" ")[0] || "U"}
                            lastName={userName?.split(" ").slice(1).join(" ") || ""}
                            src={avatar}
                            size="sm"
                            className="ring-1 ring-border group-hover:ring-foreground/20 transition-all rounded-lg"
                        />
                        <div className="text-left hidden sm:block">
                            <p className="text-[13px] font-semibold text-foreground leading-none mb-1 no-uppercase">{userName || "Người dùng"}</p>
                            <p className="text-[10px] text-muted-foreground/60 leading-none no-uppercase">{roleLabels[userRole || ""] || userRole || "Vai trò"}</p>
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}

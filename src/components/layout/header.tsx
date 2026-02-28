"use client";

import { useState } from "react";
import { Menu, HelpCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { NotificationPanel } from "@/components/features/notifications/notification-panel";
import { GlobalSearch } from "@/components/features/search/global-search";
import { UserManual } from "@/components/features/help/user-manual";
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
    viewer: "Người xem",
};

export function Header({ userName, userRole, avatar, onMenuClick, notifications = [], unreadCount = 0 }: HeaderProps) {
    const [showManual, setShowManual] = useState(false);

    return (
        <>
            <header className="fixed top-0 right-0 left-0 lg:left-[var(--sidebar-width)] h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 transition-all">
                <div className="h-16 px-6 flex items-center justify-between max-w-[1400px] mx-auto">
                    {/* Left: Menu + Search */}
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden md:block">
                            <GlobalSearch />
                        </div>
                    </div>

                    {/* Right: Actions + User */}
                    <div className="flex items-center gap-2">
                        {/* Help */}
                        <button
                            onClick={() => setShowManual(true)}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mr-1"
                            title="Hướng dẫn sử dụng"
                        >
                            <HelpCircle className="w-[18px] h-[18px]" />
                        </button>

                        {/* Notification Panel */}
                        <NotificationPanel
                            notifications={notifications}
                            unreadCount={unreadCount}
                        />

                        <div className="h-6 w-px bg-border mx-2" />

                        {/* User profile */}
                        <Link href="/profile" className="flex items-center gap-2.5 pl-1 group cursor-pointer rounded-lg hover:bg-muted pr-2 py-1 transition-colors">
                            <Avatar
                                firstName={userName?.split(" ")[0] || "U"}
                                lastName={userName?.split(" ").slice(1).join(" ") || ""}
                                src={avatar}
                                size="md"
                                className="bg-muted text-[11px] font-bold"
                            />
                            <div className="text-left hidden sm:block">
                                <p className="text-[13px] font-semibold text-foreground leading-tight">{userName || "Người dùng"}</p>
                                <p className="text-[10px] text-muted-foreground/60 leading-tight">{roleLabels[userRole || ""] || userRole || "Vai trò"}</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <UserManual
                isOpen={showManual}
                onClose={() => setShowManual(false)}
            />
        </>
    );
}

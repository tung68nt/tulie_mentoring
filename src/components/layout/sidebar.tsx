"use client";

import { cn } from "@/lib/utils";
import {
    Users,
    Calendar,
    Target,
    BookOpen,
    MessageSquare,
    BarChart,
    LogOut,
    User,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
    role: "admin" | "mentor" | "mentee";
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = {
        admin: [
            { id: "dash", label: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
            { id: "users", label: "Người dùng", icon: User, href: "/admin/users" },
            { id: "mentorships", label: "Quản lý Mentorship", icon: Users, href: "/admin/mentorships" },
            { id: "programs", label: "Chương trình", icon: Target, href: "/admin/mentorships/new" },
            { id: "reports", label: "Báo cáo & Thống kê", icon: BarChart, href: "/admin/reports" },
        ],
        mentor: [
            { id: "dash", label: "Tổng quan", icon: LayoutDashboard, href: "/mentor" },
            { id: "calendar", label: "Lịch hoạt động", icon: Calendar, href: "/calendar" },
            { id: "resources", label: "Thư viện tài liệu", icon: BookOpen, href: "/resources" },
            { id: "feedback", label: "Phản hồi", icon: MessageSquare, href: "/feedback" },
        ],
        mentee: [
            { id: "dash", label: "Tổng quan", icon: LayoutDashboard, href: "/mentee" },
            { id: "goals", label: "Mục tiêu & Tiến độ", icon: Target, href: "/goals" },
            { id: "calendar", label: "Lịch hoạt động", icon: Calendar, href: "/calendar" },
            { id: "feedback", label: "Phản hồi", icon: MessageSquare, href: "/feedback" },
            { id: "resources", label: "Thư viện tài liệu", icon: BookOpen, href: "/resources" },
        ]
    };

    const items = menuItems[role] || [];

    const isActive = (href: string) => {
        if (href === "/admin" || href === "/mentor" || href === "/mentee") {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className={cn(
            "fixed top-0 left-0 h-screen bg-white border-r border-[#eaeaea] transition-all duration-300 z-50 overflow-hidden flex flex-col",
            "hidden lg:flex",
            isCollapsed ? "w-[68px]" : "w-[240px]"
        )} style={!isCollapsed ? { "--sidebar-width": "240px" } as React.CSSProperties : { "--sidebar-width": "68px" } as React.CSSProperties}>
            {/* Brand */}
            <div className="h-14 flex items-center px-4 border-b border-[#eaeaea] shrink-0">
                <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-[11px]">IMP</span>
                </div>
                {!isCollapsed && (
                    <span className="ml-3 font-semibold text-black text-sm whitespace-nowrap">ISME Mentoring</span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
                {items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all duration-150 relative group",
                                active
                                    ? "bg-black text-white font-medium"
                                    : "text-[#666] hover:bg-[#fafafa] hover:text-black"
                            )}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon className={cn(
                                "w-[18px] h-[18px] shrink-0 transition-colors",
                                active ? "text-white" : "text-[#999] group-hover:text-black"
                            )} />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-2.5 border-t border-[#eaeaea] space-y-0.5 shrink-0">
                <Link
                    href="/profile"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all",
                        pathname === "/profile"
                            ? "bg-black text-white font-medium"
                            : "text-[#666] hover:bg-[#fafafa] hover:text-black"
                    )}
                    title={isCollapsed ? "Hồ sơ cá nhân" : undefined}
                >
                    <User className={cn("w-[18px] h-[18px] shrink-0", pathname === "/profile" ? "text-white" : "text-[#999]")} />
                    {!isCollapsed && <span>Hồ sơ cá nhân</span>}
                </Link>

                <button
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-[13px] text-[#666] hover:bg-red-50 hover:text-red-600 transition-all group"
                    onClick={() => {/* Sign out logic */ }}
                    title={isCollapsed ? "Đăng xuất" : undefined}
                >
                    <LogOut className="w-[18px] h-[18px] shrink-0 text-[#999] group-hover:text-red-500 transition-colors" />
                    {!isCollapsed && <span>Đăng xuất</span>}
                </button>

                {/* Collapse toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-[13px] text-[#999] hover:bg-[#fafafa] hover:text-black transition-all"
                >
                    {isCollapsed
                        ? <ChevronRight className="w-[18px] h-[18px] shrink-0" />
                        : <ChevronLeft className="w-[18px] h-[18px] shrink-0" />}
                    {!isCollapsed && <span className="text-[#999]">Thu gọn</span>}
                </button>
            </div>
        </aside>
    );
}

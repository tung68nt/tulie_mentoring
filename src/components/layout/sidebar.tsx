"use client";

import { cn } from "@/lib/utils";
import {
    Users,
    Calendar,
    Target,
    BookOpen,
    MessageSquare,
    BarChart,
    Settings,
    LogOut,
    ChevronRight,
    User,
    LayoutDashboard,
    Plus
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    role: "admin" | "mentor" | "mentee";
    isCollapsed?: boolean;
}

export function Sidebar({ role, isCollapsed = false }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = {
        admin: [
            { id: "dash", label: "Tổng quan", icon: <LayoutDashboard />, href: "/admin" },
            { id: "users", label: "Người dùng", icon: <User />, href: "/admin/users" },
            { id: "mentorships", label: "Quản lý Mentorship", icon: <Users />, href: "/admin/mentorships" },
            { id: "programs", label: "Chương trình", icon: <Target />, href: "/admin/mentorships/new" },
            { id: "reports", label: "Báo cáo & Thống kê", icon: <BarChart />, href: "/admin/reports" },
        ],
        mentor: [
            { id: "dash", label: "Tổng quan", icon: <LayoutDashboard />, href: "/mentor" },
            { id: "calendar", label: "Lịch hoạt động", icon: <Calendar />, href: "/calendar" },
            { id: "resources", label: "Thư viện tài liệu", icon: <BookOpen />, href: "/resources" },
            { id: "feedback", label: "Phản hồi", icon: <MessageSquare />, href: "/feedback" },
        ],
        mentee: [
            { id: "dash", label: "Tổng quan", icon: <LayoutDashboard />, href: "/mentee" },
            { id: "goals", label: "Mục tiêu & Tiến độ", icon: <Target />, href: "/goals" },
            { id: "calendar", label: "Lịch hoạt động", icon: <Calendar />, href: "/calendar" },
            { id: "feedback", label: "Phản hồi", icon: <MessageSquare />, href: "/feedback" },
            { id: "resources", label: "Thư viện tài liệu", icon: <BookOpen />, href: "/resources" },
        ]
    };

    const items = menuItems[role] || [];

    return (
        <aside className={cn(
            "fixed top-0 left-0 h-screen bg-white border-r border-[#eaeaea] transition-all duration-300 z-50 overflow-hidden flex flex-col",
            isCollapsed ? "w-[64px]" : "w-[240px]"
        )}>
            {/* Brand */}
            <div className="h-14 flex items-center px-4 border-b border-[#eaeaea]">
                <div className="w-8 h-8 bg-black rounded-[6px] flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xs">IMP</span>
                </div>
                {!isCollapsed && (
                    <span className="ml-3 font-semibold text-black text-sm">ISME Mentoring</span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-[6px] text-sm transition-all duration-200 relative group",
                                isActive
                                    ? "bg-[#fafafa] text-black border border-[#eaeaea] font-medium"
                                    : "text-[#666] hover:bg-[#fafafa] hover:text-black hover:translate-x-0.5"
                            )}
                        >
                            <span className={cn(
                                "w-5 h-5 flex items-center justify-center shrink-0 transition-colors",
                                isActive ? "text-black" : "text-[#999] group-hover:text-black"
                            )}>
                                {item.icon}
                            </span>
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                            {isActive && !isCollapsed && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#eaeaea]" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-[#eaeaea] space-y-2">
                <Link
                    href="/profile"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-[6px] text-[#666] transition-all hover:bg-[#fafafa] hover:text-black text-sm",
                        pathname === "/profile" && "bg-black/5 text-black"
                    )}
                >
                    <User className="w-5 h-5 opacity-70" />
                    {!isCollapsed && <span>Hồ sơ cá nhân</span>}
                </Link>
                <button
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-[6px] text-[#ee0000] hover:bg-[#ee0000]/5 transition-all text-sm group"
                    onClick={() => {/* Sign out logic */ }}
                >
                    <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                    {!isCollapsed && <span className="font-medium text-[13px]">Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
}

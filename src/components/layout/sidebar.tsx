"use client";

import { cn } from "@/lib/utils";
import {
    Users,
    Calendar,
    Target,
    MessageSquare,
    BarChart,
    LogOut,
    User,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    Eye,
    QrCode,
    PenLine,
    CheckSquare,
    FileText,
    LifeBuoy,
    BookMarked,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    role: "admin" | "mentor" | "mentee";
}

interface MenuItem {
    id: string;
    label: string;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    icon: any;
    href: string;
}

interface MenuSection {
    title?: string;
    items: MenuItem[];
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const menuSections: Record<string, MenuSection[]> = {
        admin: [
            {
                items: [
                    { id: "dash", label: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
                ],
            },
            {
                title: "Quản lý",
                items: [
                    { id: "users", label: "Người dùng", icon: User, href: "/admin/users" },
                    { id: "mentorships", label: "Mentorship", icon: Users, href: "/admin/mentorships" },
                    { id: "programs", label: "Chương trình", icon: Target, href: "/admin/mentorships/new" },
                    { id: "reports", label: "Báo cáo & Thống kê", icon: BarChart, href: "/admin/reports" },
                ],
            },
            {
                title: "Xem trước",
                items: [
                    { id: "mentor-view", label: "Giao diện Mentor", icon: Eye, href: "/mentor" },
                    { id: "mentee-view", label: "Giao diện Mentee", icon: Eye, href: "/mentee" },
                ],
            },
            {
                title: "Hệ thống",
                items: [
                    { id: "calendar", label: "Lịch hoạt động", icon: Calendar, href: "/calendar" },
                    { id: "wiki", label: "Wiki & Tài liệu", icon: BookMarked, href: "/wiki" },
                    { id: "tickets", label: "Yêu cầu hỗ trợ", icon: LifeBuoy, href: "/tickets" },
                ],
            },
        ],
        mentor: [
            {
                items: [
                    { id: "dash", label: "Tổng quan", icon: LayoutDashboard, href: "/mentor" },
                ],
            },
            {
                title: "Quản lý",
                items: [
                    { id: "calendar", label: "Lịch gặp & QR", icon: Calendar, href: "/calendar" },
                    { id: "mentees", label: "Mentees", icon: Users, href: "/mentees" },
                    { id: "reports", label: "Báo cáo & Tiến bộ", icon: BarChart, href: "/reports" },
                ],
            },
            {
                title: "Nội dung",
                items: [
                    { id: "wiki", label: "Wiki & Tài liệu", icon: BookMarked, href: "/wiki" },
                    { id: "feedback", label: "Phản hồi & Đánh giá", icon: MessageSquare, href: "/feedback" },
                ],
            },
        ],
        mentee: [
            {
                items: [
                    { id: "dash", label: "Tổng quan", icon: LayoutDashboard, href: "/mentee" },
                ],
            },
            {
                title: "Học tập",
                items: [
                    { id: "checkin", label: "Check-in / Check-out", icon: QrCode, href: "/checkin" },
                    { id: "reflections", label: "Thu hoạch & Nhật ký", icon: PenLine, href: "/reflections" },
                    { id: "tasks", label: "Công việc", icon: CheckSquare, href: "/tasks" },
                    { id: "reports", label: "Báo cáo", icon: FileText, href: "/reports" },
                ],
            },
            {
                title: "Hỗ trợ",
                items: [
                    { id: "goals", label: "Mục tiêu", icon: Target, href: "/goals" },
                    { id: "wiki", label: "Wiki & Tài liệu", icon: BookMarked, href: "/wiki" },
                    { id: "tickets", label: "Yêu cầu hỗ trợ", icon: LifeBuoy, href: "/tickets" },
                ],
            },
            {
                title: "Cá nhân",
                items: [
                    { id: "portfolio", label: "Hồ sơ năng lực", icon: FolderOpen, href: "/portfolio" },
                    { id: "calendar", label: "Lịch hoạt động", icon: Calendar, href: "/calendar" },
                ],
            },
        ],
    };

    const sections = menuSections[role] || [];

    const isActive = (href: string) => {
        if (pathname === href) return true;
        if (href === "/admin" || href === "/mentor" || href === "/mentee") {
            return pathname === href;
        }
        if (href === "/admin/mentorships" && pathname.startsWith("/admin/mentorships/new")) {
            return false;
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className={cn(
            "fixed top-0 left-0 h-screen bg-background border-r border-border transition-all duration-300 z-50 overflow-hidden flex flex-col",
            "hidden lg:flex",
            isCollapsed ? "w-[80px]" : "w-[280px]"
        )} style={!isCollapsed ? { "--sidebar-width": "280px" } as React.CSSProperties : { "--sidebar-width": "80px" } as React.CSSProperties}>
            {/* Brand */}
            <div className="h-16 flex items-center px-6 shrink-0">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground font-bold text-[11px]">T</span>
                </div>
                {!isCollapsed && (
                    <span className="ml-3 font-semibold text-foreground text-[15px] tracking-normal no-uppercase whitespace-nowrap">Tulie Mentoring</span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 overflow-y-auto space-y-8">
                {sections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-4">
                        {section.title && !isCollapsed && (
                            <div className="px-5 mb-1 pt-1">
                                <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground/30">{section.title}</span>
                            </div>
                        )}
                        {section.title && isCollapsed && (
                            <div className="mx-5 mb-2 pt-1 border-t border-border/30" />
                        )}
                        <div className="space-y-2">
                            {section.items.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-4 px-5 py-3 rounded-[1.25rem] text-[13.5px] transition-all duration-300 relative group",
                                            active
                                                ? "bg-secondary text-foreground font-semibold shadow-sm"
                                                : "text-muted-foreground/60 hover:bg-accent/70 hover:text-foreground hover:translate-x-1"
                                        )}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <Icon className={cn(
                                            "w-[20px] h-[20px] shrink-0 transition-all duration-300",
                                            active ? "opacity-100 scale-110" : "opacity-40 group-hover:opacity-100 group-hover:scale-105"
                                        )} />
                                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                                        {active && !isCollapsed && (
                                            <div className="absolute left-0 w-1.5 h-6 bg-primary rounded-full -translate-x-2 shadow-[4px_0_12px_rgba(0,0,0,0.1)]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border space-y-0.5 shrink-0 bg-muted/30">
                <Link
                    href="/profile"
                    className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all",
                        pathname === "/profile"
                            ? "bg-secondary text-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    title={isCollapsed ? "Hồ sơ cá nhân" : undefined}
                >
                    <User className={cn("w-[18px] h-[18px] shrink-0", pathname === "/profile" ? "opacity-100" : "opacity-60")} />
                    {!isCollapsed && <span>Hồ sơ cá nhân</span>}
                </Link>

                <button
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground transition-all group"
                    onClick={() => setShowLogoutDialog(true)}
                    title={isCollapsed ? "Đăng xuất" : undefined}
                >
                    <LogOut className="w-[18px] h-[18px] shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                    {!isCollapsed && <span>Đăng xuất</span>}
                </button>

                {/* Collapse toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                    {isCollapsed
                        ? <ChevronRight className="w-[18px] h-[18px] shrink-0" />
                        : <ChevronLeft className="w-[18px] h-[18px] shrink-0" />}
                    {!isCollapsed && <span className="text-muted-foreground/60">Thu gọn</span>}
                </button>
            </div>

            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent showCloseButton={false} className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="no-uppercase">Đăng xuất</DialogTitle>
                        <DialogDescription className="text-muted-foreground">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" className="rounded-xl no-uppercase" onClick={() => setShowLogoutDialog(false)}>Hủy</Button>
                        <Button variant="destructive" className="rounded-xl no-uppercase" onClick={() => signOut({ callbackUrl: "/login" })}>Đăng xuất</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </aside>
    );
}

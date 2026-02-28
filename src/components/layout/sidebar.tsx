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
    Presentation,
    ListTodo,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    role: "admin" | "mentor" | "mentee" | "viewer";
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
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

export function Sidebar({ role, isMobileOpen, onMobileClose }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const menuSections: Record<string, MenuSection[]> = {
        admin: [
            {
                items: [
                    { id: "dash", label: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
                    { id: "users", label: "Người dùng", icon: User, href: "/admin/users" },
                    { id: "mentorships", label: "Mentorship", icon: Users, href: "/admin/mentorships" },
                    { id: "programs", label: "Chương trình", icon: Target, href: "/admin/mentorships/new" },
                ],
            },
            {
                items: [
                    { id: "reports", label: "Báo cáo", icon: BarChart, href: "/admin/reports" },
                    { id: "calendar", label: "Lịch hoạt động", icon: Calendar, href: "/calendar" },
                ],
            },
            {
                items: [
                    { id: "mentor-view", label: "Giao diện Mentor", icon: Eye, href: "/mentor" },
                    { id: "mentee-view", label: "Giao diện Mentee", icon: Eye, href: "/mentee" },
                ],
            },
            {
                items: [
                    { id: "wiki", label: "Wiki & Tài liệu", icon: BookMarked, href: "/wiki" },
                    { id: "whiteboard", label: "Whiteboard", icon: PenLine, href: "/whiteboard" },
                    { id: "slides", label: "Slides", icon: Presentation, href: "/slides" },
                    { id: "tickets", label: "Yêu cầu hỗ trợ", icon: LifeBuoy, href: "/tickets" },
                ],
            },
        ],
        mentor: [
            {
                items: [
                    { id: "dash", label: "Tổng quan", icon: LayoutDashboard, href: "/mentor" },
                    { id: "calendar", label: "Lịch gặp & QR", icon: Calendar, href: "/calendar" },
                ],
            },
            {
                items: [
                    { id: "mentees", label: "Mentees", icon: Users, href: "/mentees" },
                    { id: "feedback", label: "Phản hồi & Đánh giá", icon: MessageSquare, href: "/feedback" },
                ],
            },
            {
                items: [
                    { id: "wiki", label: "Wiki & Tài liệu", icon: BookMarked, href: "/wiki" },
                    { id: "whiteboard", label: "Whiteboard", icon: PenLine, href: "/whiteboard" },
                    { id: "slides", label: "Slides", icon: Presentation, href: "/slides" },
                ],
            },
        ],
        mentee: [
            {
                items: [
                    { id: "dash", label: "Tổng quan", icon: LayoutDashboard, href: "/mentee" },
                    { id: "calendar", label: "Lịch hoạt động", icon: Calendar, href: "/calendar" },
                ],
            },
            {
                items: [
                    { id: "checkin", label: "Check-in / Check-out", icon: QrCode, href: "/checkin" },
                    { id: "tasks", label: "Công việc", icon: CheckSquare, href: "/tasks" },
                    { id: "goals", label: "Mục tiêu", icon: Target, href: "/goals" },
                ],
            },
            {
                items: [
                    { id: "daily", label: "Nhật ký hằng ngày", icon: ListTodo, href: "/daily" },
                    { id: "reflections", label: "Thu hoạch & Nhật ký", icon: PenLine, href: "/reflections" },
                    { id: "portfolio", label: "Nhật ký hành trình", icon: FolderOpen, href: "/portfolio" },
                ],
            },
            {
                items: [
                    { id: "wiki", label: "Wiki & Tài liệu", icon: BookMarked, href: "/wiki" },
                    { id: "whiteboard", label: "Whiteboard", icon: PenLine, href: "/whiteboard" },
                    { id: "slides", label: "Slides", icon: Presentation, href: "/slides" },
                    { id: "tickets", label: "Yêu cầu hỗ trợ", icon: LifeBuoy, href: "/tickets" },
                ],
            },
        ],
        viewer: [
            {
                items: [
                    { id: "reports", label: "Báo cáo & Tiến bộ", icon: BarChart, href: "/reports" },
                    { id: "mentees", label: "Mentees", icon: Users, href: "/mentees" },
                    { id: "calendar", label: "Lịch hoạt động", icon: Calendar, href: "/calendar" },
                    { id: "wiki", label: "Wiki & Tài liệu", icon: BookMarked, href: "/wiki" },
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
            "fixed top-0 left-0 h-screen bg-background border-r border-border transition-all duration-300 z-50 flex flex-col",
            isMobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0",
            !isMobileOpen && (isCollapsed ? "lg:w-[80px]" : "lg:w-[280px]")
        )} style={(!isCollapsed || isMobileOpen) ? { "--sidebar-width": "280px" } as React.CSSProperties : { "--sidebar-width": "80px" } as React.CSSProperties}>
            {/* Brand */}
            <div className="h-16 flex items-center justify-between px-6 shrink-0 relative">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground font-bold text-[11px]">T</span>
                    </div>
                    {(!isCollapsed || isMobileOpen) && (
                        <span className="ml-3 font-semibold text-foreground text-[14px] tracking-normal whitespace-nowrap">Tulie Mentoring</span>
                    )}
                </div>

                {/* Mobile Close Button */}
                {isMobileOpen && (
                    <button
                        onClick={onMobileClose}
                        className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="absolute top-4 -right-4 z-50 hidden lg:block">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-all shadow-none"
                    >
                        {isCollapsed
                            ? <ChevronRight className="w-4 h-4" />
                            : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Navigation container with overflow handling */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <nav className="flex-1 py-4 px-4 overflow-y-auto space-y-4">
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-1">

                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const active = isActive(item.href);
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors relative group",
                                                active
                                                    ? "bg-secondary text-foreground font-medium"
                                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                            )}
                                            title={isCollapsed ? item.label : undefined}
                                        >
                                            <Icon className={cn(
                                                "w-[18px] h-[18px] shrink-0 transition-opacity",
                                                active ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                                            )} />
                                            {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border shrink-0 bg-muted/20 space-y-1">
                <Link
                    href="/profile"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors",
                        pathname === "/profile"
                            ? "bg-secondary text-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    title={isCollapsed ? "Hồ sơ cá nhân" : undefined}
                >
                    <User className={cn("w-[18px] h-[18px] shrink-0", pathname === "/profile" ? "opacity-100" : "opacity-60")} />
                    {!isCollapsed && <span>Hồ sơ cá nhân</span>}
                </Link>

                <button
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground transition-all group"
                    onClick={() => setShowLogoutDialog(true)}
                    title={isCollapsed ? "Đăng xuất" : undefined}
                >
                    <LogOut className="w-[18px] h-[18px] shrink-0 opacity-60 group-hover:opacity-100" />
                    {!isCollapsed && <span>Đăng xuất</span>}
                </button>
            </div>

            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent showCloseButton={false} className="sm:max-w-[400px] rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Đăng xuất</DialogTitle>
                        <DialogDescription>Bạn có chắc chắn muốn đăng xuất?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" className="rounded-lg" onClick={() => setShowLogoutDialog(false)}>Hủy</Button>
                        <Button variant="destructive" className="rounded-lg" onClick={() => signOut({ callbackUrl: "/login" })}>Đăng xuất</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </aside>
    );
}

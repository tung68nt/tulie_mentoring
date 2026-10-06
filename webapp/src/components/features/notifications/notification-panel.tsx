"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import {
    Bell,
    Check,
    CheckCheck,
    ExternalLink,
    Sparkles,
    Calendar,
    BookOpen,
    MessageSquare,
    Target,
    Trash2,
    ArrowRight,
    Clock,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { markAsRead, markAllAsRead, deleteNotification } from "@/lib/actions/notification";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    link?: string | null;
    isRead: boolean;
    createdAt: Date | string;
}

interface NotificationPanelProps {
    notifications: Notification[];
    unreadCount: number;
}

function timeAgo(dateInput: Date | string): string {
    const date = new Date(dateInput);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

interface TypeConfig {
    icon: any;
    label: string;
    badgeClass: string;
    iconBoxClass: string;
}

const typeConfigs: Record<string, TypeConfig> = {
    reminder: {
        icon: Sparkles,
        label: "Cần làm",
        badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        iconBoxClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    meeting: {
        icon: Calendar,
        label: "Buổi họp",
        badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        iconBoxClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    },
    reflection: {
        icon: BookOpen,
        label: "Thu hoạch",
        badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        iconBoxClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    feedback: {
        icon: MessageSquare,
        label: "Phản hồi",
        badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
        iconBoxClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    },
    goal: {
        icon: Target,
        label: "Mục tiêu",
        badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
        iconBoxClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    },
    system: {
        icon: Bell,
        label: "Hệ thống",
        badgeClass: "bg-muted text-muted-foreground border-border",
        iconBoxClass: "bg-muted text-muted-foreground border-border",
    },
};

export function NotificationPanel({ notifications, unreadCount }: NotificationPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "reminders" | "unread">("all");
    const [isPending, startTransition] = useTransition();
    const [localNotifs, setLocalNotifs] = useState<Notification[]>(notifications);
    const [localUnread, setLocalUnread] = useState(unreadCount);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalNotifs(notifications);
        const actualUnread = notifications.filter((n) => !n.isRead).length;
        setLocalUnread(actualUnread);
    }, [notifications, unreadCount]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleMarkAsRead = (id: string) => {
        setLocalNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        setLocalUnread((prev) => Math.max(0, prev - 1));
        startTransition(async () => {
            await markAsRead(id);
        });
    };

    const handleMarkAllAsRead = () => {
        setLocalNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setLocalUnread(0);
        startTransition(async () => {
            await markAllAsRead();
        });
    };

    const handleDelete = (id: string) => {
        const target = localNotifs.find((n) => n.id === id);
        if (target && !target.isRead) {
            setLocalUnread((prev) => Math.max(0, prev - 1));
        }
        setLocalNotifs((prev) => prev.filter((n) => n.id !== id));
        startTransition(async () => {
            await deleteNotification(id);
        });
    };

    // Filter notifications by tab
    const remindersCount = localNotifs.filter(
        (n) => n.type === "reminder" || n.type === "reflection" || n.type === "meeting" || !n.isRead
    ).length;

    const filteredNotifs = localNotifs.filter((n) => {
        if (activeTab === "unread") return !n.isRead;
        if (activeTab === "reminders") {
            return n.type === "reminder" || n.type === "reflection" || n.type === "meeting";
        }
        return true;
    });

    const hasUrgentReminder = localNotifs.some(
        (n) => !n.isRead && (n.type === "reminder" || n.type === "reflection")
    );

    return (
        <div ref={panelRef} className="relative">
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer",
                    isOpen
                        ? "bg-primary/10 text-primary shadow-xs"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                aria-label="Thông báo & Nhắc nhở"
                title="Thông báo & Nhắc nhở"
            >
                <Bell className="w-[18px] h-[18px]" />

                {/* Badge indicator */}
                {localUnread > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center">
                        {hasUrgentReminder && (
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75" />
                        )}
                        <span className="relative min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-background leading-none shadow-xs">
                            {localUnread > 99 ? "99+" : localUnread}
                        </span>
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-[calc(100vw-1.5rem)] sm:w-[410px] max-w-[420px] bg-card/95 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] overflow-hidden z-[100] animate-in fade-in-50 zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="p-3.5 pb-2.5 border-b border-border/80 bg-muted/20">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Thông báo & Nhắc nhở
                                </h3>
                                {localUnread > 0 && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                        {localUnread} mới
                                    </Badge>
                                )}
                            </div>

                            {localUnread > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllAsRead}
                                    disabled={isPending}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer font-medium"
                                >
                                    <CheckCheck className="w-3.5 h-3.5 text-primary" />
                                    <span>Đọc tất cả</span>
                                </button>
                            )}
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1.5 mt-2.5">
                            {[
                                { id: "all" as const, label: "Tất cả", count: localNotifs.length },
                                { id: "reminders" as const, label: "⚡ Nhắc nhở cần làm", count: remindersCount },
                                { id: "unread" as const, label: "Chưa đọc", count: localUnread },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1",
                                        activeTab === tab.id
                                            ? "bg-foreground text-background shadow-xs font-semibold"
                                            : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && (
                                        <span className={cn(
                                            "text-[10px] px-1.5 py-0 rounded-full",
                                            activeTab === tab.id ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-border/50">
                        {filteredNotifs.length === 0 ? (
                            <div className="py-12 px-4 text-center space-y-2">
                                <div className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                </div>
                                <p className="text-xs font-semibold text-foreground">
                                    {activeTab === "unread"
                                        ? "Đã đọc hết mọi thông báo"
                                        : activeTab === "reminders"
                                        ? "Tuyệt vời! Không còn nhắc nhở tồn đọng"
                                        : "Chưa có thông báo nào"}
                                </p>
                                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                                    Hệ thống sẽ tự động nhắc bạn khi có buổi họp, bài thu hoạch hoặc khảo sát mới.
                                </p>
                            </div>
                        ) : (
                            filteredNotifs.map((notif) => {
                                const config = typeConfigs[notif.type] || typeConfigs.system;
                                const IconComponent = config.icon;

                                // Xác định CTA label tùy theo ngữ cảnh
                                let ctaLabel = "Xem chi tiết";
                                if (notif.link === "/mentee/onboarding") ctaLabel = "Làm trắc nghiệm ngay";
                                else if (notif.type === "reflection") ctaLabel = "Nộp thu hoạch";
                                else if (notif.type === "meeting") ctaLabel = "Vào buổi họp";

                                return (
                                    <div
                                        key={notif.id}
                                        className={cn(
                                            "group p-3.5 transition-all flex items-start gap-3 relative",
                                            !notif.isRead
                                                ? "bg-primary/5 hover:bg-primary/10"
                                                : "hover:bg-muted/40"
                                        )}
                                    >
                                        {/* Icon Box */}
                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5",
                                                config.iconBoxClass
                                            )}
                                        >
                                            <IconComponent className="w-4 h-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <Badge
                                                    variant="outline"
                                                    className={cn("text-[9px] px-1.5 py-0 h-4 font-semibold border", config.badgeClass)}
                                                >
                                                    {config.label}
                                                </Badge>
                                                {!notif.isRead && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                )}
                                                <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {timeAgo(notif.createdAt)}
                                                </span>
                                            </div>

                                            <h4
                                                className={cn(
                                                    "text-xs leading-snug",
                                                    notif.isRead ? "text-foreground font-medium" : "text-foreground font-semibold"
                                                )}
                                            >
                                                {notif.title}
                                            </h4>

                                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                                {notif.message}
                                            </p>

                                            {/* Action Button CTA */}
                                            {notif.link && (
                                                <div className="pt-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant={notif.type === "reminder" ? "default" : "outline"}
                                                        asChild
                                                        className={cn(
                                                            "h-6 px-2.5 text-[11px] rounded-lg font-medium gap-1 shadow-none",
                                                            notif.type === "reminder" && "bg-amber-500 hover:bg-amber-600 text-white border-none"
                                                        )}
                                                    >
                                                        <Link
                                                            href={notif.link}
                                                            onClick={() => {
                                                                if (!notif.isRead) handleMarkAsRead(notif.id);
                                                                setIsOpen(false);
                                                            }}
                                                        >
                                                            <span>{ctaLabel}</span>
                                                            <ArrowRight className="w-3 h-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Quick Actions (Hover) */}
                                        <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                                            {!notif.isRead && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkAsRead(notif.id)}
                                                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                                    title="Đánh dấu đã đọc"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(notif.id)}
                                                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                                title="Xóa thông báo"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-2.5 px-3.5 border-t border-border/80 bg-muted/15 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Tự động nhắc nhở khảo sát & buổi họp
                        </span>
                        <span className="text-[10px] text-muted-foreground">IMP 2026</span>
                    </div>
                </div>
            )}
        </div>
    );
}

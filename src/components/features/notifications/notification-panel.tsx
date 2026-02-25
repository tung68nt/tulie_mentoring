"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { markAsRead, markAllAsRead } from "@/lib/actions/notification";
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

interface NotificationPanelProps {
    notifications: Notification[];
    unreadCount: number;
}

function timeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return new Date(date).toLocaleDateString("vi-VN");
}

const typeIcons: Record<string, string> = {
    meeting: "📅",
    mentorship: "🤝",
    goal: "🎯",
    feedback: "💬",
    system: "🔔",
};

export function NotificationPanel({ notifications, unreadCount }: NotificationPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [localNotifs, setLocalNotifs] = useState(notifications);
    const [localUnread, setLocalUnread] = useState(unreadCount);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalNotifs(notifications);
        setLocalUnread(unreadCount);
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
        setLocalNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setLocalUnread(prev => Math.max(0, prev - 1));
        startTransition(() => markAsRead(id));
    };

    const handleMarkAllAsRead = () => {
        setLocalNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
        setLocalUnread(0);
        startTransition(() => markAllAsRead());
    };

    return (
        <div ref={panelRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                aria-label="Thông báo"
            >
                <Bell className="w-[18px] h-[18px]" />
                {localUnread > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-1 bg-foreground text-background rounded-full text-[9px] font-bold flex items-center justify-center leading-none ring-2 ring-background">
                        {localUnread > 99 ? "99+" : localUnread}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[380px] bg-card border border-border rounded-lg shadow-none overflow-hidden z-[100] animate-scale-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <h3 className="text-sm font-semibold text-foreground">Thông báo</h3>
                        {localUnread > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={isPending}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                <CheckCheck className="w-3 h-3" />
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {localNotifs.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell className="w-8 h-8 text-border mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">Chưa có thông báo</p>
                            </div>
                        ) : (
                            localNotifs.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-muted transition-colors group",
                                        !notif.isRead && "bg-muted"
                                    )}
                                >
                                    {/* Type icon */}
                                    <span className="text-base mt-0.5 shrink-0">
                                        {typeIcons[notif.type] || "🔔"}
                                    </span>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className={cn(
                                                    "text-sm leading-snug truncate",
                                                    notif.isRead ? "text-muted-foreground" : "text-foreground font-medium"
                                                )}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {timeAgo(notif.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        {!notif.isRead && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notif.id);
                                                }}
                                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                                title="Đánh dấu đã đọc"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {notif.link && (
                                            <Link
                                                href={notif.link}
                                                onClick={() => {
                                                    if (!notif.isRead) handleMarkAsRead(notif.id);
                                                    setIsOpen(false);
                                                }}
                                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        )}
                                    </div>

                                    {/* Unread dot */}
                                    {!notif.isRead && (
                                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

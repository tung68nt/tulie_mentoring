"use client";

import { useState } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isToday
} from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Video, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Meeting {
    id: string;
    title: string;
    description: string | null;
    scheduledAt: Date;
    duration: number;
    status: string;
    type: string;
    location: string | null;
    meetingType: string;
    mentorship: {
        mentor: { firstName: string; lastName: string };
    };
}

interface CalendarViewProps {
    meetings: Meeting[];
}

type ViewMode = "month" | "week" | "list";

export function CalendarView({ meetings }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>("month");

    // Helper functions
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

    const renderHeader = () => {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-foreground capitalize min-w-[140px]">
                        {format(currentDate, "MMMM yyyy", { locale: vi })}
                    </h2>
                    <div className="flex items-center border border-border/60 rounded-md p-0.5 bg-muted">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-background"
                            onClick={viewMode === "month" ? prevMonth : prevWeek}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] font-semibold hover:bg-background"
                            onClick={() => setCurrentDate(new Date())}
                        >
                            Hôm nay
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-background"
                            onClick={viewMode === "month" ? nextMonth : nextWeek}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center border border-border/60 rounded-md p-0.5 bg-muted">
                    <Button
                        variant={viewMode === "month" ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                            "h-7 px-3 text-[10px] font-semibold transition-colors",
                            viewMode === "month" ? "bg-background text-foreground border-border/60" : "text-muted-foreground"
                        )}
                        onClick={() => setViewMode("month")}
                    >
                        Tháng
                    </Button>
                    <Button
                        variant={viewMode === "week" ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                            "h-7 px-3 text-[10px] font-semibold transition-colors",
                            viewMode === "week" ? "bg-background text-foreground border-border/60" : "text-muted-foreground"
                        )}
                        onClick={() => setViewMode("week")}
                    >
                        Tuần
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                            "h-7 px-3 text-[10px] font-semibold transition-colors",
                            viewMode === "list" ? "bg-background text-foreground border-border/60" : "text-muted-foreground"
                        )}
                        onClick={() => setViewMode("list")}
                    >
                        Danh sách
                    </Button>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
        const dayLabels = ["Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "CN"];

        return (
            <div className="border border-border rounded-lg overflow-hidden bg-card shadow-none">
                <div className="grid grid-cols-7 border-b border-border bg-muted">
                    {dayLabels.map(day => (
                        <div key={day} className="py-2.5 text-center text-[10px] font-semibold text-muted-foreground/60">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, i) => {
                        const dayMeetings = meetings.filter(m => isSameDay(new Date(m.scheduledAt), day));
                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "min-h-[100px] sm:min-h-[120px] p-2 border-b border-r border-border transition-colors hover:bg-muted/50",
                                    !isSameMonth(day, monthStart) && "bg-muted/30 text-muted-foreground",
                                    (i + 1) % 7 === 0 && "border-r-0"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={cn(
                                        "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                                        isToday(day) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {dayMeetings.map(meeting => (
                                        <Link
                                            key={meeting.id}
                                            href={`/meetings/${meeting.id}`}
                                            className="block px-2 py-1 bg-primary/5 hover:bg-primary/10 rounded-md text-[10px] font-medium text-foreground truncate border border-transparent transition-colors"
                                            title={meeting.title}
                                        >
                                            <span className="font-semibold mr-1">{format(new Date(meeting.scheduledAt), "HH:mm")}</span>
                                            {meeting.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

        return (
            <div className="border border-border/60 rounded-xl overflow-hidden bg-background shadow-none">
                <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30">
                    {days.map(day => (
                        <div key={day.toString()} className="py-3 text-center">
                            <p className="text-[10px] font-semibold text-muted-foreground/60 mb-2">
                                {format(day, "EEE", { locale: vi })}
                            </p>
                            <p className={cn(
                                "text-base font-bold w-7 h-7 flex items-center justify-center rounded-md mx-auto",
                                isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
                            )}>
                                {format(day, "d")}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 min-h-[400px]">
                    {days.map((day, i) => {
                        const dayMeetings = meetings.filter(m => isSameDay(new Date(m.scheduledAt), day));
                        return (
                            <div key={day.toString()} className={cn(
                                "p-3 border-r border-border transition-colors relative",
                                (i + 1) % 7 === 0 && "border-r-0"
                            )}>
                                <div className="space-y-2">
                                    {dayMeetings.map(meeting => (
                                        <Card key={meeting.id} padding="sm" className="bg-muted border border-border hover:border-foreground/20 transition-all relative">
                                            <p className="text-[10px] font-bold text-foreground leading-tight mb-1">{meeting.title}</p>
                                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium">
                                                <Clock className="w-2.5 h-2.5" />
                                                {format(new Date(meeting.scheduledAt), "HH:mm")}
                                            </div>
                                            <Link
                                                href={`/meetings/${meeting.id}`}
                                                className="absolute inset-0 opacity-0"
                                            >
                                                Xem
                                            </Link>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderListView = () => {
        if (meetings.length === 0) {
            return (
                <Card className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-6 border border-border">
                        <CalendarIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Không có sự kiện nào</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 text-sm font-medium">
                        Bạn chưa có buổi họp nào được lên lịch trong thời gian tới.
                    </p>
                </Card>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meetings.map((meeting) => (
                    <Card key={meeting.id} hover padding="none" className="flex flex-col group">
                        <div className="p-6 flex-1 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="w-11 h-11 rounded-lg bg-primary flex flex-col items-center justify-center text-primary-foreground shrink-0 shadow-none">
                                    <span className="text-[9px] font-semibold leading-none">{format(new Date(meeting.scheduledAt), "MMM", { locale: vi })}</span>
                                    <span className="text-base font-bold leading-none mt-1">{format(new Date(meeting.scheduledAt), "dd")}</span>
                                </div>
                                <Badge status={meeting.status} />
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-foreground line-clamp-1 leading-tight">{meeting.title}</h3>
                                {meeting.description && (
                                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{meeting.description}</p>
                                )}
                            </div>

                            <div className="space-y-2.5 pt-3 border-t border-border">
                                <div className="flex items-center gap-2.5 text-[11px] text-foreground font-medium">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>{format(new Date(meeting.scheduledAt), "HH:mm")} ({meeting.duration}m)</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[11px] text-foreground font-medium">
                                    {meeting.type === "online" ? (
                                        <Video className="w-3.5 h-3.5 text-muted-foreground" />
                                    ) : (
                                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                    )}
                                    <span className="truncate">{meeting.location || (meeting.type === "online" ? "Link trực tuyến" : "Chưa xác định")}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[11px] text-foreground font-medium">
                                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="truncate">Mentor: {meeting.mentorship.mentor.firstName} {meeting.mentorship.mentor.lastName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-muted border-t border-border flex items-center justify-between group-hover:bg-card transition-colors">
                            <span className="text-[10px] font-bold text-muted-foreground">{meeting.meetingType}</span>
                            <Button variant="ghost" size="sm" asChild className="h-8 text-[11px] font-bold">
                                <Link href={`/meetings/${meeting.id}`}>Chi tiết</Link>
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            {renderHeader()}
            {viewMode === "month" && renderMonthView()}
            {viewMode === "week" && renderWeekView()}
            {viewMode === "list" && renderListView()}
        </div>
    );
}

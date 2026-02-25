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
    eachDayOfInterval
} from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
}

interface TaskCalendarViewProps {
    initialTasks: Task[];
}

const PRIORITY_COLORS: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-success/10 text-success border-success/20",
};

export function TaskCalendarView({ initialTasks }: TaskCalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const getTasksForDay = (day: Date) => {
        return initialTasks.filter(task =>
            task.dueDate && isSameDay(new Date(task.dueDate), day)
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Calendar Header */}
            <div className="flex items-center justify-between bg-card p-5 rounded-xl border border-border/60 bg-background">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary/60">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold capitalize">
                            {format(currentMonth, 'MMMM yyyy', { locale: vi })}
                        </h2>
                        <p className="text-[11px] text-muted-foreground font-medium opacity-60">
                            Lịch trình công việc
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-md border-border/60 hover:bg-muted">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-md border-border/60 hover:bg-muted">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-card rounded-xl border border-border/60 overflow-hidden bg-background">
                <div className="grid grid-cols-7 border-b border-border/40">
                    {['2', '3', '4', '5', '6', '7', 'CN'].map((day) => (
                        <div key={day} className="py-3 text-center text-[10px] font-semibold text-muted-foreground/60 bg-muted/30">
                            Thứ {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                        const tasks = getTasksForDay(day);
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, monthStart);

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "min-h-[120px] p-2 border-r border-b border-border/30 transition-colors relative",
                                    !isCurrentMonth ? "bg-muted/5 opacity-30" : "bg-background hover:bg-muted/10",
                                    idx % 7 === 6 && "border-r-0"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className={cn(
                                        "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-md",
                                        isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground/60"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="space-y-1 overflow-y-auto max-h-[90px] scrollbar-hide">
                                    {tasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "px-2 py-1 rounded-md border text-[9px] font-medium truncate",
                                                PRIORITY_COLORS[task.priority] || "bg-secondary text-foreground"
                                            )}
                                            title={task.title}
                                        >
                                            {task.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

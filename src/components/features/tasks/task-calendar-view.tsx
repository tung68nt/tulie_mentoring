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
            <div className="flex items-center justify-between bg-card p-6 rounded-[2rem] border border-border/40 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold capitalize">
                            {format(currentMonth, 'MMMM yyyy', { locale: vi })}
                        </h2>
                        <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-0.5">
                            Lịch trình công việc
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl border-border/40 bg-background hover:bg-accent/50">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl border-border/40 bg-background hover:bg-accent/50">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-xl shadow-primary/5 overflow-hidden ring-1 ring-border/5">
                <div className="grid grid-cols-7 border-b border-border/40">
                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map((day) => (
                        <div key={day} className="py-4 text-center text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest bg-muted/20">
                            {day}
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
                                    "min-h-[140px] p-3 border-r border-b border-border/30 transition-colors relative",
                                    !isCurrentMonth ? "bg-muted/5 opacity-30" : "bg-background hover:bg-accent/10",
                                    idx % 7 === 6 && "border-r-0"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={cn(
                                        "text-[13px] font-bold w-7 h-7 flex items-center justify-center rounded-xl",
                                        isToday ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground/60"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="space-y-1.5 overflow-y-auto max-h-[100px] scrollbar-hide">
                                    {tasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "px-2 py-1.5 rounded-lg border text-[10px] font-semibold truncate transition-all hover:scale-[1.02]",
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

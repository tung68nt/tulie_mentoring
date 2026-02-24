"use client";

import { useState } from "react";
import {
    format,
    addDays,
    eachDayOfInterval,
    isSameDay,
    differenceInDays,
    startOfWeek
} from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    createdAt: string;
}

interface TaskGanttViewProps {
    initialTasks: Task[];
}

const STATUS_COLORS: Record<string, string> = {
    todo: "bg-muted border-muted-foreground/20",
    doing: "bg-primary/20 border-primary/30",
    review: "bg-warning/20 border-warning/30",
    done: "bg-success/20 border-success/30",
};

export function TaskGanttView({ initialTasks }: TaskGanttViewProps) {
    const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const daysToShow = 14;
    const endDate = addDays(startDate, daysToShow - 1);

    const timelineDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const nextPeriod = () => setStartDate(addDays(startDate, 7));
    const prevPeriod = () => setStartDate(addDays(startDate, -7));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Control Header */}
            <div className="flex items-center justify-between bg-card p-6 rounded-[2rem] border border-border/40 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                        <LayoutList className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Timeline Công việc</h2>
                        <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-0.5">
                            {format(startDate, 'dd/MM')} - {format(endDate, 'dd/MM/yyyy')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevPeriod} className="rounded-xl border-border/40 bg-background">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextPeriod} className="rounded-xl border-border/40 bg-background">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Gantt Table */}
            <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-xl shadow-primary/5 overflow-x-auto ring-1 ring-border/5">
                <div className="min-w-[1000px]">
                    {/* Timeline Headers */}
                    <div className="grid grid-cols-[300px_1fr] border-b border-border/40">
                        <div className="p-4 bg-muted/20 border-r border-border/40 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">Công việc</div>
                        <div className="grid grid-cols-14">
                            {timelineDays.map((day, i) => (
                                <div key={i} className={cn(
                                    "p-4 text-center border-r border-border/20 last:border-r-0",
                                    isSameDay(day, new Date()) ? "bg-primary/5" : ""
                                )}>
                                    <div className="text-[10px] font-bold text-muted-foreground/40 uppercase">{format(day, 'EEE', { locale: vi })}</div>
                                    <div className={cn(
                                        "text-[12px] font-bold mt-1",
                                        isSameDay(day, new Date()) ? "text-primary" : "text-muted-foreground/60"
                                    )}>{format(day, 'd')}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Rows */}
                    <div className="divide-y divide-border/20">
                        {initialTasks.map((task) => {
                            const taskStart = new Date(task.createdAt);
                            const taskEnd = task.dueDate ? new Date(task.dueDate) : taskStart;

                            // Calculate position relative to timeline
                            const offset = differenceInDays(taskStart, startDate);
                            const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1);

                            // Clamp to timeline range
                            const displayOffset = Math.max(0, offset);
                            const displayDuration = offset < 0
                                ? Math.max(0, duration + offset)
                                : duration;

                            const isVisible = displayOffset < daysToShow && (displayOffset + displayDuration) > 0;

                            return (isVisible && (
                                <div key={task.id} className="grid grid-cols-[300px_1fr] group hover:bg-muted/10 transition-colors">
                                    <div className="p-4 border-r border-border/40 flex flex-col gap-1 justify-center">
                                        <span className="text-[13.5px] font-semibold text-foreground truncate no-uppercase">{task.title}</span>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-4 px-2 opacity-60">
                                                {task.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-14 relative h-16 items-center px-0.5">
                                        {/* Day lines */}
                                        {timelineDays.map((_, i) => (
                                            <div key={i} className="absolute h-full border-r border-border/10 pointer-events-none" style={{ left: `${(i / daysToShow) * 100}%` }} />
                                        ))}

                                        {/* Task Bar */}
                                        <div
                                            className={cn(
                                                "h-8 rounded-full border shadow-sm relative z-10 mx-1 flex items-center px-4 overflow-hidden group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all",
                                                STATUS_COLORS[task.status] || "bg-secondary"
                                            )}
                                            style={{
                                                gridColumnStart: displayOffset + 1,
                                                gridColumnEnd: `span ${Math.min(displayDuration, daysToShow - displayOffset)}`
                                            }}
                                        >
                                            <span className="text-[10px] font-bold text-foreground/70 truncate uppercase tracking-tight">{task.title}</span>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })}
                        {initialTasks.length === 0 && (
                            <div className="p-20 text-center text-muted-foreground/30 font-medium italic">Không có công việc nào.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

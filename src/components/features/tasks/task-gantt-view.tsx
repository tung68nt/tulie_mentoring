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
    startDate?: string;
    createdAt: string;
    completedPercentage?: number;
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
            <div className="flex items-center justify-between bg-card p-5 rounded-xl border border-border/60 bg-background">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary/60">
                        <LayoutList className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Timeline công việc</h2>
                        <p className="text-[11px] text-muted-foreground font-medium opacity-60">
                            {format(startDate, 'dd/MM')} - {format(endDate, 'dd/MM/yyyy')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevPeriod} className="h-8 w-8 rounded-md border-border/60 hover:bg-muted">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextPeriod} className="h-8 w-8 rounded-md border-border/60 hover:bg-muted">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Gantt Table */}
            <div className="bg-card rounded-xl border border-border/60 overflow-hidden bg-background overflow-x-auto">
                <div className="min-w-[1000px]">
                    {/* Timeline Headers */}
                    <div className="grid grid-cols-[300px_1fr] border-b border-border/40">
                        <div className="p-3 bg-muted/20 border-r border-border/40 text-[10px] font-semibold text-muted-foreground/60">Công việc</div>
                        <div className="grid grid-cols-14">
                            {timelineDays.map((day, i) => (
                                <div key={i} className={cn(
                                    "p-3 text-center border-r border-border/20 last:border-r-0",
                                    isSameDay(day, new Date()) ? "bg-primary/5" : ""
                                )}>
                                    <div className="text-[9px] font-semibold text-muted-foreground/40">{format(day, 'EEE', { locale: vi })}</div>
                                    <div className={cn(
                                        "text-[11px] font-semibold mt-0.5",
                                        isSameDay(day, new Date()) ? "text-primary" : "text-muted-foreground/60"
                                    )}>{format(day, 'd')}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Rows */}
                    <div className="divide-y divide-border/20">
                        {initialTasks.map((task) => {
                            const taskStart = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
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
                                    <div className="p-3 border-r border-border/40 flex flex-col gap-0.5 justify-center">
                                        <span className="text-[13px] font-medium text-foreground truncate">{task.title}</span>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[9px] font-medium py-0 h-4 px-2 opacity-60 border-border/60">
                                                {task.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-14 relative h-12 items-center px-0.5">
                                        {/* Day lines */}
                                        {timelineDays.map((_, i) => (
                                            <div key={i} className="absolute h-full border-r border-border/10 pointer-events-none" style={{ left: `${(i / daysToShow) * 100}%` }} />
                                        ))}

                                        {/* Task Bar */}
                                        <div
                                            className={cn(
                                                "h-7 rounded-md border shadow-none relative z-10 mx-1 flex items-center overflow-hidden transition-all group/gantt hover:h-8 hover:-translate-y-0.5",
                                                STATUS_COLORS[task.status] || "bg-secondary"
                                            )}
                                            style={{
                                                gridColumnStart: displayOffset + 1,
                                                gridColumnEnd: `span ${Math.min(displayDuration, daysToShow - displayOffset)}`
                                            }}
                                        >
                                            {/* Progress Fill */}
                                            {task.completedPercentage !== undefined && task.completedPercentage > 0 && (
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-primary/20 transition-all border-r border-primary/20"
                                                    style={{ width: `${task.completedPercentage}%` }}
                                                />
                                            )}
                                            <div className="relative z-10 flex items-center justify-between w-full px-3">
                                                <span className="text-[10px] font-bold text-foreground truncate">{task.title}</span>
                                                {task.completedPercentage !== undefined && task.completedPercentage > 0 && (
                                                    <span className="text-[8px] font-black opacity-60 ml-2">{task.completedPercentage}%</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })}
                        {initialTasks.length === 0 && (
                            <div className="p-16 text-center text-muted-foreground/30 text-sm font-medium italic">Không có công việc nào.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

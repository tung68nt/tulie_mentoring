"use client";

import { cn } from "@/lib/utils";
import { format, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Flag, Trophy } from "lucide-react";

interface ProgramGridProps {
    startDate: string | Date;
    endDate: string | Date;
    submittedDates: string[];
    deadlines?: { date: string; title: string; type: "goal" | "program_end" }[];
    selectedDate?: Date;
    onCellClick?: (date: Date) => void;
    className?: string;
}

export function ProgramGrid({
    startDate,
    endDate,
    submittedDates,
    deadlines = [],
    selectedDate,
    onCellClick,
    className
}: ProgramGridProps) {
    const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    // Normalize dates to midnight UTC for comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const days = eachDayOfInterval({ start, end });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex flex-wrap gap-2">
                {days.map((day, idx) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isSubmitted = submittedDates.includes(dateStr);
                    const isToday = isSameDay(day, today);
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const isPast = day < today;

                    const dayDeadlines = deadlines.filter(d => d.date === dateStr);
                    const hasGoal = dayDeadlines.find(d => d.type === "goal");
                    const hasEnd = dayDeadlines.find(d => d.type === "program_end");

                    return (
                        <div
                            key={idx}
                            onClick={() => onCellClick?.(day)}
                            title={`${format(day, "EEEE, dd/MM/yyyy", { locale: vi })}${dayDeadlines.length > 0 ? ` - ${dayDeadlines.map(d => d.title).join(", ")}` : ""}`}
                            className={cn(
                                "relative w-9 h-9 rounded-lg transition-all duration-300 flex items-center justify-center group cursor-pointer isolate",
                                isSubmitted
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : isToday
                                        ? "border-2 border-foreground bg-foreground/5 shadow-md scale-110 z-10"
                                        : isPast
                                            ? "bg-muted/40 border border-border/40"
                                            : "border-2 border-dashed border-muted-foreground/30 bg-background/30", // Bolder dashed border
                                isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background z-20 scale-105"
                            )}
                        >
                            {/* Number label */}
                            <span className={cn(
                                "text-[10px] font-bold tabular-nums",
                                isSubmitted ? "text-primary-foreground" : isToday ? "text-foreground" : "text-muted-foreground/30"
                            )}>
                                {idx + 1}
                            </span>

                            {/* Icons (Flags) */}
                            {dayDeadlines.length > 0 && (
                                <div className="absolute -top-2 -right-1 flex gap-0.5 z-20">
                                    {hasGoal && (
                                        <div className="bg-orange-500 text-white p-0.5 rounded-full shadow-lg animate-bounce">
                                            <Flag className="w-2.5 h-2.5 fill-current" />
                                        </div>
                                    )}
                                    {hasEnd && (
                                        <div className="bg-red-500 text-white p-0.5 rounded-full shadow-lg">
                                            <Trophy className="w-2.5 h-2.5 fill-current" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Today label if today */}
                            {isToday && (
                                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-foreground uppercase tracking-tighter whitespace-nowrap">
                                    Hôm nay
                                </div>
                            )}

                            {/* Tooltip content on hover (custom implementation if needed, browser title is default) */}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-border/40">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-primary" />
                    <span className="text-[10px] text-muted-foreground font-medium no-uppercase">Đã hoàn thành</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm border-2 border-dashed border-muted-foreground/30" />
                    <span className="text-[10px] text-muted-foreground font-medium no-uppercase">Sắp tới</span>
                </div>
                <div className="flex items-center gap-2">
                    <Flag className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-[10px] text-muted-foreground font-medium no-uppercase">Deadline</span>
                </div>
            </div>
        </div>
    );
}

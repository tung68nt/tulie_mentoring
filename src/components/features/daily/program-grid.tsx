"use client";

import { cn } from "@/lib/utils";
import { format, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Flag, Trophy } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

    // Calculate stats
    const completedDays = submittedDates.length;
    const totalDays = days.length;
    const daysPassed = days.filter(d => d <= today).length;
    const completionRate = daysPassed > 0 ? Math.round((completedDays / daysPassed) * 100) : 0;

    return (
        <div className={cn("space-y-5", className)}>
            {/* Grid cells */}
            <div className="flex flex-wrap gap-[5px] p-1">
                <TooltipProvider delayDuration={100}>
                    {days.map((day, idx) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const isSubmitted = submittedDates.includes(dateStr);
                        const isToday = isSameDay(day, today);
                        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                        const isPast = day < today;
                        const isFuture = day > today;

                        const dayDeadlines = deadlines.filter(d => d.date === dateStr);
                        const hasGoal = dayDeadlines.find(d => d.type === "goal");
                        const hasEnd = dayDeadlines.find(d => d.type === "program_end");

                        const tooltipText = `${format(day, "EEEE, dd/MM/yyyy", { locale: vi })}${isSubmitted ? " · Đã hoàn thành" : isPast ? " · Bỏ lỡ" : ""}${dayDeadlines.length > 0 ? ` · ${dayDeadlines.map(d => d.title).join(", ")}` : ""}`;

                        // Determine cell color similar to heatmap style
                        const getCellStyle = () => {
                            if (isSubmitted) return "bg-emerald-400 dark:bg-emerald-500/80";
                            if (isToday) return "bg-muted ring-1 ring-ring ring-offset-1 ring-offset-background";
                            if (isPast) return "bg-muted/50";
                            return "bg-muted/30"; // future
                        };

                        return (
                            <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                    <div
                                        onClick={() => onCellClick?.(day)}
                                        className={cn(
                                            "relative w-3.5 h-3.5 rounded-[2px] transition-all duration-200 hover:scale-125 hover:z-30",
                                            onCellClick ? "cursor-pointer" : "cursor-help",
                                            getCellStyle(),
                                            isSelected && "ring-1.5 ring-primary ring-offset-1 ring-offset-background scale-[1.4] z-20",
                                            (hasGoal || hasEnd) && "ring-1 ring-offset-1 ring-offset-background",
                                            hasGoal && !hasEnd && "ring-orange-400",
                                            hasEnd && "ring-rose-400"
                                        )}
                                    />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-[10px] max-w-[200px] text-center">
                                    <p>{tooltipText}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>

            {/* Footer - matching ProgramMatrix style */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 dark:bg-emerald-500/80" />
                        <span>Đã hoàn thành</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-muted/50" />
                        <span>Bỏ lỡ</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-muted/30" />
                        <span>Sắp tới</span>
                    </div>
                    {deadlines.length > 0 && (
                        <>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-[2px] bg-muted/30 ring-1 ring-orange-400" />
                                <span>Deadline mục tiêu</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-[2px] bg-muted/30 ring-1 ring-rose-400" />
                                <span>Kết thúc chương trình</span>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4 text-[10px]">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{completedDays}/{totalDays} ngày</span>
                    </div>
                    {daysPassed > 0 && (
                        <span className="font-medium text-foreground tabular-nums">{completionRate}%</span>
                    )}
                </div>
            </div>
        </div>
    );
}

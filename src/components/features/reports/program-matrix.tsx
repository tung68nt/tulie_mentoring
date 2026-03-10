"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, eachDayOfInterval, parseISO, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";

interface ProgramMatrixProps {
    startDate: string;
    endDate: string;
    activityMap: Record<string, number>;
}

export function ProgramMatrix({ startDate, endDate, activityMap }: ProgramMatrixProps) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = eachDayOfInterval({ start, end });

    const getIntensity = (count: number) => {
        if (!count) return "bg-muted/30";
        if (count < 3) return "bg-purple-100 dark:bg-purple-900/30";
        if (count < 6) return "bg-purple-300 dark:bg-purple-700/50";
        if (count < 10) return "bg-purple-500 dark:bg-purple-500/70";
        return "bg-purple-700 dark:bg-purple-300/90";
    };

    return (
        <Card className="p-6 shadow-none border-border/60 bg-background/50 backdrop-blur-sm">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Ma trận hoạt động</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Theo dõi mức độ tương tác của bạn trong suốt chương trình.
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Ít</span>
                        <div className="flex gap-1">
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-muted/30" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-100 dark:bg-purple-900/30" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-300 dark:bg-purple-700/50" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-500 dark:bg-purple-500/70" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-700 dark:bg-purple-300/90" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">Nhiều</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {days.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const count = activityMap[dateStr] || 0;
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={dateStr}
                                title={`${format(day, "dd/MM/yyyy")}: ${count} hoạt động`}
                                className={cn(
                                    "w-3.5 h-3.5 rounded-[2px] transition-all duration-300 hover:scale-125 hover:z-10 cursor-help",
                                    getIntensity(count),
                                    isToday && "ring-1 ring-ring ring-offset-1 ring-offset-background"
                                )}
                            />
                        );
                    })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex gap-4 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>Bắt đầu: {format(start, "dd/MM/yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            <span>Kết thúc: {format(end, "dd/MM/yyyy")}</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-medium text-foreground">
                        Tổng số ngày: {days.length}
                    </p>
                </div>
            </div>
        </Card>
    );
}

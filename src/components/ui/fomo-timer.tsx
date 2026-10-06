"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

export function SystemClock() {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Don't render until mounted to avoid hydration mismatch
    if (!now) {
        return (
            <div className="flex items-center gap-4 px-4 py-2 bg-background/50 backdrop-blur-md border border-border/50 rounded-xl shadow-sm opacity-0">
                <div className="flex items-center gap-2 text-primary font-mono font-medium">
                    <Clock className="w-4 h-4" />
                    <span>00:00:00</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 px-4 py-2 bg-background/50 backdrop-blur-md border border-border/50 rounded-xl shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 text-primary font-mono font-medium">
                <Clock className="w-4 h-4" />
                <span>{now.toLocaleTimeString("vi-VN", { hour12: false })}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>{now.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
        </div>
    );
}

interface CountdownProps {
    targetDate: Date | string;
    label: string;
    subtitle?: string;
    className?: string;
    maxDays?: number;
    size?: "sm" | "md" | "lg";
}

export function Countdown({ targetDate, label, subtitle, className, maxDays = 90 }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{ d: number } | null>(null);

    useEffect(() => {
        const target = new Date(targetDate);

        const update = () => {
            const now = new Date();
            if (now >= target) {
                setTimeLeft({ d: 0 });
                return;
            }

            setTimeLeft({
                d: Math.max(0, differenceInDays(target, now))
            });
        };

        update();
        const timer = setInterval(update, 60000);
        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    const percent = Math.min(100, Math.max(2, (timeLeft.d / maxDays) * 100));
    const isUrgent = timeLeft.d < 3;

    // Color logic: Danger -> Warning -> Safe
    let bgClass = "bg-cyan-500";
    let textClass = "text-cyan-600 dark:text-cyan-400";
    let ringClass = "ring-cyan-500/20";

    if (timeLeft.d <= 3) {
        bgClass = "bg-rose-500";
        textClass = "text-rose-600 dark:text-rose-400";
        ringClass = "ring-rose-500/20";
    } else if (timeLeft.d <= 7) {
        bgClass = "bg-orange-500";
        textClass = "text-orange-600 dark:text-orange-400";
        ringClass = "ring-orange-500/20";
    } else if (timeLeft.d <= 14) {
        bgClass = "bg-amber-400";
        textClass = "text-amber-600 dark:text-amber-400";
        ringClass = "ring-amber-400/20";
    } else if (timeLeft.d <= 30) {
        bgClass = "bg-emerald-500";
        textClass = "text-emerald-600 dark:text-emerald-400";
        ringClass = "ring-emerald-500/20";
    }

    return (
        <div className={cn(
            "relative flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-border transition-all group",
            className
        )}>
            {/* Prominent Number Box */}
            <div className={cn(
                "flex flex-col items-center justify-center w-16 h-16 rounded-xl shrink-0 transition-colors",
                bgClass.replace("500", "500/10").replace("400", "400/10"), // auto-generate soft background based on main color
                textClass
            )}>
                <span className="text-2xl font-black leading-none mb-1 tracking-tight">{timeLeft.d}</span>
                <span className="text-[9px] uppercase font-bold opacity-80 tracking-wider">Ngày</span>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                {/* Headers */}
                <h4 className="text-sm font-semibold truncate text-foreground leading-snug">{label}</h4>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}

                {/* Progress & Target Date Row */}
                <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000 ease-out", bgClass)}
                            style={{ width: `${Math.max(2, percent)}%` }}
                        />
                    </div>
                    <span className="text-[10px] whitespace-nowrap text-muted-foreground/70 font-semibold tabular-nums tracking-wide">
                        {new Date(targetDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                </div>
            </div>
            
            {/* Urgent Warning Icon */}
            {isUrgent && (
                <div className="absolute top-3 right-3">
                    <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                </div>
            )}
        </div>
    );
}

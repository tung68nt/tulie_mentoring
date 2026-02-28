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
    className?: string;
    maxDays?: number;
}

export function Countdown({ targetDate, label, className, maxDays = 90 }: CountdownProps) {
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

    const percent = Math.min(100, Math.max(0, (timeLeft.d / maxDays) * 100));
    const isUrgent = timeLeft.d < 3;

    // Color logic: Danger -> Warning -> Safe
    let bgClass = "bg-cyan-500";
    let textClass = "text-cyan-600 dark:text-cyan-400";

    if (timeLeft.d <= 3) {
        bgClass = "bg-rose-500";
        textClass = "text-rose-600 dark:text-rose-400";
    } else if (timeLeft.d <= 7) {
        bgClass = "bg-orange-500";
        textClass = "text-orange-600 dark:text-orange-400";
    } else if (timeLeft.d <= 14) {
        bgClass = "bg-amber-400";
        textClass = "text-amber-600 dark:text-amber-400";
    } else if (timeLeft.d <= 30) {
        bgClass = "bg-emerald-500";
        textClass = "text-emerald-600 dark:text-emerald-400";
    }

    return (
        <div className={cn("flex items-center gap-3 w-full py-1.5", className)}>
            <div className="w-1/3 min-w-[120px] max-w-[200px] text-[11px] font-medium text-foreground truncate no-uppercase">
                {label}
            </div>
            <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-in-out", bgClass)}
                    style={{ width: `${percent}%` }}
                />
            </div>
            <div className={cn("w-10 flex items-center justify-end gap-1.5 font-mono text-xs font-bold", textClass)}>
                {timeLeft.d}d
                {isUrgent && <AlertCircle className="w-3 h-3 shrink-0 animate-pulse text-rose-500" />}
            </div>
        </div>
    );
}


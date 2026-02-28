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
    variant?: "default" | "warning" | "danger";
}

export function Countdown({ targetDate, label, className, variant = "default" }: CountdownProps) {
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

    const isUrgent = timeLeft.d < 3;
    const finalVariant = isUrgent ? "warning" : variant;

    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300",
            finalVariant === "default" && "bg-background border-border/60",
            finalVariant === "warning" && "bg-amber-50/80 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-800/30",
            finalVariant === "danger" && "bg-destructive/5 border-destructive/20",
            className
        )}>
            <div className={cn(
                "flex items-center justify-center min-w-[36px] h-[28px] px-2 rounded-lg font-mono font-bold text-sm tabular-nums",
                finalVariant === "default" && "bg-primary/10 text-primary",
                finalVariant === "warning" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                finalVariant === "danger" && "bg-destructive/10 text-destructive"
            )}>
                {timeLeft.d}d
            </div>
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-muted-foreground font-medium truncate no-uppercase">{label}</span>
                {isUrgent && <AlertCircle className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-500" />}
            </div>
        </div>
    );
}


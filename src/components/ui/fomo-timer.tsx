"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";

export function SystemClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-4 px-4 py-2 bg-background/50 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
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
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

    useEffect(() => {
        const target = new Date(targetDate);

        const update = () => {
            const now = new Date();
            if (now >= target) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
                return;
            }

            setTimeLeft({
                d: Math.max(0, differenceInDays(target, now)),
                h: Math.max(0, differenceInHours(target, now) % 24),
                m: Math.max(0, differenceInMinutes(target, now) % 60),
                s: Math.max(0, differenceInSeconds(target, now) % 60)
            });
        };

        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    const isUrgent = timeLeft.d < 3;
    const finalVariant = isUrgent ? "warning" : variant;

    return (
        <div className={cn(
            "p-4 rounded-xl border transition-all duration-300",
            finalVariant === "default" && "bg-background border-border",
            finalVariant === "warning" && "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400",
            finalVariant === "danger" && "bg-destructive/5 border-destructive/20 text-destructive",
            className
        )}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</span>
                {isUrgent && <AlertCircle className="w-4 h-4 animate-pulse text-amber-500" />}
            </div>

            <div className="flex items-center gap-2">
                <TimeUnit value={timeLeft.d} label="Ngày" />
                <span className="text-lg font-bold opacity-30">:</span>
                <TimeUnit value={timeLeft.h} label="Giờ" />
                <span className="text-lg font-bold opacity-30">:</span>
                <TimeUnit value={timeLeft.m} label="Phút" />
                <span className="text-lg font-bold opacity-30">:</span>
                <TimeUnit value={timeLeft.s} label="Giây" />
            </div>
        </div>
    );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center min-w-[3rem]">
            <span className="text-2xl font-bold font-mono tracking-tighter">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase font-medium opacity-50">{label}</span>
        </div>
    );
}

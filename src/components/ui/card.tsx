import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, hover = false, padding = "md" }: CardProps) {
    const paddings = {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
    };

    return (
        <div
            className={cn(
                "bg-white rounded-[8px] border border-[#eaeaea]",
                hover && "transition-all duration-200 hover:border-[#000] hover:shadow-[0_5px_10px_rgba(0,0,0,0.12)] cursor-pointer",
                paddings[padding],
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between mb-4", className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3 className={cn("text-lg font-semibold text-black", className)}>
            {children}
        </h3>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    trend?: { value: number; label: string };
    accentColor?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, accentColor }: StatCardProps) {
    return (
        <Card className="relative overflow-hidden group">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-[#666]">{title}</p>
                    <p className="text-2xl font-bold text-black tracking-tight">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-[#888]">{subtitle}</p>
                    )}
                    {trend && (
                        <p className={cn(
                            "text-xs font-semibold",
                            trend.value >= 0 ? "text-[#0070f3]" : "text-[#ee0000]"
                        )}>
                            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="p-2 rounded-[6px] bg-[#fafafa] text-[#666] group-hover:text-black border border-transparent group-hover:border-[#eaeaea] transition-all">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}

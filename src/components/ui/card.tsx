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
                "bg-white rounded-[6px] border border-[#eaeaea] transition-all duration-200",
                hover && "hover:border-[#999] hover:shadow-sm cursor-pointer",
                paddings[padding],
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("flex flex-col space-y-1.5 mb-6", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
    return <h3 className={cn("text-base font-semibold leading-none tracking-tight text-black", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
    return <p className={cn("text-sm text-[#666]", className)}>{children}</p>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("", className)}>{children}</div>;
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    trend?: { value: number; label: string };
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
    return (
        <Card className="relative overflow-hidden group stat-card-accent" hover>
            <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                    <p className="text-[12px] font-medium text-[#666] tracking-tight">{title}</p>
                    <p className="text-2xl font-bold text-black tracking-tighter">{value}</p>
                    {subtitle && <p className="text-[11px] text-[#999]">{subtitle}</p>}
                    {trend && (
                        <p className={cn("text-[11px] font-medium mt-1", trend.value >= 0 ? "text-black" : "text-[#666]")}>
                            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="p-2 rounded-md bg-[#fafafa] text-[#999] group-hover:text-black group-hover:bg-black/5 border border-[#eaeaea] transition-all">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}

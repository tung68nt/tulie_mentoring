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
                "bg-white rounded-[12px] border border-[#eaeaea] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)]",
                hover && "hover:border-black/10 hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] cursor-pointer",
                paddings[padding],
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("flex flex-col space-y-2 mb-6", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
    return <h3 className={cn("text-[17px] font-semibold leading-none tracking-tight text-black", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
    return <p className={cn("text-sm text-[#888] font-medium", className)}>{children}</p>;
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
        <Card className="relative overflow-hidden group border-none bg-[#fafafa] hover:bg-white" hover padding="sm">
            <div className="flex items-start justify-between p-2">
                <div className="space-y-2">
                    <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest">{title}</p>
                    <p className="text-3xl font-bold text-black tracking-tightest leading-none">{value}</p>
                    {subtitle && <p className="text-[11px] text-[#999] font-medium">{subtitle}</p>}
                    {trend && (
                        <p className={cn("text-[11px] font-bold mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/5", trend.value >= 0 ? "text-black" : "text-[#666]")}>
                            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="p-2.5 rounded-xl bg-white text-[#999] group-hover:text-black shadow-sm group-hover:shadow-md transition-all border border-[#eee]">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}

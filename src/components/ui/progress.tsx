import { cn } from "@/lib/utils";

interface ProgressProps {
    value: number;
    max?: number;
    size?: "xs" | "sm" | "md" | "lg";
    color?: "default" | "success" | "warning" | "error" | "accent";
    showValue?: boolean;
    className?: string;
}

export function Progress({
    value,
    max = 100,
    size = "md",
    color = "default",
    showValue = false,
    className,
}: ProgressProps) {
    const percentage = Math.min(Math.round((value / max) * 100), 100);

    const sizes = {
        xs: "h-1",
        sm: "h-1.5",
        md: "h-2",
        lg: "h-3",
    };

    const colors = {
        default: "bg-black",
        success: "bg-black",
        warning: "bg-[#666]",
        error: "bg-[#999]",
        accent: "bg-[#333]",
    };

    return (
        <div className={cn("w-full space-y-2", className)}>
            <div className={cn("w-full bg-[#f0f0f0] rounded-full overflow-hidden border border-[#eaeaea]", sizes[size])}>
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]",
                        colors[color]
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showValue && (
                <div className="flex justify-between items-center px-0.5">
                    <span className="text-[10px] font-bold text-[#999] uppercase tracking-wider">{percentage}% complete</span>
                    <span className="text-[10px] font-bold text-black">{value}/{max}</span>
                </div>
            )}
        </div>
    );
}

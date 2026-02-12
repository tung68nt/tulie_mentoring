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
        <div className={cn("w-full space-y-1.5", className)}>
            <div className={cn("w-full bg-[#eaeaea] rounded-full overflow-hidden", sizes[size])}>
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        colors[color]
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showValue && (
                <div className="flex justify-end">
                    <span className="text-[12px] font-medium text-[#666]">{percentage}%</span>
                </div>
            )}
        </div>
    );
}

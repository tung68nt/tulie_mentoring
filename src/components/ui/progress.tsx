import { cn } from "@/lib/utils";

interface ProgressProps {
    value: number;
    max?: number;
    size?: "xs" | "sm" | "md" | "lg";
    color?: string;
    showValue?: boolean;
    className?: string;
}

export function Progress({
    value,
    max = 100,
    size = "md",
    color = "bg-black",
    showValue = false,
    className,
}: ProgressProps) {
    const percentage = Math.min(Math.round((value / max) * 100), 100);

    const sizes = {
        xs: "h-0.5",
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
    };

    return (
        <div className={cn("w-full space-y-1.5", className)}>
            <div className={cn("w-full bg-[#eaeaea] rounded-full overflow-hidden", sizes[size])}>
                <div
                    className={cn("h-full transition-all duration-500 ease-out", color)}
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

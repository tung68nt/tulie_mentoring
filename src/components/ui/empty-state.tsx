import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
            {icon && (
                <div className="w-12 h-12 rounded-full bg-[#fafafa] border border-[#eaeaea] flex items-center justify-center mb-4 text-[#999]">
                    {icon}
                </div>
            )}
            <h3 className="text-sm font-medium text-black mb-1">{title}</h3>
            {description && <p className="text-xs text-[#999] max-w-[280px]">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
    src?: string | null;
    firstName: string;
    lastName: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    status?: "online" | "offline" | "away";
    className?: string;
}

export function Avatar({ src, firstName, lastName, size = "md", status, className }: AvatarProps) {
    const sizes = {
        xs: "w-6 h-6 text-[10px]",
        sm: "w-8 h-8 text-[12px]",
        md: "w-10 h-10 text-[14px]",
        lg: "w-12 h-12 text-[16px]",
        xl: "w-16 h-16 text-[20px]",
    };

    const statusSizes = {
        xs: "w-2 h-2",
        sm: "w-2.5 h-2.5",
        md: "w-3 h-3",
        lg: "w-3.5 h-3.5",
        xl: "w-4 h-4",
    };

    const statusColors = {
        online: "bg-[#0070f3]",
        offline: "bg-[#eaeaea]",
        away: "bg-[#f5a623]",
    };

    return (
        <div className={cn("relative inline-flex shrink-0 rounded-full", className)}>
            {src ? (
                <img
                    src={src}
                    alt={`${firstName} ${lastName}`}
                    className={cn(
                        "rounded-full object-cover border border-[#eaeaea]",
                        sizes[size]
                    )}
                />
            ) : (
                <div
                    className={cn(
                        "rounded-full flex items-center justify-center font-medium bg-[#fafafa] text-[#666] border border-[#eaeaea]",
                        sizes[size]
                    )}
                >
                    {getInitials(firstName, lastName)}
                </div>
            )}
            {status && (
                <span
                    className={cn(
                        "absolute bottom-0 right-0 rounded-full border-2 border-white",
                        statusSizes[size],
                        statusColors[status]
                    )}
                />
            )}
        </div>
    );
}

interface AvatarGroupProps {
    users: Array<{ firstName: string; lastName: string; avatar?: string | null }>;
    max?: number;
    size?: "sm" | "md" | "lg";
}

export function AvatarGroup({ users, max = 4, size = "md" }: AvatarGroupProps) {
    const visible = users.slice(0, max);
    const remaining = users.length - max;

    return (
        <div className="flex -space-x-2">
            {visible.map((user, i) => (
                <Avatar
                    key={i}
                    src={user.avatar}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    size={size}
                />
            ))}
            {remaining > 0 && (
                <div
                    className={cn(
                        "rounded-full flex items-center justify-center font-medium bg-[#fafafa] text-[#666] border border-[#eaeaea]",
                        size === "sm" ? "w-8 h-8 text-[10px]" : size === "lg" ? "w-12 h-12 text-[14px]" : "w-10 h-10 text-[12px]"
                    )}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}

"use client";

import { useTransition } from "react";
import { startImpersonation } from "@/lib/actions/impersonation";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImpersonateButtonProps {
    targetUserId: string;
    targetName: string;
    compact?: boolean;
    variant?: "outline" | "ghost" | "default";
    className?: string;
}

export function ImpersonateButton({
    targetUserId,
    targetName,
    compact = false,
    variant = "outline",
    className = "",
}: ImpersonateButtonProps) {
    const [isPending, startTransition] = useTransition();

    function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        startTransition(async () => {
            try {
                const res = await startImpersonation(targetUserId);
                toast.success(`Đang đăng nhập với vai trò ${targetName}`);
                window.location.href = res.redirectUrl || "/";
            } catch (e: any) {
                toast.error(e.message || "Không thể đóng vai");
            }
        });
    }

    return (
        <Button
            variant={variant}
            size="sm"
            onClick={handleClick}
            disabled={isPending}
            title={`Đóng vai ${targetName}`}
            className={`gap-1.5 text-xs rounded-lg border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 hover:border-amber-500/50 ${
                compact ? "h-7 px-2" : "h-8 px-3"
            } ${className}`}
        >
            {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            ) : (
                <Eye className="w-3.5 h-3.5" />
            )}
            {!compact && (isPending ? "Đang vào..." : "Đóng vai")}
        </Button>
    );
}

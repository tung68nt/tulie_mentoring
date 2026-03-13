"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { startImpersonation } from "@/lib/actions/impersonation";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { toast } from "sonner";

interface ImpersonateButtonProps {
    targetUserId: string;
    targetName: string;
}

export function ImpersonateButton({ targetUserId, targetName }: ImpersonateButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function handleClick() {
        startTransition(async () => {
            try {
                await startImpersonation(targetUserId);
                toast.success(`Đang đóng vai ${targetName}`);
                router.push("/");
                router.refresh();
            } catch (e: any) {
                toast.error(e.message || "Không thể đóng vai");
            }
        });
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isPending}
            className="gap-1.5 text-xs rounded-lg border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 hover:border-amber-500/50"
        >
            <Eye className="w-3.5 h-3.5" />
            {isPending ? "Đang chuyển..." : "Đóng vai"}
        </Button>
    );
}

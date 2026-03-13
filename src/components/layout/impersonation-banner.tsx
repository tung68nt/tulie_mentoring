"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { stopImpersonation } from "@/lib/actions/impersonation";
import { Eye, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImpersonationBannerProps {
    targetUser: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        role: string;
    };
    realAdmin: {
        firstName: string;
        lastName: string;
    };
}

const roleLabels: Record<string, string> = {
    admin: "Admin",
    program_manager: "Quản lý chương trình",
    manager: "Manager",
    facilitator: "Facilitator",
    mentor: "Mentor",
    mentee: "Mentee",
};

export function ImpersonationBanner({ targetUser, realAdmin }: ImpersonationBannerProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function handleStop() {
        startTransition(async () => {
            await stopImpersonation();
            router.refresh();
        });
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/95 backdrop-blur-sm border-b border-amber-600/30 shadow-sm">
            <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Eye className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white leading-none truncate">
                            Đang xem dưới góc nhìn của{" "}
                            <span className="font-bold">
                                {targetUser.firstName} {targetUser.lastName}
                            </span>
                            <span className="text-white/70 font-normal ml-1.5">
                                ({roleLabels[targetUser.role] || targetUser.role})
                            </span>
                        </p>
                        <p className="text-[10px] text-white/60 mt-0.5 leading-none">
                            Đăng nhập thật: {realAdmin.firstName} {realAdmin.lastName}
                        </p>
                    </div>
                </div>

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleStop}
                    disabled={isPending}
                    className="h-7 px-3 rounded-md bg-white/20 hover:bg-white/30 text-white border-none shadow-none text-xs font-semibold gap-1.5 shrink-0"
                >
                    <X className="w-3.5 h-3.5" />
                    {isPending ? "Đang thoát..." : "Thoát đóng vai"}
                </Button>
            </div>
        </div>
    );
}

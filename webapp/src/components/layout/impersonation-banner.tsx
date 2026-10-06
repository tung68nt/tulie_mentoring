"use client";

import { useState, useTransition } from "react";
import { stopImpersonation } from "@/lib/actions/impersonation";
import { ArrowLeft, Users, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { QuickUserSwitcherModal } from "@/components/features/admin/quick-user-switcher-modal";

interface ImpersonationBannerProps {
    targetUser: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email?: string | null;
        role: string;
    };
    realAdmin: {
        id?: string;
        firstName: string;
        lastName: string;
        email?: string;
    };
}

const roleLabels: Record<string, string> = {
    admin: "Quản trị viên",
    program_manager: "Quản lý CT",
    manager: "Manager",
    facilitator: "Facilitator",
    mentor: "Mentor",
    mentee: "Mentee",
};

export function ImpersonationBanner({ targetUser, realAdmin }: ImpersonationBannerProps) {
    const [isPending, startTransition] = useTransition();
    const [switcherOpen, setSwitcherOpen] = useState(false);

    function handleStop() {
        startTransition(async () => {
            try {
                await stopImpersonation();
                toast.success("Đã quay trở lại tài khoản Master Admin");
                window.location.href = "/admin/users";
            } catch (err: any) {
                toast.error(err.message || "Không thể thoát đóng vai");
            }
        });
    }

    return (
        <>
            {/* Dynamic Island / Sleek Floating Capsule Bar */}
            <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-[100] max-w-[95vw] sm:max-w-max animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-auto">
                <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-neutral-900/90 dark:bg-neutral-950/90 text-white backdrop-blur-xl border border-white/15 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.4)]">
                    {/* Live Indicator */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span className="text-[11px] font-medium text-neutral-400 hidden md:inline">
                            Đang đóng vai
                        </span>
                    </div>

                    {/* Target User Info */}
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate max-w-[140px] sm:max-w-[220px]">
                            {targetUser.firstName} {targetUser.lastName}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                            {roleLabels[targetUser.role] || targetUser.role}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="h-3.5 w-px bg-white/20 shrink-0 hidden sm:block" />

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        {/* Switch user button */}
                        <button
                            type="button"
                            onClick={() => setSwitcherOpen(true)}
                            disabled={isPending}
                            title={`Tài khoản gốc: ${realAdmin.firstName} ${realAdmin.lastName} • Nhấn để đổi user khác`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                            <Users className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="hidden sm:inline">Đổi vai</span>
                        </button>

                        {/* Back to Master Admin */}
                        <button
                            type="button"
                            onClick={handleStop}
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-100 hover:shadow-xs active:scale-95 transition-all disabled:opacity-50 shrink-0"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-900" />
                                    <span>Đang về...</span>
                                </>
                            ) : (
                                <>
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Về Admin</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Switcher Modal */}
            <QuickUserSwitcherModal
                isOpen={switcherOpen}
                onClose={() => setSwitcherOpen(false)}
                currentImpersonatedId={targetUser.id}
            />
        </>
    );
}

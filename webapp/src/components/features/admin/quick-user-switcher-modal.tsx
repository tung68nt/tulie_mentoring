"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Search, UserCheck, ShieldCheck, ArrowRight, Loader2, Sparkles, X } from "lucide-react";
import { getUsersForSwitcher, startImpersonation } from "@/lib/actions/impersonation";
import { toast } from "sonner";

interface QuickUserSwitcherModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentImpersonatedId?: string | null;
}

const roleBadges: Record<string, { label: string; className: string }> = {
    admin: { label: "Admin", className: "bg-red-500/10 text-red-600 border-red-500/20" },
    program_manager: { label: "Quản lý CT", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    manager: { label: "Manager", className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
    facilitator: { label: "Facilitator", className: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
    mentor: { label: "Mentor", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    mentee: { label: "Mentee", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
};

export function QuickUserSwitcherModal({
    isOpen,
    onClose,
    currentImpersonatedId,
}: QuickUserSwitcherModalProps) {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<string>("all");
    const [users, setUsers] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [switchingUserId, setSwitchingUserId] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        setIsFetching(true);

        const timer = setTimeout(async () => {
            try {
                const data = await getUsersForSwitcher(search, activeTab);
                if (isMounted) {
                    setUsers(data);
                }
            } catch (err: any) {
                console.error("Failed to load users for switcher:", err);
            } finally {
                if (isMounted) setIsFetching(false);
            }
        }, 200);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [isOpen, search, activeTab]);

    const handleSwitch = (user: any) => {
        setSwitchingUserId(user.id);
        startTransition(async () => {
            try {
                const res = await startImpersonation(user.id);
                toast.success(`Đã chuyển sang góc nhìn của ${user.firstName} ${user.lastName}`);
                // Chuyển trang mượt mà bằng full navigation để reset hoàn toàn session state
                window.location.href = res.redirectUrl || "/";
            } catch (err: any) {
                toast.error(err.message || "Không thể chuyển tài khoản");
                setSwitchingUserId(null);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-0 overflow-hidden border-border bg-card shadow-2xl">
                {/* Header */}
                <div className="p-5 pb-3 border-b border-border bg-muted/20">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                Master Admin Tool
                            </span>
                        </div>
                        <DialogTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
                            <span>Chuyển đổi tài khoản (Đóng vai)</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Đăng nhập trực tiếp vào bất kỳ tài khoản nào để xem và thao tác. Bạn có thể quay lại Master Admin bất cứ lúc nào.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Search Bar */}
                    <div className="relative mt-3.5">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo tên, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-9 h-9 text-sm bg-background border-border"
                            autoFocus
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
                        {[
                            { id: "all", label: "Tất cả" },
                            { id: "mentee", label: "Mentees" },
                            { id: "mentor", label: "Mentors" },
                            { id: "facilitator", label: "Facilitators" },
                            { id: "manager", label: "Managers" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                    activeTab === tab.id
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* User List Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-[300px] max-h-[460px]">
                    {isFetching ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs">Đang tìm kiếm tài khoản...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground text-xs space-y-1">
                            <p className="font-medium text-foreground">Không tìm thấy tài khoản phù hợp</p>
                            <p>Hãy thử tìm kiếm bằng từ khóa hoặc email khác</p>
                        </div>
                    ) : (
                        users.map((u) => {
                            const isCurrent = currentImpersonatedId === u.id;
                            const isSwitching = switchingUserId === u.id;
                            const roleMeta = roleBadges[u.role] || {
                                label: u.role,
                                className: "bg-muted text-muted-foreground",
                            };

                            return (
                                <div
                                    key={u.id}
                                    onClick={() => !isCurrent && !isSwitching && handleSwitch(u)}
                                    className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                                        isCurrent
                                            ? "border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20"
                                            : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative shrink-0">
                                            <Avatar
                                                firstName={u.firstName || undefined}
                                                lastName={u.lastName || undefined}
                                                src={u.avatar || u.image || undefined}
                                                size="md"
                                                className="border border-border/80"
                                            />
                                            {u.menteeProfile?.isOnboardingComplete && (
                                                <span
                                                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]"
                                                    title="Đã hoàn thành khảo sát đầu vào"
                                                >
                                                    ✓
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                    {u.firstName} {u.lastName}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] px-1.5 py-0 h-4 font-medium border ${roleMeta.className}`}
                                                >
                                                    {roleMeta.label}
                                                </Badge>
                                                {u.menteeProfile?.personalityType && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[9px] px-1.5 py-0 h-4 bg-muted text-muted-foreground"
                                                    >
                                                        DISC: {u.menteeProfile.personalityType}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                                <span className="truncate">{u.email}</span>
                                                {u.menteeProfile?.major && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate">{u.menteeProfile.major}</span>
                                                    </>
                                                )}
                                                {u.mentorProfile?.company && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate">{u.mentorProfile.company}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="shrink-0 ml-3">
                                        {isCurrent ? (
                                            <Badge className="bg-amber-500 text-white text-[11px] px-2 py-0.5 font-medium">
                                                Đang đóng vai
                                            </Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={isSwitching}
                                                className="h-8 px-2.5 text-xs text-muted-foreground group-hover:text-foreground group-hover:bg-primary/10 gap-1 rounded-md"
                                            >
                                                {isSwitching ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                                        <span>Đang vào...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="hidden sm:inline">Đăng nhập vai này</span>
                                                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 px-5 border-t border-border bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Chế độ an toàn: Session gốc Master Admin luôn được bảo lưu
                    </span>
                    <Button variant="outline" size="sm" onClick={onClose} className="h-7 text-xs">
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

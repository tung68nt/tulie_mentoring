"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { approveMinutes, rejectMinutes } from "@/lib/actions/minutes";
import { useRouter } from "next/navigation";
import {
    FileText,
    ChevronDown,
    ChevronUp,
    ThumbsUp,
    RotateCcw,
    CheckCircle2,
    AlertTriangle,
    ClipboardList,
    MessageSquare,
} from "lucide-react";

interface MeetingMinutesData {
    id: string;
    title: string;
    description: string | null;
    scheduledAt: string;
    status: string;
    sessionNumber: number | null;
    mentorship: {
        id: string;
        mentor: { firstName: string; lastName: string };
    } | null;
    minutes: {
        id: string;
        status: string;
        keyPoints: string | null;
        agenda: string | null;
        actionItems: string | null;
        outcome: string | null;
        submittedAt: string | null;
        approvedAt: string | null;
        author: { firstName: string; lastName: string } | null;
    }[];
}

const minuteStatusConfig: Record<string, { label: string; color: string; dotColor: string }> = {
    approved: { label: "Đã duyệt", color: "bg-emerald-500/10 text-emerald-600", dotColor: "bg-emerald-500" },
    submitted: { label: "Đã nộp", color: "bg-blue-500/10 text-blue-600", dotColor: "bg-blue-500" },
    draft: { label: "Nháp", color: "bg-amber-500/10 text-amber-600", dotColor: "bg-amber-500" },
    none: { label: "Chưa có", color: "bg-rose-500/10 text-rose-600", dotColor: "bg-rose-500" },
};

const outcomeLabel: Record<string, string> = {
    productive: "Hiệu quả",
    average: "Bình thường",
    needs_improvement: "Cần cải thiện",
};

export function MinutesManager({ meetings }: { meetings: MeetingMinutesData[] }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [actionTarget, setActionTarget] = useState<string | null>(null);
    const router = useRouter();

    const handleAction = (minutesId: string, action: (id: string) => Promise<any>) => {
        setActionTarget(minutesId);
        startTransition(async () => {
            try {
                await action(minutesId);
                router.refresh();
            } catch (error: any) {
                alert(error.message || "Có lỗi xảy ra");
            } finally {
                setActionTarget(null);
            }
        });
    };

    const toggle = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    const pendingCount = meetings.filter(m => {
        const latest = m.minutes?.[m.minutes.length - 1];
        return latest && (latest.status === "submitted" || latest.status === "draft");
    }).length;

    const missingCount = meetings.filter(m => !m.minutes?.length && !["completed", "cancelled"].includes(m.status)).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Quản lý biên bản
                </h3>
                <div className="flex items-center gap-3">
                    {pendingCount > 0 && (
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            {pendingCount} cần duyệt
                        </span>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {Object.entries(minuteStatusConfig).map(([key, cfg]) => (
                            <span key={key} className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                                {cfg.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {meetings.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                    Chưa có cuộc họp nào.
                </div>
            ) : (
                <div className="border border-border/40 rounded-xl overflow-hidden bg-card">
                    <div className="divide-y divide-border/30">
                        {meetings.map((meeting) => {
                            const hasMinutes = meeting.minutes?.length > 0;
                            const latest = hasMinutes ? meeting.minutes[meeting.minutes.length - 1] : null;
                            const mStatus = latest?.status || "none";
                            const cfg = minuteStatusConfig[mStatus] || minuteStatusConfig.none;
                            const isExpanded = expandedId === meeting.id;
                            const canAction = latest && (mStatus === "draft" || mStatus === "submitted");
                            const isThisActioning = actionTarget === latest?.id;

                            return (
                                <div key={meeting.id}>
                                    {/* Row header */}
                                    <button
                                        onClick={() => hasMinutes && toggle(meeting.id)}
                                        className={`w-full grid grid-cols-[1fr_120px_100px_100px_32px] md:grid-cols-[1fr_140px_110px_110px_36px] gap-0 px-4 py-3 items-center text-left transition-colors ${
                                            hasMinutes ? "hover:bg-muted/30 cursor-pointer" : "cursor-default opacity-70"
                                        } ${isExpanded ? "bg-muted/20" : ""}`}
                                        disabled={!hasMinutes}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-semibold text-foreground truncate">
                                                {meeting.sessionNumber && !meeting.title.startsWith("Buổi") ? `Buổi ${meeting.sessionNumber}: ` : ""}
                                                {meeting.title}
                                            </p>
                                        </div>
                                        <div className="text-[12px] text-muted-foreground font-medium">
                                            {formatDate(meeting.scheduledAt, "dd/MM/yyyy")}
                                        </div>
                                        <div>
                                            <Badge status={meeting.status} size="sm" />
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <div className="flex justify-center">
                                            {hasMinutes && (
                                                isExpanded
                                                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded content */}
                                    {isExpanded && latest && (
                                        <div className="px-4 pb-4 border-t border-border/20 bg-muted/10 animate-fade-in">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
                                                {/* Left: Meeting description */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                                        <h4 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Nội dung buổi họp</h4>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-background border border-border/40 text-sm text-foreground leading-relaxed min-h-[80px]">
                                                        {meeting.description || <span className="text-muted-foreground italic">Không có mô tả</span>}
                                                    </div>
                                                </div>

                                                {/* Right: Minutes content */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <ClipboardList className="w-4 h-4 text-muted-foreground" />
                                                        <h4 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Biên bản</h4>
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                                                            <span className={`w-1 h-1 rounded-full ${cfg.dotColor}`} />
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-background border border-border/40 space-y-3">
                                                        {latest.keyPoints && (
                                                            <div>
                                                                <p className="text-[11px] font-semibold text-muted-foreground mb-1">Nội dung chính</p>
                                                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{latest.keyPoints}</p>
                                                            </div>
                                                        )}
                                                        {latest.agenda && (
                                                            <div>
                                                                <p className="text-[11px] font-semibold text-muted-foreground mb-1">Agenda</p>
                                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{latest.agenda}</p>
                                                            </div>
                                                        )}
                                                        {latest.actionItems && (
                                                            <div>
                                                                <p className="text-[11px] font-semibold text-muted-foreground mb-1">Action items</p>
                                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{latest.actionItems}</p>
                                                            </div>
                                                        )}
                                                        <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                                                            <span className="text-[10px] text-muted-foreground">
                                                                Đánh giá: <strong>{outcomeLabel[latest.outcome || ""] || latest.outcome || "—"}</strong>
                                                            </span>
                                                            {latest.author && (
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    bởi {latest.author.firstName} {latest.author.lastName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            {canAction && (
                                                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/30">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAction(latest.id, approveMinutes)}
                                                        disabled={isPending}
                                                        className="gap-1.5"
                                                    >
                                                        <ThumbsUp className="w-3.5 h-3.5" />
                                                        {isThisActioning ? "Đang duyệt..." : "Duyệt biên bản"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleAction(latest.id, rejectMinutes)}
                                                        disabled={isPending}
                                                        className="gap-1.5"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        {isThisActioning ? "..." : "Yêu cầu bổ sung"}
                                                    </Button>
                                                    {mStatus === "draft" && (
                                                        <span className="text-[10px] text-amber-600 font-medium ml-auto">
                                                            📝 Mentee chưa nộp — bạn vẫn có thể duyệt trực tiếp
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {mStatus === "approved" && (
                                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/30 text-[11px] text-emerald-600 font-medium">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Đã duyệt{latest.approvedAt ? ` lúc ${formatDate(latest.approvedAt, "HH:mm dd/MM/yyyy")}` : ""}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {missingCount > 0 && (
                        <div className="px-4 py-2.5 bg-amber-500/5 border-t border-amber-500/20 flex items-center gap-2 text-[12px] text-amber-600 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {missingCount} cuộc họp chưa có biên bản
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

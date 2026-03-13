"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MinutesForm } from "./minutes-form";
import { FileText, CheckCircle2, Send, ThumbsUp, RotateCcw } from "lucide-react";
import { submitMinutes, approveMinutes, rejectMinutes } from "@/lib/actions/minutes";
import { useRouter } from "next/navigation";

interface MinutesSectionProps {
    meetingId: string;
    minutes: any;
    isMentor: boolean;
}

const statusConfig: Record<string, { label: string; color: string; dotColor: string }> = {
    draft: { label: "Nháp", color: "bg-amber-500/10 text-amber-600", dotColor: "bg-amber-500" },
    submitted: { label: "Đã nộp", color: "bg-blue-500/10 text-blue-600", dotColor: "bg-blue-500" },
    approved: { label: "Đã duyệt", color: "bg-emerald-500/10 text-emerald-600", dotColor: "bg-emerald-500" },
};

export function MinutesSection({ meetingId, minutes: initialMinutes, isMentor }: MinutesSectionProps) {
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleAction = (action: (id: string) => Promise<any>) => {
        if (!initialMinutes?.id) return;
        startTransition(async () => {
            try {
                await action(initialMinutes.id);
                router.refresh();
            } catch (error: any) {
                alert(error.message || "Có lỗi xảy ra");
            }
        });
    };

    if (initialMinutes) {
        const outcomeLabel: Record<string, string> = {
            productive: "Hiệu quả",
            average: "Bình thường",
            needs_improvement: "Cần cải thiện",
        };

        const status = initialMinutes.status || "draft";
        const { label: statusLabel, color: statusColor, dotColor } = statusConfig[status] || statusConfig.draft;

        return (
            <Card className="border border-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <h4 className="text-[11px] font-semibold text-muted-foreground">Biên bản cuộc họp</h4>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        {statusLabel}
                    </span>
                </div>
                <div className="space-y-4">
                    {initialMinutes.keyPoints && (
                        <div className="space-y-1">
                            <p className="text-[11px] font-medium text-muted-foreground">Nội dung chính</p>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{initialMinutes.keyPoints}</p>
                        </div>
                    )}
                    {initialMinutes.agenda && (
                        <div className="space-y-1">
                            <p className="text-[11px] font-medium text-muted-foreground">Agenda</p>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{initialMinutes.agenda}</p>
                        </div>
                    )}
                    {initialMinutes.actionItems && (
                        <div className="space-y-1">
                            <p className="text-[11px] font-medium text-muted-foreground">Action items</p>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{initialMinutes.actionItems}</p>
                        </div>
                    )}
                    <div className="pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                            Đánh giá: {outcomeLabel[initialMinutes.outcome] || initialMinutes.outcome}
                        </span>
                        {initialMinutes.author && (
                            <span className="text-[10px] text-muted-foreground">
                                bởi {initialMinutes.author.firstName} {initialMinutes.author.lastName}
                            </span>
                        )}
                    </div>

                    {/* Action buttons based on role and status */}
                    {status === "draft" && !isMentor && (
                        <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleAction(submitMinutes)}
                            disabled={isPending}
                        >
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            {isPending ? "Đang nộp..." : "Nộp biên bản để duyệt"}
                        </Button>
                    )}

                    {status === "draft" && isMentor && (
                        <p className="text-[11px] text-amber-600 font-medium text-center py-1">
                            ⏳ Chờ mentee nộp biên bản để duyệt
                        </p>
                    )}

                    {status === "submitted" && isMentor && (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => handleAction(approveMinutes)}
                                disabled={isPending}
                            >
                                <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                                {isPending ? "..." : "Duyệt"}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleAction(rejectMinutes)}
                                disabled={isPending}
                            >
                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                {isPending ? "..." : "Trả lại"}
                            </Button>
                        </div>
                    )}

                    {status === "submitted" && !isMentor && (
                        <p className="text-[11px] text-blue-600 font-medium text-center py-1">
                            ⏳ Đang chờ Mentor duyệt
                        </p>
                    )}
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-muted border-dashed border-2 border-border">
            <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-[11px] font-semibold text-muted-foreground">Biên bản cuộc họp</h4>
            </div>

            {showForm ? (
                <MinutesForm meetingId={meetingId} onSuccess={() => setShowForm(false)} />
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Buổi họp này chưa có biên bản. Bạn có thể tạo biên bản ngay bây giờ.
                    </p>
                    <Button className="w-full" variant="outline" size="sm" onClick={() => setShowForm(true)}>
                        Tạo biên bản
                    </Button>
                </div>
            )}
        </Card>
    );
}

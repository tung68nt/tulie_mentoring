"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MinutesForm } from "./minutes-form";
import { FileText, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface MinutesSectionProps {
    meetingId: string;
    minutes: any;
    isMentor: boolean;
}

export function MinutesSection({ meetingId, minutes: initialMinutes, isMentor }: MinutesSectionProps) {
    const [showForm, setShowForm] = useState(false);

    if (initialMinutes) {
        const outcomeLabel: Record<string, string> = {
            productive: "Hiệu quả",
            average: "Bình thường",
            needs_improvement: "Cần cải thiện",
        };

        return (
            <Card className="border border-[#eaeaea]">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-[#0070f3]" />
                    <h4 className="text-[11px] font-semibold text-[#999]">Biên bản cuộc họp</h4>
                </div>
                <div className="space-y-4">
                    {initialMinutes.keyPoints && (
                        <div className="space-y-1">
                            <p className="text-[11px] font-medium text-[#999]">Nội dung chính</p>
                            <p className="text-sm text-black leading-relaxed">{initialMinutes.keyPoints}</p>
                        </div>
                    )}
                    {initialMinutes.agenda && (
                        <div className="space-y-1">
                            <p className="text-[11px] font-medium text-[#999]">Agenda</p>
                            <p className="text-sm text-[#666] leading-relaxed">{initialMinutes.agenda}</p>
                        </div>
                    )}
                    {initialMinutes.actionItems && (
                        <div className="space-y-1">
                            <p className="text-[11px] font-medium text-[#999]">Action items</p>
                            <p className="text-sm text-[#666] leading-relaxed">{initialMinutes.actionItems}</p>
                        </div>
                    )}
                    <div className="pt-3 border-t border-[#eaeaea] flex items-center justify-between">
                        <span className="text-[10px] text-[#999]">
                            Đánh giá: {outcomeLabel[initialMinutes.outcome] || initialMinutes.outcome}
                        </span>
                        {initialMinutes.author && (
                            <span className="text-[10px] text-[#999]">
                                bởi {initialMinutes.author.firstName} {initialMinutes.author.lastName}
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-[#fafafa] border-dashed border-2 border-[#eaeaea]">
            <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-[#999]" />
                <h4 className="text-[11px] font-semibold text-[#999]">Biên bản cuộc họp</h4>
            </div>

            {showForm ? (
                <MinutesForm meetingId={meetingId} onSuccess={() => setShowForm(false)} />
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-[#666] leading-relaxed italic">
                        Buổi họp này chưa có biên bản. {isMentor ? "Bạn có thể tạo biên bản ngay bây giờ." : "Đang chờ Mentor cập nhật biên bản."}
                    </p>
                    {isMentor && (
                        <Button className="w-full" variant="outline" size="sm" onClick={() => setShowForm(true)}>
                            Tạo biên bản
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
}

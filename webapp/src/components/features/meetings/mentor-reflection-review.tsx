"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
    Sparkles,
    CheckCircle2,
    Clock,
    Star,
    MessageSquare,
    Send,
    Loader2,
    ChevronDown,
    ChevronUp,
    Target
} from "lucide-react";
import { mentorReviewReflection } from "@/lib/actions/reflection";
import { useRouter } from "next/navigation";

interface MentorReflectionReviewProps {
    meetingId: string;
    groupData: {
        meetingTitle: string;
        totalMentees: number;
        submittedCount: number;
        items: {
            mentee: {
                id: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
                email: string | null;
            };
            isSubmitted: boolean;
            reflection: {
                id: string;
                keyLearnings?: string | null;
                actionCommitment?: string | null;
                blockers?: string | null;
                rating?: number | null;
                content?: string | null;
                mentorFeedback?: string | null;
                mentorConfirmed?: boolean;
                submittedAt?: string | Date | null;
            } | null;
        }[];
    } | null;
}

export function MentorReflectionReview({
    meetingId,
    groupData
}: MentorReflectionReviewProps) {
    const router = useRouter();
    const [expandedMenteeId, setExpandedMenteeId] = useState<string | null>(null);
    const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
    const [submittingId, setSubmittingId] = useState<string | null>(null);

    if (!groupData) return null;

    const { totalMentees, submittedCount, items } = groupData;
    const progressPercent = totalMentees > 0 ? Math.round((submittedCount / totalMentees) * 100) : 0;

    const handleSendFeedback = async (reflectionId: string) => {
        const feedback = feedbackInputs[reflectionId] || "";
        setSubmittingId(reflectionId);
        try {
            await mentorReviewReflection(reflectionId, feedback);
            router.refresh();
        } catch (err) {
            console.error("Failed to send mentor feedback:", err);
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <Card className="p-6 border-border space-y-5 bg-card shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-foreground">Bản thu hoạch của nhóm mentee</h3>
                        <p className="text-xs text-muted-foreground">
                            Theo dõi mức độ tiếp thu và cam kết hành động của từng bạn trong nhóm
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs font-semibold text-foreground">{submittedCount}/{totalMentees} đã nộp</p>
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-primary transition-all duration-300 rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Chưa có mentee nào trong nhóm này.</p>
                ) : (
                    items.map(({ mentee, isSubmitted, reflection }) => {
                        const isExpanded = expandedMenteeId === mentee.id;
                        return (
                            <div
                                key={mentee.id}
                                className="rounded-xl border border-border bg-muted/20 overflow-hidden transition-all"
                            >
                                <div
                                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-colors"
                                    onClick={() => setExpandedMenteeId(isExpanded ? null : mentee.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            firstName={mentee.firstName || undefined}
                                            lastName={mentee.lastName || undefined}
                                            src={mentee.avatar || undefined}
                                            size="sm"
                                        />
                                        <div>
                                            <p className="text-xs font-semibold text-foreground">
                                                {mentee.firstName} {mentee.lastName}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">{mentee.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {isSubmitted ? (
                                            <div className="flex items-center gap-1.5">
                                                {reflection?.mentorConfirmed ? (
                                                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                                                        Đã duyệt
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                        Mới nộp
                                                    </span>
                                                )}
                                                {reflection?.rating && (
                                                    <span className="flex items-center text-[10px] text-amber-500 font-semibold">
                                                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                                                        {reflection.rating}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                Chưa nộp
                                            </span>
                                        )}
                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="p-4 pt-1 bg-card border-t border-border space-y-3 text-xs animate-in fade-in-50 duration-150">
                                        {isSubmitted && reflection ? (
                                            <>
                                                <div className="space-y-1 bg-muted/30 p-2.5 rounded-lg">
                                                    <p className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                                                        <Sparkles className="w-3 h-3 text-primary" />
                                                        Bài học tâm đắc nhất:
                                                    </p>
                                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                                        {reflection.keyLearnings || reflection.content}
                                                    </p>
                                                </div>

                                                <div className="space-y-1 bg-primary/5 p-2.5 rounded-lg border border-primary/10">
                                                    <p className="font-semibold text-primary flex items-center gap-1 text-[11px]">
                                                        <Target className="w-3 h-3" />
                                                        Cam kết hành động trước buổi sau:
                                                    </p>
                                                    <p className="text-foreground whitespace-pre-wrap">
                                                        {reflection.actionCommitment || "Chưa có cam kết cụ thể."}
                                                    </p>
                                                </div>

                                                {reflection.blockers && (
                                                    <div className="space-y-1 bg-muted/20 p-2.5 rounded-lg">
                                                        <p className="font-semibold text-amber-600 flex items-center gap-1 text-[11px]">
                                                            Khó khăn / Thắc mắc:
                                                        </p>
                                                        <p className="text-muted-foreground whitespace-pre-wrap">
                                                            {reflection.blockers}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Mentor Quick Feedback */}
                                                <div className="pt-2 border-t border-border space-y-2">
                                                    <div className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                                                        <MessageSquare className="w-3 h-3 text-primary" />
                                                        <span>Phản hồi / Góp ý nhanh của Mentor:</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            defaultValue={reflection.mentorFeedback || ""}
                                                            placeholder="Viết nhận xét ngắn hoặc lời động viên..."
                                                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-input bg-transparent text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                                                            onChange={(e) => {
                                                                setFeedbackInputs({
                                                                    ...feedbackInputs,
                                                                    [reflection.id]: e.target.value,
                                                                });
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            disabled={submittingId === reflection.id}
                                                            onClick={() => handleSendFeedback(reflection.id)}
                                                            className="text-xs shrink-0"
                                                        >
                                                            {submittingId === reflection.id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Send className="w-3 h-3 mr-1" />
                                                                    Duyệt & Gửi
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic py-2">
                                                Mentee này chưa gửi bản thu hoạch cho buổi họp.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );
}

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles,
    CheckCircle2,
    Star,
    Send,
    Edit3,
    MessageSquare,
    Loader2,
    Target,
    HelpCircle
} from "lucide-react";
import { upsertReflection } from "@/lib/actions/reflection";
import { useRouter } from "next/navigation";

interface MenteeReflectionFormProps {
    meetingId: string;
    existingReflection?: {
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
}

export function MenteeReflectionForm({
    meetingId,
    existingReflection
}: MenteeReflectionFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(!existingReflection);
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState<number>(existingReflection?.rating || 5);
    const [keyLearnings, setKeyLearnings] = useState(existingReflection?.keyLearnings || existingReflection?.content || "");
    const [actionCommitment, setActionCommitment] = useState(existingReflection?.actionCommitment || "");
    const [blockers, setBlockers] = useState(existingReflection?.blockers || "");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyLearnings.trim()) {
            setError("Vui lòng chia sẻ bài học hoặc điều tâm đắc nhất của bạn");
            return;
        }
        if (!actionCommitment.trim()) {
            setError("Vui lòng nêu ít nhất 1 cam kết hành động trước buổi tiếp theo");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await upsertReflection(meetingId, {
                keyLearnings,
                actionCommitment,
                blockers,
                rating,
            });
            setIsEditing(false);
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Lỗi khi lưu bản thu hoạch");
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing && existingReflection) {
        return (
            <Card className="p-6 border-border space-y-5 bg-card shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Bản thu hoạch của bạn</h3>
                            <p className="text-[11px] text-muted-foreground">
                                Đã nộp {existingReflection.submittedAt ? new Date(existingReflection.submittedAt).toLocaleDateString("vi-VN") : "sau buổi họp"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {existingReflection.mentorConfirmed ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50 text-xs">
                                Mentor đã duyệt
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                Chờ Mentor phản hồi
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="text-xs h-7 px-2"
                        >
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            Sửa
                        </Button>
                    </div>
                </div>

                {/* Rating display */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Đánh giá buổi họp:</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }, (_, i) => (
                            <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < (existingReflection.rating || 5) ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                    <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            Bài học & Điều tâm đắc nhất:
                        </p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{existingReflection.keyLearnings || existingReflection.content}</p>
                    </div>

                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-1">
                        <p className="font-semibold text-primary flex items-center gap-1">
                            <Target className="w-3.5 h-3.5" />
                            Cam kết hành động trước buổi sau:
                        </p>
                        <p className="text-foreground whitespace-pre-wrap">{existingReflection.actionCommitment || "Chưa ghi nhận cam kết."}</p>
                    </div>

                    {existingReflection.blockers && (
                        <div className="p-3 bg-muted/20 rounded-lg space-y-1">
                            <p className="font-semibold text-foreground flex items-center gap-1">
                                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                                Khó khăn / Cần Mentor giải đáp thêm:
                            </p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{existingReflection.blockers}</p>
                        </div>
                    )}
                </div>

                {/* Mentor Feedback */}
                {existingReflection.mentorFeedback && (
                    <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/40 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Lời nhận xét từ Mentor:
                        </div>
                        <p className="text-xs text-foreground/90 whitespace-pre-wrap">
                            {existingReflection.mentorFeedback}
                        </p>
                    </div>
                )}
            </Card>
        );
    }

    return (
        <Card className="p-6 border-border space-y-5 bg-card shadow-sm">
            <div className="pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Bản thu hoạch cá nhân sau buổi họp</h3>
                        <p className="text-[11px] text-muted-foreground">
                            Đúc kết nhanh trong 3 phút để ghi nhớ kiến thức và cam kết hành động thực tế
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Bạn đánh giá buổi họp hôm nay thế nào?</label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                            >
                                <Star
                                    className={`w-5 h-5 ${
                                        star <= rating
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-muted hover:text-amber-200"
                                    }`}
                                />
                            </button>
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">({rating}/5 sao)</span>
                    </div>
                </div>

                {/* Key learnings */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                        Bài học hoặc điều bạn tâm đắc nhất trong buổi họp này *
                    </label>
                    <textarea
                        rows={3}
                        value={keyLearnings}
                        onChange={(e) => setKeyLearnings(e.target.value)}
                        placeholder="Ví dụ: Hiểu rõ hơn về cách chia module, nhận ra lỗi sai trong cách viết test, học được tư duy từ bạn..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-transparent text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Action commitment */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                        Cam kết hành động cụ thể trước buổi họp sau *
                    </label>
                    <textarea
                        rows={2}
                        value={actionCommitment}
                        onChange={(e) => setActionCommitment(e.target.value)}
                        placeholder="Ví dụ: Hoàn thiện refactor 2 component, đọc xong tài liệu Docker, nộp bài tập trước thứ 5..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-transparent text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Blockers */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                        Khó khăn đang gặp hoặc câu hỏi cần Mentor hỗ trợ thêm (nếu có)
                    </label>
                    <textarea
                        rows={2}
                        value={blockers}
                        onChange={(e) => setBlockers(e.target.value)}
                        placeholder="Bất kỳ điều gì bạn còn băn khoăn muốn hỏi riêng..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-transparent text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                    />
                </div>

                {error && (
                    <p className="text-xs text-destructive">{error}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                    {existingReflection && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(false)}
                            className="text-xs"
                        >
                            Hủy chỉnh sửa
                        </Button>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        disabled={loading}
                        className="ml-auto text-xs bg-primary text-primary-foreground font-medium"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                Đang nộp bài...
                            </>
                        ) : (
                            <>
                                <Send className="w-3.5 h-3.5 mr-1.5" />
                                Nộp bản thu hoạch
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

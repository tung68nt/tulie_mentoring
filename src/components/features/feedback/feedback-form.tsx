"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedbackSchema, type FeedbackInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { submitFeedback } from "@/lib/actions/feedback";
import { Star } from "lucide-react";

interface FeedbackFormProps {
    mentorshipId: string;
    toUserId: string;
    onSuccess?: () => void;
}

export function FeedbackForm({ mentorshipId, toUserId, onSuccess }: FeedbackFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [rating, setRating] = useState(5);
    const [error, setError] = useState<string | null>(null);

    const [communication, setCommunication] = useState(5);
    const [engagement, setEngagement] = useState(5);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FeedbackInput>({
        resolver: zodResolver(feedbackSchema) as any,
        defaultValues: {
            mentorshipId,
            toUserId,
            type: "session",
            rating: 5,
            communication: 5,
            engagement: 5,
        },
    });

    const onSubmit = async (data: FeedbackInput) => {
        setIsLoading(true);
        setError(null);

        try {
            await submitFeedback({
                ...data,
                rating,
                communication,
                engagement
            });
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi khi gửi đánh giá");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-8 rounded-xl border border-border/60 bg-background shadow-none">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/10">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <label className="block text-[12px] font-semibold text-foreground">Đánh giá chung</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => {
                                    setRating(s);
                                    setValue("rating", s);
                                }}
                                className={`p-2 rounded-lg border transition-all ${rating >= s
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "bg-background border-border text-muted-foreground"
                                    }`}
                            >
                                <Star className={`w-5 h-5 ${rating >= s ? "fill-current" : ""}`} />
                            </button>
                        ))}
                    </div>
                </div>


                <div className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[13px] font-semibold text-foreground">Khả năng giao tiếp / Truyền đạt</label>
                            <span className="text-xs font-bold text-primary">{communication}/5</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Mức độ rõ ràng, dễ hiểu và cởi mở trong trao đổi.</p>
                        <div className="flex gap-1.5 h-9">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                        setCommunication(s);
                                        setValue("communication", s);
                                    }}
                                    className={`flex-1 flex items-center justify-center rounded-md border text-xs font-semibold transition-all ${communication >= s
                                        ? "bg-primary/10 border-primary/30 text-primary"
                                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[13px] font-semibold text-foreground">Mức độ tương tác & Sẵn sàng</label>
                            <span className="text-xs font-bold text-primary">{engagement}/5</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Độ nhiệt tình, trả lời tin nhắn kịp thời và hỗ trợ.</p>
                        <div className="flex gap-1.5 h-9">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                        setEngagement(s);
                                        setValue("engagement", s);
                                    }}
                                    className={`flex-1 flex items-center justify-center rounded-md border text-xs font-semibold transition-all ${engagement >= s
                                        ? "bg-primary/10 border-primary/30 text-primary"
                                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 pt-2">
                    <label className="block text-[12px] font-medium text-muted-foreground">Nhận xét chi tiết</label>
                    <textarea
                        {...register("content")}
                        className="w-full min-h-[120px] p-3 rounded-lg border border-border/60 bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm text-foreground transition-all hover:border-border placeholder:text-muted-foreground"
                        placeholder="Chia sẻ suy nghĩ của bạn..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[12px] font-medium text-muted-foreground">Điểm mạnh</label>
                        <textarea
                            {...register("strengths")}
                            className="w-full p-2.5 text-xs border border-border/60 rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
                            placeholder="Ghi nhận..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[12px] font-medium text-muted-foreground">Cần cải thiện</label>
                        <textarea
                            {...register("improvements")}
                            className="w-full p-2.5 text-xs border border-border/60 rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
                            placeholder="Góp ý..."
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Gửi đánh giá
                </Button>
            </form>
        </Card >
    );
}

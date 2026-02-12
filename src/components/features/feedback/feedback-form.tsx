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
            await submitFeedback({ ...data, rating });
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi khi gửi đánh giá");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-900">Đánh giá chung</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => {
                                    setRating(s);
                                    setValue("rating", s);
                                }}
                                className={`p-2 rounded-xl border transition-all ${rating >= s
                                    ? "bg-gray-900 border-gray-900 text-yellow-400 shadow-md"
                                    : "bg-white border-gray-100 text-gray-300"
                                    }`}
                            >
                                <Star className={`w-6 h-6 ${rating >= s ? "fill-current" : ""}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Khả năng giao tiếp"
                        options={[1, 2, 3, 4, 5].map(v => ({ value: v.toString(), label: `${v}/5 Sao` }))}
                        {...register("communication", { valueAsNumber: true })}
                    />
                    <Select
                        label="Mức độ tương tác"
                        options={[1, 2, 3, 4, 5].map(v => ({ value: v.toString(), label: `${v}/5 Sao` }))}
                        {...register("engagement", { valueAsNumber: true })}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Nhận xét chi tiết</label>
                    <textarea
                        {...register("content")}
                        className="w-full min-h-[120px] p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:outline-none text-sm transition-all"
                        placeholder="Chia sẻ suy nghĩ của bạn..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-400">Điểm mạnh</label>
                        <textarea
                            {...register("strengths")}
                            className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                            placeholder="Ghi nhận..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-400">Cần cải thiện</label>
                        <textarea
                            {...register("improvements")}
                            className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                            placeholder="Góp ý..."
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Gửi đánh giá
                </Button>
            </form>
        </Card>
    );
}

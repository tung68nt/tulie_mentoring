"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { minutesSchema, type MinutesInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useState } from "react";
import { createMinutes } from "@/lib/actions/minutes";
import { useRouter } from "next/navigation";

interface MinutesFormProps {
    meetingId: string;
    onSuccess?: () => void;
}

export function MinutesForm({ meetingId, onSuccess }: MinutesFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<MinutesInput>({
        resolver: zodResolver(minutesSchema) as any,
        defaultValues: {
            meetingId,
            outcome: "productive",
        },
    });

    const onSubmit = async (data: MinutesInput) => {
        setIsLoading(true);
        setError(null);

        try {
            await createMinutes(data);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi khi tạo biên bản");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
            {error && (
                <div className="p-3 text-sm text-[#ee0000] bg-[#ee0000]/5 rounded-[6px] border border-[#ee0000]/10">
                    {error}
                </div>
            )}

            <input type="hidden" {...register("meetingId")} />

            <div className="space-y-1.5">
                <label className="block text-[12px] font-medium text-[#666]">Nội dung chính *</label>
                <textarea
                    {...register("keyPoints")}
                    className="w-full min-h-[100px] p-3 rounded-[8px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999]"
                    placeholder="Những điểm chính đã thảo luận trong buổi họp..."
                />
                {errors.keyPoints && (
                    <p className="text-[12px] text-[#ee0000] font-medium">{errors.keyPoints.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <label className="block text-[12px] font-medium text-[#666]">Agenda / Chương trình</label>
                <textarea
                    {...register("agenda")}
                    className="w-full min-h-[60px] p-3 rounded-[8px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999]"
                    placeholder="Các mục đã được bàn..."
                    rows={2}
                />
            </div>

            <div className="space-y-1.5">
                <label className="block text-[12px] font-medium text-[#666]">Action items</label>
                <textarea
                    {...register("actionItems")}
                    className="w-full min-h-[60px] p-3 rounded-[8px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999]"
                    placeholder="Các công việc cần thực hiện sau buổi họp..."
                    rows={2}
                />
            </div>

            <Select
                label="Đánh giá buổi họp"
                options={[
                    { value: "productive", label: "Hiệu quả" },
                    { value: "average", label: "Bình thường" },
                    { value: "needs_improvement", label: "Cần cải thiện" },
                ]}
                {...register("outcome")}
                error={errors.outcome?.message}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
                Lưu biên bản
            </Button>
        </form>
    );
}

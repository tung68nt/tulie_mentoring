"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema, type GoalInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { createGoal } from "@/lib/actions/goal";

interface GoalFormProps {
    mentorshipId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function GoalForm({ mentorshipId, onSuccess, onCancel }: GoalFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<GoalInput>({
        resolver: zodResolver(goalSchema) as any,
        defaultValues: {
            mentorshipId,
            category: "skill",
            targetValue: 100,
            currentValue: 0,
            priority: "medium",
        },
    });

    const onSubmit = async (data: GoalInput) => {
        setIsLoading(true);
        setError(null);

        try {
            await createGoal(data);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi khi tạo mục tiêu");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <div className="p-2 text-sm text-[#ee0000] bg-[#ee0000]/5 rounded-[6px] border border-[#ee0000]/10">
                        {error}
                    </div>
                )}

                <Input
                    label="Tiêu đề mục tiêu (SMART)"
                    placeholder="Hoàn thành chứng chỉ IELTS 7.0"
                    {...register("title")}
                    error={errors.title?.message}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Phân loại"
                        options={[
                            { value: "skill", label: "Kỹ năng (Skill)" },
                            { value: "knowledge", label: "Kiến thức (Knowledge)" },
                            { value: "network", label: "Mối quan hệ (Network)" },
                            { value: "project", label: "Dự án (Project)" },
                            { value: "career", label: "Sự nghiệp (Career)" },
                        ]}
                        {...register("category")}
                        error={errors.category?.message}
                    />
                    <Select
                        label="Độ ưu tiên"
                        options={[
                            { value: "low", label: "Thấp" },
                            { value: "medium", label: "Trung bình" },
                            { value: "high", label: "Cao" },
                        ]}
                        {...register("priority")}
                        error={errors.priority?.message}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Giá trị mục tiêu (%)"
                        type="number"
                        {...register("targetValue", { valueAsNumber: true })}
                        error={errors.targetValue?.message}
                    />
                    <Input
                        label="Hạn chót"
                        type="date"
                        {...register("dueDate", { valueAsDate: true })}
                        error={errors.dueDate?.message}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[12px] font-medium text-[#666]">Mô tả chi tiết</label>
                    <textarea
                        {...register("description")}
                        className="w-full min-h-[80px] p-3 rounded-[8px] border border-[#eaeaea] text-sm text-black focus:ring-4 focus:ring-black/5 focus:border-black focus:outline-none transition-all duration-200 hover:border-[#999] placeholder:text-[#999]"
                    />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        className="flex-1"
                        onClick={onCancel}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" className="flex-1" isLoading={isLoading}>
                        Tạo mục tiêu
                    </Button>
                </div>
            </form>
        </Card>
    );
}

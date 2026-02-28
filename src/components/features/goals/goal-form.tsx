"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema, type GoalInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { createGoal } from "@/lib/actions/goal";
import { Plus, Trash2, ListChecks } from "lucide-react";

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
        control,
        formState: { errors },
    } = useForm<GoalInput>({
        resolver: zodResolver(goalSchema) as any,
        defaultValues: {
            mentorshipId,
            category: "skill",
            targetValue: 100,
            currentValue: 0,
            priority: "medium",
            subGoals: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "subGoals",
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        Thông tin cơ bản
                    </h3>

                    {error && (
                        <div className="p-2 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/10">
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
                        <label className="block text-[12px] font-medium text-muted-foreground px-4">Mô tả chi tiết</label>
                        <textarea
                            {...register("description")}
                            className="w-full min-h-[80px] px-4 py-3 rounded-lg border border-border text-sm text-foreground focus:ring-4 focus:ring-foreground/5 focus:border-foreground focus:outline-none transition-all duration-200 hover:border-foreground/30 placeholder:text-muted-foreground"
                            placeholder="Mô tả cụ thể cách bạn sẽ đạt được mục tiêu này..."
                        />
                    </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <ListChecks className="w-5 h-5 text-primary" />
                            Mục tiêu con (OKR Style)
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ title: "", weight: 1, currentValue: 0 })}
                            className="h-8 gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm mục tiêu con
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-3 items-start bg-muted/30 p-4 rounded-xl border border-border/60">
                                <div className="flex-1 space-y-3">
                                    <Input
                                        placeholder="Tiêu đề mục tiêu con (ví dụ: Học 50 từ vựng mỗi ngày)"
                                        {...register(`subGoals.${index}.title`)}
                                        className="h-9 text-sm"
                                        error={errors.subGoals?.[index]?.title?.message}
                                    />
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 flex items-center gap-2">
                                            <span className="text-xs font-medium text-muted-foreground shrink-0">Tỉ trọng:</span>
                                            <Input
                                                type="number"
                                                {...register(`subGoals.${index}.weight`, { valueAsNumber: true })}
                                                className="h-8 text-xs w-20 text-center"
                                                placeholder="Cân nặng"
                                            />
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <span className="text-xs font-medium text-muted-foreground shrink-0">Hiện tại:</span>
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    type="number"
                                                    {...register(`subGoals.${index}.currentValue`, { valueAsNumber: true })}
                                                    className="h-8 text-xs w-16 text-center"
                                                />
                                                <span className="text-xs font-bold text-muted-foreground">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                    className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <p className="text-center py-4 text-sm text-muted-foreground italic border-2 border-dashed rounded-xl">
                                Bạn có thể thêm các mục tiêu con để theo dõi tiến độ chính xác hơn theo tỉ trọng.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        className="flex-1 h-11"
                        onClick={onCancel}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" className="flex-1 h-11" isLoading={isLoading}>
                        Xác nhận tạo mục tiêu
                    </Button>
                </div>
            </form>
        </Card>
    );
}

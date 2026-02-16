"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mentorshipSchema, type MentorshipInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { createMentorship } from "@/lib/actions/mentorship";

interface MentorshipFormProps {
    programs: any[];
    mentors: any[];
    mentees: any[];
}

export function MentorshipForm({ programs, mentors, mentees }: MentorshipFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MentorshipInput>({
        resolver: zodResolver(mentorshipSchema) as any,
        defaultValues: {
            type: "one_on_one",
            menteeIds: [],
        },
    });

    const selectedType = watch("type");
    const selectedMentees = watch("menteeIds") || [];

    const onSubmit = async (data: MentorshipInput) => {
        setIsLoading(true);
        setError(null);

        try {
            await createMentorship(data);
            router.push("/admin/mentorships");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi khi tạo mentorship");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMentee = (id: string) => {
        const current = [...selectedMentees];
        const index = current.indexOf(id);

        if (index > -1) {
            current.splice(index, 1);
        } else {
            // If 1:1, only allow one
            if (selectedType === "one_on_one") {
                current.length = 0;
                current.push(id);
            } else {
                current.push(id);
            }
        }
        setValue("menteeIds", current, { shouldValidate: true });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/5 rounded-[6px] border border-destructive/10">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label="Chương trình"
                        options={programs.map(p => ({ value: p.id, label: p.name }))}
                        placeholder="Chọn chương trình..."
                        {...register("programCycleId")}
                        error={errors.programCycleId?.message}
                    />

                    <Select
                        label="Loại Mentorship"
                        options={[
                            { value: "one_on_one", label: "Cá nhân 1:1" },
                            { value: "group", label: "Nhóm (tối đa 6 mentees)" },
                        ]}
                        {...register("type")}
                        error={errors.type?.message}
                    />
                </div>

                <Select
                    label="Mentor"
                    options={mentors.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))}
                    placeholder="Chọn mentor..."
                    {...register("mentorId")}
                    error={errors.mentorId?.message}
                />

                <div className="space-y-2">
                    <label className="block text-[12px] font-medium text-muted-foreground">
                        Chọn Mentees ({selectedMentees.length})
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-muted rounded-[8px] border border-border">
                        {mentees.map((m) => (
                            <label
                                key={m.id}
                                className={`flex items-center gap-2 p-2 rounded-[6px] cursor-pointer transition-colors ${selectedMentees.includes(m.id)
                                    ? "bg-black text-white"
                                    : "bg-card hover:bg-muted text-foreground border border-border"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedMentees.includes(m.id)}
                                    onChange={() => toggleMentee(m.id)}
                                />
                                <span className="text-xs font-medium truncate">
                                    {m.firstName} {m.lastName}
                                </span>
                            </label>
                        ))}
                    </div>
                    {errors.menteeIds && (
                        <p className="text-sm text-destructive">{errors.menteeIds.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Ngày bắt đầu"
                        type="date"
                        {...register("startDate", { valueAsDate: true })}
                        error={errors.startDate?.message}
                    />
                    <Input
                        label="Ngày kết thúc"
                        type="date"
                        {...register("endDate", { valueAsDate: true })}
                        error={errors.endDate?.message}
                    />
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.back()}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" className="flex-1" isLoading={isLoading}>
                        Tạo Mentorship
                    </Button>
                </div>
            </form>
        </Card>
    );
}

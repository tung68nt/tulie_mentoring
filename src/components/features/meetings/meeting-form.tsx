"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { meetingSchema, type MeetingInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { createMeeting } from "@/lib/actions/meeting";

interface MeetingFormProps {
    mentorships: any[];
    defaultMentorshipId?: string;
}

export function MeetingForm({ mentorships, defaultMentorshipId }: MeetingFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<MeetingInput>({
        resolver: zodResolver(meetingSchema) as any,
        defaultValues: {
            mentorshipId: defaultMentorshipId || "",
            type: "offline",
            meetingType: "session",
            duration: 60,
        },
    });

    const onSubmit = async (data: MeetingInput) => {
        setIsLoading(true);
        setError(null);

        try {
            await createMeeting(data);
            if (defaultMentorshipId) {
                router.push(`/admin/mentorships/${defaultMentorshipId}`);
            } else {
                router.push("/calendar");
            }
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi khi tạo cuộc họp");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-xl mx-auto p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <div className="p-3 text-sm text-[#ee0000] bg-[#ee0000]/5 rounded-[6px] border border-[#ee0000]/10">
                        {error}
                    </div>
                )}

                {!defaultMentorshipId && (
                    <Select
                        label="Chọn nhóm/cặp Mentoring"
                        options={mentorships.map(m => ({
                            value: m.id,
                            label: `${m.mentor.lastName} ➔ ${m.mentees[0]?.mentee.lastName}${m.mentees.length > 1 ? '...' : ''}`
                        }))}
                        placeholder="Chọn mentorship..."
                        {...register("mentorshipId")}
                        error={errors.mentorshipId?.message}
                    />
                )}

                <Input
                    label="Tiêu đề cuộc họp"
                    placeholder="Buổi định hướng mục tiêu tháng 2"
                    {...register("title")}
                    error={errors.title?.message}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Hình thức"
                        options={[
                            { value: "offline", label: "Trực tiếp (Offline)" },
                            { value: "online", label: "Trực tuyến (Online)" },
                        ]}
                        {...register("type")}
                        error={errors.type?.message}
                    />
                    <Select
                        label="Loại"
                        options={[
                            { value: "session", label: "Buổi học (Session)" },
                            { value: "workshop", label: "Workshop" },
                            { value: "checkin", label: "Kiểm tra (Check-in)" },
                        ]}
                        {...register("meetingType")}
                        error={errors.meetingType?.message}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Ngày & Giờ"
                        type="datetime-local"
                        {...register("scheduledAt", { valueAsDate: true })}
                        error={errors.scheduledAt?.message}
                    />
                    <Input
                        label="Thời lượng (phút)"
                        type="number"
                        {...register("duration", { valueAsNumber: true })}
                        error={errors.duration?.message}
                    />
                </div>

                <Input
                    label="Địa điểm / Link họp"
                    placeholder="Phòng A1-202 hoặc Google Meet link"
                    {...register("location")}
                    error={errors.location?.message}
                />

                <div className="space-y-1.5">
                    <label className="block text-[12px] font-medium text-[#666]">Ghi chú / Nội dung</label>
                    <textarea
                        {...register("description")}
                        className="w-full min-h-[100px] p-3 rounded-[8px] border border-[#eaeaea] focus:ring-4 focus:ring-black/5 focus:border-black focus:outline-none text-sm text-black transition-all hover:border-[#999] placeholder:text-[#999]"
                        placeholder="Mô tả nội dung buổi họp..."
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
                        Lên lịch họp
                    </Button>
                </div>
            </form>
        </Card>
    );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { meetingSchema, type MeetingInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { createMeeting, getNextSessionNumber } from "@/lib/actions/meeting";
import { Hash } from "lucide-react";

interface MeetingFormProps {
    mentorships: any[];
    defaultMentorshipId?: string;
}

export function MeetingForm({ mentorships, defaultMentorshipId }: MeetingFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [linkMentorship, setLinkMentorship] = useState(!!defaultMentorshipId);
    const [nextSessionNumber, setNextSessionNumber] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
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

    const selectedMentorshipId = watch("mentorshipId");

    // Fetch next session number when mentorship changes
    const fetchSessionNumber = useCallback(async (id: string) => {
        if (!id) {
            setNextSessionNumber(null);
            return;
        }
        try {
            const num = await getNextSessionNumber(id);
            setNextSessionNumber(num);
        } catch {
            setNextSessionNumber(null);
        }
    }, []);

    useEffect(() => {
        if (linkMentorship && selectedMentorshipId) {
            fetchSessionNumber(selectedMentorshipId);
        } else {
            setNextSessionNumber(null);
        }
    }, [selectedMentorshipId, linkMentorship, fetchSessionNumber]);

    // Auto-select when only 1 mentorship and linkMentorship is on
    useEffect(() => {
        if (linkMentorship && mentorships.length === 1 && !selectedMentorshipId) {
            setValue("mentorshipId", mentorships[0].id);
        }
    }, [linkMentorship, mentorships, selectedMentorshipId, setValue]);

    const onSubmit = async (data: MeetingInput) => {
        setIsLoading(true);
        setError(null);

        try {
            // If not linking mentorship, clear the mentorshipId
            const submitData = linkMentorship ? data : { ...data, mentorshipId: "" };
            await createMeeting(submitData);
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

    const showMentorshipSection = mentorships.length > 0 && !defaultMentorshipId;

    return (
        <Card className="w-full max-w-xl mx-auto p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/10">
                        {error}
                    </div>
                )}

                {/* Mentorship Link Section */}
                {showMentorshipSection && (
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={linkMentorship}
                                onChange={(e) => {
                                    setLinkMentorship(e.target.checked);
                                    if (!e.target.checked) {
                                        setValue("mentorshipId", "");
                                        setNextSessionNumber(null);
                                    }
                                }}
                                className="rounded border-border text-foreground focus:ring-foreground/20 w-4 h-4"
                            />
                            <span className="text-sm font-medium text-foreground">
                                Gắn với nhóm Mentoring
                            </span>
                        </label>

                        {linkMentorship && (
                            <div className="space-y-2">
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

                                {nextSessionNumber !== null && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-md w-fit">
                                        <Hash className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">
                                            Buổi #{nextSessionNumber}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
                            { value: "session", label: "Trao đổi định kỳ" },
                            { value: "checkin", label: "Review / Đánh giá" },
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
                    <label className="block text-[12px] font-medium text-muted-foreground">Ghi chú / Nội dung</label>
                    <textarea
                        {...register("description")}
                        className="w-full min-h-[100px] p-3 rounded-lg border border-border focus:ring-2 focus:ring-foreground/5 focus:border-foreground focus:outline-none text-sm text-foreground transition-all hover:border-foreground/30 placeholder:text-muted-foreground"
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

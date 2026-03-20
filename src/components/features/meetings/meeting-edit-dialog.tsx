"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { updateMeetingSchedule } from "@/lib/actions/meeting";
import { format } from "date-fns";

interface MeetingEditDialogProps {
    meeting: {
        id: string;
        title: string;
        description: string | null;
        type: string;
        meetingType: string;
        scheduledAt: string;
        duration: number;
        location: string | null;
        meetingUrl: string | null;
        status: string;
    };
}

export function MeetingEditDialog({ meeting }: MeetingEditDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Form state
    const [title, setTitle] = useState(meeting.title);
    const [description, setDescription] = useState(meeting.description || "");
    const [type, setType] = useState(meeting.type);
    const [meetingType, setMeetingType] = useState(meeting.meetingType);
    const [scheduledAt, setScheduledAt] = useState(
        format(new Date(meeting.scheduledAt), "yyyy-MM-dd'T'HH:mm")
    );
    const [duration, setDuration] = useState(meeting.duration);
    const [location, setLocation] = useState(meeting.location || "");
    const [meetingUrl, setMeetingUrl] = useState(meeting.meetingUrl || "");

    const resetForm = () => {
        setTitle(meeting.title);
        setDescription(meeting.description || "");
        setType(meeting.type);
        setMeetingType(meeting.meetingType);
        setScheduledAt(format(new Date(meeting.scheduledAt), "yyyy-MM-dd'T'HH:mm"));
        setDuration(meeting.duration);
        setLocation(meeting.location || "");
        setMeetingUrl(meeting.meetingUrl || "");
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError("Tiêu đề không được để trống");
            return;
        }

        if (!scheduledAt) {
            setError("Vui lòng chọn thời gian");
            return;
        }

        if (duration < 15 || duration > 180) {
            setError("Thời lượng từ 15 đến 180 phút");
            return;
        }

        startTransition(async () => {
            try {
                await updateMeetingSchedule(meeting.id, {
                    title: title.trim(),
                    description: description.trim() || undefined,
                    type,
                    meetingType,
                    scheduledAt: new Date(scheduledAt).toISOString(),
                    duration,
                    location: location.trim() || undefined,
                    meetingUrl: meetingUrl.trim() || undefined,
                });
                setOpen(false);
                router.refresh();
            } catch (err: any) {
                setError(err.message || "Đã xảy ra lỗi khi cập nhật cuộc họp");
            }
        });
    };

    const isDisabled = meeting.status === "completed";

    if (isDisabled) return null;

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) resetForm();
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    <Pencil className="w-3.5 h-3.5" />
                    Sửa lịch
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa cuộc họp</DialogTitle>
                    <DialogDescription>
                        Cập nhật thời gian, địa điểm và thông tin cuộc họp. Các thành viên sẽ được thông báo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/10">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Tiêu đề"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Tên cuộc họp"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Select
                            label="Hình thức"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            options={[
                                { value: "offline", label: "Trực tiếp" },
                                { value: "online", label: "Trực tuyến" },
                            ]}
                        />
                        <Select
                            label="Loại"
                            value={meetingType}
                            onChange={(e) => setMeetingType(e.target.value)}
                            options={[
                                { value: "session", label: "Trao đổi định kỳ" },
                                { value: "checkin", label: "Review / Đánh giá" },
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Ngày & Giờ"
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                        />
                        <Input
                            label="Thời lượng (phút)"
                            type="number"
                            min={15}
                            max={180}
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                        />
                    </div>

                    <Input
                        label="Địa điểm"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Phòng A1-202 hoặc Google Meet link"
                    />

                    {type === "online" && (
                        <Input
                            label="Link họp trực tuyến"
                            type="url"
                            value={meetingUrl}
                            onChange={(e) => setMeetingUrl(e.target.value)}
                            placeholder="https://meet.google.com/..."
                        />
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-[12px] font-medium text-muted-foreground">Ghi chú / Nội dung</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full min-h-[80px] p-3 rounded-lg border border-border focus:ring-2 focus:ring-foreground/5 focus:border-foreground focus:outline-none text-sm text-foreground transition-all hover:border-foreground/30 placeholder:text-muted-foreground"
                            placeholder="Mô tả nội dung buổi họp..."
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                                resetForm();
                            }}
                            disabled={isPending}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" isLoading={isPending}>
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

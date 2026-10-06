"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { deleteMeeting } from "@/lib/actions/meeting";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface MeetingDeleteDialogProps {
    meeting: {
        id: string;
        title: string;
        scheduledAt: string;
        status: string;
    };
}

export function MeetingDeleteDialog({ meeting }: MeetingDeleteDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const isDisabled = meeting.status === "completed" || meeting.status === "ongoing";

    if (isDisabled) return null;

    const handleDelete = () => {
        setError(null);
        startTransition(async () => {
            try {
                await deleteMeeting(meeting.id);
                setOpen(false);
                router.push("/calendar");
                router.refresh();
            } catch (err: any) {
                setError(err.message || "Đã xảy ra lỗi khi xóa cuộc họp");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/40">
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle>Xóa cuộc họp</DialogTitle>
                            <DialogDescription>
                                Hành động này không thể hoàn tác.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-4 rounded-lg bg-muted border border-border space-y-1.5">
                    <p className="text-sm font-semibold text-foreground">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">
                        {format(new Date(meeting.scheduledAt), "HH:mm - EEEE, dd/MM/yyyy", { locale: vi })}
                    </p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                    Cuộc họp, lịch sử điểm danh, và biên bản liên quan sẽ bị xóa vĩnh viễn. Các thành viên sẽ được thông báo.
                </p>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/10">
                        {error}
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        isLoading={isPending}
                    >
                        Xóa cuộc họp
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

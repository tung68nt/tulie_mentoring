"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
    CheckCircle2,
    XCircle,
    HelpCircle,
    MessageSquare,
    AlertCircle,
    Clock,
    Users,
    ChevronDown,
    ChevronUp,
    Send,
    Loader2,
} from "lucide-react";
import { submitMeetingRsvp } from "@/lib/actions/meeting";
import { toast } from "sonner";

interface AttendanceRecord {
    id: string;
    userId: string;
    rsvpStatus: "pending" | "attending" | "declined";
    declineReason?: string | null;
    preMeetingQuestions?: string | null;
    rsvpAt?: Date | string | null;
    user?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        avatar?: string | null;
        email?: string | null;
        role?: string;
    };
}

interface MeetingRsvpCardProps {
    meetingId: string;
    meetingTitle: string;
    currentUserId: string;
    currentUserRole: string;
    isCreatorOrMentor: boolean;
    initialAttendance?: AttendanceRecord | null;
    allAttendances?: AttendanceRecord[];
}

export function MeetingRsvpCard({
    meetingId,
    currentUserId,
    isCreatorOrMentor,
    initialAttendance,
    allAttendances = [],
}: MeetingRsvpCardProps) {
    const [isPending, startTransition] = useTransition();

    // Mentee's RSVP state
    const [myRsvp, setMyRsvp] = useState<"pending" | "attending" | "declined">(
        initialAttendance?.rsvpStatus || "pending"
    );
    const [selectedChoice, setSelectedChoice] = useState<"attending" | "declined" | null>(
        initialAttendance?.rsvpStatus && initialAttendance.rsvpStatus !== "pending"
            ? initialAttendance.rsvpStatus
            : null
    );
    const [declineReason, setDeclineReason] = useState(initialAttendance?.declineReason || "");
    const [questions, setQuestions] = useState(initialAttendance?.preMeetingQuestions || "");
    const [showQuestionsForm, setShowQuestionsForm] = useState(false);

    // Mentor's expanded view
    const [showAllRsvp, setShowAllRsvp] = useState(false);

    // Tính toán thống kê cho Mentor
    const attendingCount = allAttendances.filter((a) => a.rsvpStatus === "attending").length;
    const declinedCount = allAttendances.filter((a) => a.rsvpStatus === "declined").length;
    const pendingCount = allAttendances.filter((a) => a.rsvpStatus === "pending" || !a.rsvpStatus).length;
    const questionsCount = allAttendances.filter((a) => a.preMeetingQuestions && a.preMeetingQuestions.trim()).length;

    const handleSaveRsvp = (status: "attending" | "declined") => {
        if (status === "declined" && !declineReason.trim()) {
            toast.error("Vui lòng nhập lý do bạn không thể tham gia buổi họp");
            return;
        }

        startTransition(async () => {
            try {
                await submitMeetingRsvp(meetingId, status, declineReason, questions);
                setMyRsvp(status);
                setSelectedChoice(status);
                toast.success(
                    status === "attending"
                        ? "Đã xác nhận tham gia buổi họp!"
                        : "Đã gửi thông báo vắng mặt đến Mentor"
                );
            } catch (err: any) {
                toast.error(err.message || "Lỗi khi lưu xác nhận");
            }
        });
    };

    return (
        <Card className="p-5 border-border bg-card shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground leading-tight">
                            Xác nhận tham gia & Câu hỏi trước họp (RSVP)
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Giúp Mentor nắm trước quân số và giải đáp đúng nhu cầu của bạn
                        </p>
                    </div>
                </div>

                {/* Badge trạng thái cá nhân */}
                {!isCreatorOrMentor && (
                    <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 font-semibold ${
                            myRsvp === "attending"
                                ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                                : myRsvp === "declined"
                                ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
                                : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                        }`}
                    >
                        {myRsvp === "attending"
                            ? "✓ Đã xác nhận tham gia"
                            : myRsvp === "declined"
                            ? "✗ Đã báo vắng mặt"
                            : "⏳ Chưa xác nhận"}
                    </Badge>
                )}
            </div>

            {/* MENTEE / PARTICIPANT VIEW: Form xác nhận */}
            <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <Button
                        type="button"
                        variant={selectedChoice === "attending" ? "default" : "outline"}
                        size="sm"
                        disabled={isPending}
                        onClick={() => setSelectedChoice("attending")}
                        className={`flex-1 h-9 text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
                            selectedChoice === "attending"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                : "hover:border-emerald-500/40 text-muted-foreground hover:text-emerald-600"
                        }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tôi sẽ tham gia</span>
                    </Button>

                    <Button
                        type="button"
                        variant={selectedChoice === "declined" ? "destructive" : "outline"}
                        size="sm"
                        disabled={isPending}
                        onClick={() => setSelectedChoice("declined")}
                        className={`flex-1 h-9 text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
                            selectedChoice === "declined"
                                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                                : "hover:border-rose-500/40 text-muted-foreground hover:text-rose-600"
                        }`}
                    >
                        <XCircle className="w-4 h-4" />
                        <span>Tôi không thể tham gia</span>
                    </Button>
                </div>

                {/* Nếu chọn không thể tham gia -> Form nhập lý do */}
                {selectedChoice === "declined" && (
                    <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2 animate-in fade-in-50 duration-200">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Lý do bạn không thể tham gia buổi họp (bắt buộc):</span>
                        </div>
                        <Textarea
                            placeholder="Ví dụ: Trùng lịch thi cuối kỳ, có việc gia đình đột xuất..."
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            className="text-xs min-h-[65px] bg-background border-border"
                        />
                        <div className="flex justify-end pt-1">
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleSaveRsvp("declined")}
                                disabled={isPending || !declineReason.trim()}
                                className="h-7 px-3 text-xs font-semibold gap-1"
                            >
                                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                <span>Gửi báo vắng mặt</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Nếu chọn sẽ tham gia -> Form câu hỏi đặt trước cho Mentor */}
                {selectedChoice === "attending" && (
                    <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2.5 animate-in fade-in-50 duration-200">
                        <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>Câu hỏi hoặc thắc mắc gửi Mentor trước buổi họp:</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground">Không bắt buộc</span>
                        </div>
                        <Textarea
                            placeholder="Gửi câu hỏi về bài học, định hướng, khó khăn kỹ thuật để Mentor chuẩn bị giải đáp kỹ trong buổi meeting..."
                            value={questions}
                            onChange={(e) => setQuestions(e.target.value)}
                            className="text-xs min-h-[70px] bg-background border-border"
                        />
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-muted-foreground italic">
                                Mentor sẽ đọc trước câu hỏi để giải đáp trực tiếp
                            </span>
                            <Button
                                size="sm"
                                onClick={() => handleSaveRsvp("attending")}
                                disabled={isPending}
                                className="h-7 px-3 text-xs font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                <span>Xác nhận tham gia</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* MENTOR / HOST VIEW & TỔNG HỢP CẢ NHÓM */}
            {(isCreatorOrMentor || allAttendances.length > 0) && (
                <div className="pt-3 border-t border-border/70 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs">
                            <span className="font-semibold text-foreground">Tổng hợp quân số:</span>
                            <span className="text-emerald-600 font-medium">✓ {attendingCount} tham gia</span>
                            <span className="text-rose-600 font-medium">✗ {declinedCount} báo vắng</span>
                            <span className="text-amber-600 font-medium">⏳ {pendingCount} chưa phản hồi</span>
                            {questionsCount > 0 && (
                                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                                    💬 {questionsCount} câu hỏi
                                </Badge>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAllRsvp(!showAllRsvp)}
                            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                            <span>{showAllRsvp ? "Thu gọn danh sách" : "Xem chi tiết RSVP"}</span>
                            {showAllRsvp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                    </div>

                    {/* Chi tiết danh sách RSVP khi mở rộng */}
                    {showAllRsvp && (
                        <div className="space-y-2 pt-1 divide-y divide-border/40">
                            {allAttendances.map((att) => {
                                const user = att.user;
                                const isAttending = att.rsvpStatus === "attending";
                                const isDeclined = att.rsvpStatus === "declined";

                                return (
                                    <div key={att.id} className="pt-2.5 pb-1 flex items-start justify-between gap-3 text-xs">
                                        <div className="flex items-start gap-2.5 min-w-0">
                                            <Avatar
                                                firstName={user?.firstName || undefined}
                                                lastName={user?.lastName || undefined}
                                                src={user?.avatar || undefined}
                                                size="sm"
                                                className="border border-border shrink-0 mt-0.5"
                                            />
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-foreground">
                                                        {user?.firstName} {user?.lastName}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[9px] px-1.5 py-0 h-4 border ${
                                                            isAttending
                                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                                                : isDeclined
                                                                ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                                                : "bg-muted text-muted-foreground border-border"
                                                        }`}
                                                    >
                                                        {isAttending ? "Sẽ tham gia" : isDeclined ? "Báo vắng" : "Chưa RSVP"}
                                                    </Badge>
                                                </div>

                                                {/* Lý do vắng */}
                                                {isDeclined && att.declineReason && (
                                                    <p className="text-[11px] text-rose-700 dark:text-rose-400 bg-rose-500/10 p-1.5 rounded-md border border-rose-500/20">
                                                        <strong>Lý do vắng:</strong> {att.declineReason}
                                                    </p>
                                                )}

                                                {/* Câu hỏi cho Mentor */}
                                                {att.preMeetingQuestions && (
                                                    <div className="text-[11px] text-foreground bg-primary/5 p-2 rounded-md border border-primary/15 space-y-0.5">
                                                        <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                                            <MessageSquare className="w-3 h-3" />
                                                            Câu hỏi trước buổi họp:
                                                        </span>
                                                        <p className="italic text-muted-foreground leading-relaxed">
                                                            "{att.preMeetingQuestions}"
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

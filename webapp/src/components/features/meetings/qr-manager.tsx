"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Clock, RefreshCw, CheckCircle2, StopCircle, PlayCircle, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkIn, checkOut, updateMeetingStatus, startLiveMeeting } from "@/lib/actions/meeting";
import { useRouter } from "next/navigation";
import { confirm } from "@/components/ui/confirm-dialog";

interface QRManagerProps {
    meetingId: string;
    qrToken: string | null;
    checkInCode: string | null;
    expiresAt: Date | string | null;
    attendance?: any;
    status?: string;
}

export function QRManager({
    meetingId,
    qrToken,
    checkInCode,
    expiresAt,
    attendance,
    status: meetingStatus
}: QRManagerProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const isCheckedIn = !!attendance?.checkInTime;
    const isCheckedOut = !!attendance?.checkOutTime;
    const isOngoing = meetingStatus === "ongoing";

    useEffect(() => {
        if (qrToken) {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const qrValue = `${origin}/quick-checkin?m=${meetingId}&t=${qrToken}`;

            QRCode.toDataURL(qrValue, {
                width: 280,
                margin: 2,
                color: { dark: "#111827" }
            })
                .then(setQrDataUrl)
                .catch(console.error);
        }
    }, [qrToken, meetingId]);

    useEffect(() => {
        if (!expiresAt) return;

        const timer = setInterval(() => {
            const remaining = Math.max(0, new Date(expiresAt).getTime() - new Date().getTime());
            setTimeLeft(Math.floor(remaining / 1000));
            if (remaining === 0) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt]);

    const handleStartMeeting = async () => {
        setLoading(true);
        try {
            await startLiveMeeting(meetingId);
            router.refresh();
        } catch (error) {
            console.error("Error starting meeting:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFinishMeeting = async () => {
        const confirmed = await confirm({
            title: "Kết thúc buổi họp",
            description: "Bạn có chắc chắn muốn kết thúc buổi họp này? Toàn bộ phiên điểm danh sẽ được đóng lại.",
            confirmText: "Kết thúc buổi họp",
            variant: "destructive",
        });
        if (!confirmed) return;
        setLoading(true);
        try {
            await updateMeetingStatus(meetingId, "completed");
            if (isCheckedIn && !isCheckedOut) {
                await checkOut(meetingId);
            }
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMentorCheckIn = async () => {
        setLoading(true);
        try {
            await checkIn(meetingId);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (meetingStatus === "completed") {
        return (
            <Card className="p-6 flex flex-col items-center justify-center space-y-3 text-center border-primary/20 bg-primary/5 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-foreground">Buổi họp đã kết thúc</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Tất cả dữ liệu điểm danh đã được chốt.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col items-center justify-center p-6 space-y-5 text-center border-border shadow-sm">
            <div className="w-full flex justify-between items-center pb-2 border-b border-border">
                <div className="text-left">
                    <h3 className="text-base font-semibold text-foreground">Điểm danh & Quản trị phiên</h3>
                    <p className="text-[11px] text-muted-foreground">Bảng điều khiển Mentor</p>
                </div>
                {!isCheckedIn ? (
                    <Button size="sm" variant="outline" onClick={handleMentorCheckIn} disabled={loading} className="text-xs">
                        Mentor Check-in
                    </Button>
                ) : (
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã có mặt
                    </div>
                )}
            </div>

            {/* Trạng thái phiên họp */}
            {!isOngoing ? (
                <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-primary font-medium">
                        <KeyRound className="w-4 h-4" />
                        <span>Kích hoạt phiên họp nhóm</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Bấm nút bên dưới để bắt đầu buổi họp. Hệ thống sẽ tự động cấp mã cá nhân và mở cổng check-in khuôn mặt cho từng bạn mentee.
                    </p>
                    <Button
                        size="sm"
                        onClick={handleStartMeeting}
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-medium"
                    >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Bắt đầu buổi họp ngay
                    </Button>
                </div>
            ) : (
                <div className="w-full py-1 px-3 bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-emerald-600 text-xs font-medium flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Phiên họp đang mở • Mentee có thể tự check-in
                </div>
            )}

            {/* Mã QR chiếu chung (dành cho gặp trực tiếp offline) */}
            <div className="relative group w-full flex flex-col items-center space-y-2">
                <div className="bg-card p-3 rounded-xl border border-border shadow-xs">
                    {qrDataUrl ? (
                        <img src={qrDataUrl} alt="Meeting QR Code" className="w-48 h-48" />
                    ) : (
                        <div className="w-48 h-48 bg-muted animate-pulse rounded-lg" />
                    )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                    QR chiếu chung màn hình / máy chiếu khi gặp trực tiếp
                </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full border border-border mx-auto text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                        {timeLeft > 0 ? `Thời hạn: ${minutes}:${seconds.toString().padStart(2, "0")}` : "Mã đã hết hạn"}
                    </span>
                </div>

                {checkInCode && (
                    <div className="p-3 bg-muted/40 border border-border rounded-xl">
                        <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Mã điểm danh dự phòng</p>
                        <p className="text-2xl font-mono font-bold tracking-widest text-foreground">{checkInCode}</p>
                    </div>
                )}

                {isOngoing && (
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-full rounded-lg"
                        onClick={handleFinishMeeting}
                        disabled={loading}
                    >
                        <StopCircle className="w-4 h-4 mr-2" />
                        Kết thúc buổi họp
                    </Button>
                )}
            </div>
        </Card>
    );
}

"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Clock, RefreshCw, CheckCircle2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkIn, checkOut, updateMeetingStatus } from "@/lib/actions/meeting";
import { useRouter } from "next/navigation";

interface QRManagerProps {
    meetingId: string;
    qrToken: string | null;
    checkInCode: string | null;
    expiresAt: Date | string | null;
    attendance?: any;
    status?: string;
}

export function QRManager({ meetingId, qrToken, checkInCode, expiresAt, attendance, status: meetingStatus }: QRManagerProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const isCheckedIn = !!attendance?.checkInTime;
    const isCheckedOut = !!attendance?.checkOutTime;

    if (qrToken) {
        // Encode as URL for native camera scanning
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const qrValue = `${origin}/checkin?m=${meetingId}&t=${qrToken}`;

        QRCode.toDataURL(qrValue, {
            width: 300,
            margin: 2,
            color: { dark: "#111827" }
        })
            .then(setQrDataUrl)
            .catch(console.error);
    }

    useEffect(() => {
        if (!expiresAt) return;

        const timer = setInterval(() => {
            const remaining = Math.max(0, new Date(expiresAt).getTime() - new Date().getTime());
            setTimeLeft(Math.floor(remaining / 1000));
            if (remaining === 0) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt]);

    const handleFinishMeeting = async () => {
        if (!confirm("Bạn có chắc chắn muốn kết thúc buổi họp này?")) return;
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
            <Card className="p-8 flex flex-col items-center justify-center space-y-4 text-center border-primary/20 bg-primary/5">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Buổi họp đã kết thúc</h3>
                    <p className="text-sm text-muted-foreground mt-1">Tất cả dữ liệu điểm danh đã được ghi nhận.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
            <div className="w-full flex justify-between items-center mb-2">
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-foreground">Quản lý điểm danh</h3>
                    <p className="text-xs text-muted-foreground">Mentor Panel</p>
                </div>
                {!isCheckedIn ? (
                    <Button size="sm" variant="outline" onClick={handleMentorCheckIn} disabled={loading}>
                        Mentor Check-in
                    </Button>
                ) : !isCheckedOut && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã Check-in
                    </div>
                )}
            </div>

            <div className="relative group w-full flex justify-center">
                <div className="bg-card p-4 rounded-xl border border-border">
                    {qrDataUrl ? (
                        <img src={qrDataUrl} alt="Meeting QR Code" className="w-56 h-56" />
                    ) : (
                        <div className="w-56 h-56 bg-muted animate-pulse rounded-lg" />
                    )}
                </div>
                {timeLeft === 0 && (
                    <div className="absolute inset-0 bg-card/90 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-4">
                        <p className="text-sm font-semibold text-destructive mb-2">Mã QR đã hết hạn</p>
                        <Button size="sm" variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Làm mới mã
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full border border-border mx-auto">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">
                        {timeLeft > 0 ? `Hết hạn sau: ${minutes}:${seconds.toString().padStart(2, "0")}` : "Hết hạn"}
                    </span>
                </div>

                {checkInCode && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock className="w-12 h-12" />
                        </div>
                        <p className="text-[10px] text-primary font-bold tracking-wider mb-1 uppercase">Mã điểm danh thủ công</p>
                        <p className="text-3xl font-mono font-black tracking-[0.2em] text-primary">{checkInCode}</p>
                    </div>
                )}

                <Button
                    variant="destructive"
                    className="w-full rounded-lg h-11"
                    onClick={handleFinishMeeting}
                    disabled={loading}
                >
                    <StopCircle className="w-4 h-4 mr-2" />
                    Kết thúc buổi họp
                </Button>
            </div>
        </Card>
    );
}

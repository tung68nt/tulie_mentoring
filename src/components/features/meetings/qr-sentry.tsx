"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, CheckCircle, AlertCircle, Loader2, LogOut, Video } from "lucide-react";
import { checkIn, checkOut } from "@/lib/actions/meeting";
import { useRouter } from "next/navigation";

interface QRSentryProps {
    meetingId: string;
    meetingType: string;
    meetingUrl?: string | null;
    attendance?: {
        status: string;
        checkInTime?: string | Date | null;
        checkOutTime?: string | Date | null;
    } | null;
}

export function QRSentry({ meetingId, meetingType, meetingUrl, attendance }: QRSentryProps) {
    const router = useRouter();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState<string>("");

    const isCheckedIn = attendance?.status === "present" || !!attendance?.checkInTime;
    const isCheckedOut = !!attendance?.checkOutTime;

    const handleCheckInClick = () => {
        router.push(`/checkin?m=${meetingId}`);
    };

    const handleJoinOnline = async () => {
        if (meetingUrl) {
            window.open(meetingUrl, "_blank");
            // Automatically check-in for online meetings when joining
            if (!isCheckedIn) {
                handleDirectCheckIn();
            }
        }
    };

    const handleDirectCheckIn = async () => {
        setStatus("loading");
        try {
            await checkIn(meetingId); // Special case for online or direct check-in if allowed
            setStatus("success");
            router.refresh();
        } catch (err: any) {
            // If direct check-in fails (e.g. requires token), redirect to scanner
            if (err.message?.includes("Mã điểm danh không hợp lệ")) {
                handleCheckInClick();
            } else {
                setErrorMsg(err.message || "Lỗi check-in");
                setStatus("error");
            }
        }
    };

    const handleCheckOut = async () => {
        setStatus("loading");
        try {
            await checkOut(meetingId);
            setStatus("success");
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err.message || "Lỗi check-out");
            setStatus("error");
        }
    };

    if (isCheckedOut) {
        return (
            <Card className="p-8 flex flex-col items-center text-center space-y-4 border-primary/20 bg-primary/5">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">Đã kết thúc buổi họp</h3>
                    <p className="text-xs text-muted-foreground">Bạn đã hoàn thành điểm danh và check-out.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-8 flex flex-col items-center text-center space-y-6">
            <div className={`w-16 h-16 ${isCheckedIn ? 'bg-secondary' : 'bg-primary'} rounded-full flex items-center justify-center text-white shadow-none`}>
                {isCheckedIn ? <LogOut className="w-8 h-8" /> : (meetingType === "online" ? <Video className="w-8 h-8" /> : <Camera className="w-8 h-8" />)}
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                    {isCheckedIn ? "Kết thúc buổi họp?" : "Điểm danh buổi họp"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    {isCheckedIn
                        ? "Đừng quên check-out khi buổi họp kết thúc để ghi nhận thời lượng tham gia."
                        : meetingType === "online"
                            ? "Tham gia cuộc họp online và điểm danh tự động."
                            : "Vui lòng quét mã QR hoặc nhập mã từ Mentor để điểm danh."}
                </p>
            </div>

            <div className="w-full space-y-3">
                {status === "loading" ? (
                    <Button className="w-full" disabled>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xử lý...
                    </Button>
                ) : isCheckedIn ? (
                    <Button className="w-full rounded-lg" variant="secondary" onClick={handleCheckOut}>
                        Check-out ngay
                    </Button>
                ) : (
                    <>
                        {meetingType === "online" && meetingUrl && (
                            <Button className="w-full rounded-lg" onClick={handleJoinOnline}>
                                <Video className="w-4 h-4 mr-2" />
                                Tham gia & Check-in
                            </Button>
                        )}
                        <Button className="w-full rounded-lg" variant={meetingType === "online" ? "outline" : "default"} onClick={handleCheckInClick}>
                            <Camera className="w-4 h-4 mr-2" />
                            {meetingType === "online" ? "Chỉ check-in" : "Bắt đầu quét mã"}
                        </Button>
                    </>
                )}
            </div>

            {status === "error" && (
                <div className="flex items-center gap-2 text-destructive text-xs font-medium bg-destructive/5 p-3 rounded-lg w-full">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {status === "success" && (
                <div className="flex items-center gap-2 text-primary text-xs font-medium bg-primary/5 p-3 rounded-lg w-full">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Thành công!</span>
                </div>
            )}
        </Card>
    );
}

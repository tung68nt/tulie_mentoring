"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Camera,
    CheckCircle,
    AlertCircle,
    Loader2,
    LogOut,
    Video,
    ShieldCheck,
    KeyRound,
    UserCheck,
    Sparkles
} from "lucide-react";
import { checkIn, checkOut, checkInWithFaceAndPersonalCode } from "@/lib/actions/meeting";
import { useRouter } from "next/navigation";
import { WebcamCapture } from "@/components/ui/webcam-capture";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface QRSentryProps {
    meetingId: string;
    meetingType: string;
    meetingUrl?: string | null;
    meetingStatus?: string;
    attendance?: {
        status: string;
        checkInTime?: string | Date | null;
        checkOutTime?: string | Date | null;
        personalCode?: string | null;
        verifiedByFace?: boolean;
        facePhotoUrl?: string | null;
    } | null;
}

export function QRSentry({
    meetingId,
    meetingType,
    meetingUrl,
    meetingStatus,
    attendance
}: QRSentryProps) {
    const router = useRouter();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [isFaceSubmitting, setIsFaceSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
    const [facePhoto, setFacePhoto] = useState<string | null>(null);

    const isCheckedIn = attendance?.status === "present" || !!attendance?.checkInTime;
    const isCheckedOut = !!attendance?.checkOutTime;
    const isOngoing = meetingStatus === "ongoing";
    const personalCode = attendance?.personalCode;

    const handleJoinOnline = async () => {
        if (meetingUrl) {
            window.open(meetingUrl, "_blank");
            if (!isCheckedIn) {
                handleDirectCheckIn();
            }
        }
    };

    const handleDirectCheckIn = async () => {
        setStatus("loading");
        try {
            await checkIn(meetingId);
            setStatus("success");
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err.message || "Lỗi check-in");
            setStatus("error");
        }
    };

    const handleFaceCheckInSubmit = async () => {
        if (!facePhoto) {
            setErrorMsg("Vui lòng chụp ảnh khuôn mặt trước khi xác nhận");
            return;
        }
        setIsFaceSubmitting(true);
        setErrorMsg("");
        try {
            await checkInWithFaceAndPersonalCode({
                meetingId,
                personalCode: personalCode || undefined,
                facePhotoUrl: facePhoto,
            });
            setIsFaceModalOpen(false);
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err.message || "Lỗi check-in bằng khuôn mặt");
        } finally {
            setIsFaceSubmitting(false);
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
            <Card className="p-6 flex flex-col items-center text-center space-y-4 border-primary/20 bg-primary/5">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">Đã kết thúc buổi họp</h3>
                    <p className="text-xs text-muted-foreground">Bạn đã hoàn thành điểm danh và check-out.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 flex flex-col items-center text-center space-y-5 border-border shadow-sm">
            {/* Live Indicator */}
            {isOngoing && !isCheckedIn && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-900/50 text-xs font-medium animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Mentor đã mở phòng họp • Đang diễn ra
                </div>
            )}

            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-primary shadow-xs ${
                isCheckedIn ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10"
            }`}>
                {isCheckedIn ? (
                    <ShieldCheck className="w-7 h-7" />
                ) : meetingType === "online" ? (
                    <Video className="w-7 h-7" />
                ) : (
                    <Camera className="w-7 h-7" />
                )}
            </div>

            <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-foreground">
                    {isCheckedIn ? "Bạn đã có mặt trong buổi họp" : "Điểm danh tham dự"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {isCheckedIn
                        ? "Ghi nhận tham gia thành công. Bạn có thể check-out khi buổi họp kết thúc."
                        : "Điểm danh bằng mã cá nhân hoặc chụp ảnh selfie xác thực khuôn mặt."}
                </p>
            </div>

            {/* Checked In Status View */}
            {isCheckedIn && (
                <div className="w-full p-4 bg-muted/30 rounded-xl border border-border space-y-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Thời gian vào họp:</span>
                        <span className="font-semibold text-foreground">
                            {attendance?.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Vừa xong"}
                        </span>
                    </div>

                    {attendance?.verifiedByFace && (
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Xác thực khuôn mặt:
                            </span>
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 text-[10px]">
                                Đã xác thực
                            </Badge>
                        </div>
                    )}

                    {attendance?.facePhotoUrl && (
                        <div className="flex justify-center pt-1">
                            <img
                                src={attendance.facePhotoUrl}
                                alt="Checkin selfie"
                                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/30"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Personal Code Display (Chỉ hiển thị cho mentee này) */}
            {!isCheckedIn && personalCode && (
                <div className="w-full p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-primary font-medium">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Mã định danh riêng của bạn:</span>
                    </div>
                    <p className="text-2xl font-mono font-bold tracking-widest text-primary">
                        {personalCode}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        Mã này dành riêng cho tài khoản của bạn, không chia sẻ cho người khác.
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="w-full space-y-2">
                {status === "loading" ? (
                    <Button className="w-full" disabled size="sm">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xử lý...
                    </Button>
                ) : isCheckedIn ? (
                    <Button
                        className="w-full rounded-lg"
                        variant="secondary"
                        size="sm"
                        onClick={handleCheckOut}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Check-out kết thúc buổi
                    </Button>
                ) : (
                    <>
                        {/* Check-in bằng khuôn mặt (Khuyến khích) */}
                        <Dialog open={isFaceModalOpen} onOpenChange={setIsFaceModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full rounded-lg bg-primary text-primary-foreground font-medium" size="sm">
                                    <Camera className="w-4 h-4 mr-2" />
                                    Check-in bằng khuôn mặt
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-base font-semibold">Điểm danh nhận diện khuôn mặt</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <WebcamCapture
                                        title="Chụp ảnh selfie lúc tham gia"
                                        description="Giữ khuôn mặt rõ ràng trước ống kính và bấm chụp"
                                        onCapture={(img) => {
                                            setFacePhoto(img);
                                            setErrorMsg("");
                                        }}
                                    />
                                    {errorMsg && (
                                        <p className="text-xs text-destructive text-center">{errorMsg}</p>
                                    )}
                                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsFaceModalOpen(false)}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={!facePhoto || isFaceSubmitting}
                                            onClick={handleFaceCheckInSubmit}
                                        >
                                            {isFaceSubmitting ? "Đang xác nhận..." : "Xác nhận điểm danh"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Nút tham gia online */}
                        {meetingType === "online" && meetingUrl && (
                            <Button
                                className="w-full rounded-lg"
                                variant="outline"
                                size="sm"
                                onClick={handleJoinOnline}
                            >
                                <Video className="w-4 h-4 mr-2 text-primary" />
                                Vào phòng họp online
                            </Button>
                        )}
                    </>
                )}
            </div>

            {status === "error" && !isFaceModalOpen && (
                <div className="flex items-center gap-2 text-destructive text-xs font-medium bg-destructive/5 p-3 rounded-lg w-full text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}
        </Card>
    );
}

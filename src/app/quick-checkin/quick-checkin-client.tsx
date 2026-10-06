"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickCheckinClientProps {
    meetingId: string;
    token: string;
    userName: string;
}

export function QuickCheckinClient({ meetingId, token, userName }: QuickCheckinClientProps) {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [meetingTitle, setMeetingTitle] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const router = useRouter();
    const hasCheckedIn = useRef(false);

    useEffect(() => {
        if (hasCheckedIn.current) return;
        hasCheckedIn.current = true;

        const doCheckIn = async () => {
            try {
                const { quickCheckIn } = await import("@/lib/actions/meeting");
                const result = await quickCheckIn(meetingId, token);
                setMeetingTitle(result.meetingTitle || "");
                setStatus("success");
            } catch (err: any) {
                setErrorMsg(err.message || "Lỗi check-in. Vui lòng thử lại.");
                setStatus("error");
            }
        };

        doCheckIn();
    }, [meetingId, token]);

    if (status === "loading") {
        return (
            <div className="rounded-2xl border border-border bg-card p-12 flex flex-col items-center justify-center space-y-5 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-foreground">Đang xác thực...</h2>
                    <p className="text-sm text-muted-foreground">Xin chờ, hệ thống đang kiểm tra điểm danh cho bạn.</p>
                </div>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-10 flex flex-col items-center justify-center space-y-5 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Điểm danh thành công! 🎉</h2>
                    {meetingTitle && (
                        <p className="text-sm text-muted-foreground">
                            Cuộc họp: <span className="font-medium text-foreground">{meetingTitle}</span>
                        </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                        Xin chào <span className="font-medium text-foreground">{userName}</span>, bạn đã được ghi nhận sự hiện diện.
                    </p>
                </div>
                <Button
                    className="rounded-xl px-8 h-11 mt-2"
                    onClick={() => router.push(`/meetings/${meetingId}`)}
                >
                    Xem chi tiết cuộc họp
                </Button>
            </div>
        );
    }

    // Error state
    const isWrongMeeting = errorMsg.includes("không thuộc") || errorMsg.includes("không phải");

    return (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-10 flex flex-col items-center justify-center space-y-5 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground shadow-lg shadow-destructive/20">
                {isWrongMeeting ? (
                    <QrCode className="w-10 h-10" />
                ) : (
                    <AlertCircle className="w-10 h-10" />
                )}
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                    {isWrongMeeting ? "Nhầm cuộc họp!" : "Lỗi điểm danh"}
                </h2>
                <p className="text-sm text-destructive font-medium">{errorMsg}</p>
                {isWrongMeeting && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Vui lòng kiểm tra lại mã QR — bạn có thể đã quét nhầm mã của cuộc họp khác.
                    </p>
                )}
            </div>
            <div className="flex gap-3 mt-2">
                <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => router.push("/calendar")}
                >
                    Về lịch
                </Button>
                <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => router.push("/checkin")}
                >
                    Quét mã khác
                </Button>
            </div>
        </div>
    );
}

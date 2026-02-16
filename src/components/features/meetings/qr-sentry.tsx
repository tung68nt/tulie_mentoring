"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { checkIn } from "@/lib/actions/meeting";

interface QRSentryProps {
    meetingId: string;
}

export function QRSentry({ meetingId }: QRSentryProps) {
    const [status, setStatus] = useState<"idle" | "scanning" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState<string>("");

    const handleManualCheckIn = async () => {
        // This is for demo. In real app, we use a QR scanner hook.
        // Here we'll prompt for token manually to demonstrate the logic.
        const token = prompt("Nhập mã token điểm danh (demo):");
        if (!token) return;

        setStatus("loading");
        try {
            await checkIn(meetingId, token);
            setStatus("success");
        } catch (err: any) {
            setErrorMsg(err.message || "Điểm danh thất bại");
            setStatus("error");
        }
    };

    return (
        <Card className="p-10 flex flex-col items-center text-center space-y-6">
            {status === "idle" && (
                <>
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white">
                        <Camera className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">Điểm danh buổi họp</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Vui lòng sử dụng camera để quét mã QR được hiển thị bởi Mentor của bạn.
                        </p>
                    </div>
                    <Button className="w-full" onClick={handleManualCheckIn}>
                        Bắt đầu quét mã
                    </Button>
                </>
            )}

            {status === "loading" && (
                <div className="py-10 flex flex-col items-center space-y-4">
                    <Loader2 className="w-10 h-10 text-foreground animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground">Đang xác thực check-in...</p>
                </div>
            )}

            {status === "success" && (
                <div className="py-6 flex flex-col items-center space-y-4 animate-scale-in">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-foreground">Điểm danh thành công!</h3>
                        <p className="text-sm text-muted-foreground">Thông tin tham gia của bạn đã được ghi lại.</p>
                    </div>
                    <Button variant="outline" onClick={() => setStatus("idle")}>Xong</Button>
                </div>
            )}

            {status === "error" && (
                <div className="py-6 flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-foreground">Lỗi điểm danh</h3>
                        <p className="text-sm text-destructive font-medium">{errorMsg}</p>
                    </div>
                    <Button variant="outline" onClick={() => setStatus("idle")}>Thử lại</Button>
                </div>
            )}
        </Card>
    );
}

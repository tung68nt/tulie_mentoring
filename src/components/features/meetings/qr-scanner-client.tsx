"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2, Camera } from "lucide-react";
import { checkIn } from "@/lib/actions/meeting";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface QRScannerClientProps {
    initialMeetingId?: string;
    initialToken?: string;
}

export function QRScannerClient({ initialMeetingId, initialToken }: QRScannerClientProps) {
    const [status, setStatus] = useState<"idle" | "scanning" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const router = useRouter();
    const hasAutoCheckedIn = useRef(false);

    useEffect(() => {
        if (initialMeetingId && initialToken && !hasAutoCheckedIn.current) {
            hasAutoCheckedIn.current = true;
            handleCheckIn(initialMeetingId, initialToken);
        }
    }, [initialMeetingId, initialToken]);

    const handleCheckIn = async (meetingId: string, token: string) => {
        setStatus("loading");
        try {
            await checkIn(meetingId, token);
            setStatus("success");

            // Redirect after success
            setTimeout(() => {
                router.push("/calendar");
                router.refresh();
            }, 2000);
        } catch (err: any) {
            console.error("Check-in error:", err);
            setErrorMsg(err.message || "Mã QR không hợp lệ hoặc đã hết hạn");
            setStatus("error");
        }
    };

    const handleScan = async (result: any) => {
        if (!result || !result[0]?.rawValue || status === "loading") return;

        const rawValue = result[0].rawValue;
        console.log("Scanned QR:", rawValue);

        try {
            // Support both URL format and JSON format (legacy)
            let meetingId, token;

            if (rawValue.includes("/checkin?")) {
                const url = new URL(rawValue);
                meetingId = url.searchParams.get("m");
                token = url.searchParams.get("t");
            } else {
                const data = JSON.parse(rawValue);
                meetingId = data.m;
                token = data.t;
            }

            if (!meetingId || !token) {
                throw new Error("Mã QR không đúng định dạng hệ thống");
            }

            await handleCheckIn(meetingId, token);

        } catch (err: any) {
            console.error("Parsing error:", err);
            setErrorMsg(err.message || "Mã QR không hợp lệ");
            setStatus("error");
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
            {status === "idle" && (
                <Card className="p-10 flex flex-col items-center text-center space-y-6 border-dashed rounded-xl">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Camera className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">Sẵn sàng quét mã?</h3>
                        <p className="text-sm text-muted-foreground">
                            Nhấn nút bên dưới để mở camera và quét mã QR điểm danh từ Mentor.
                        </p>
                    </div>
                    <Button className="w-full rounded-lg" onClick={() => setStatus("scanning")}>
                        Bắt đầu quét mã
                    </Button>
                </Card>
            )}

            {status === "scanning" && (
                <div className="relative overflow-hidden rounded-xl border border-border bg-black aspect-square">
                    <Scanner
                        onScan={handleScan}
                        onError={(err) => {
                            console.error(err);
                            setErrorMsg("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
                            setStatus("error");
                        }}
                        styles={{
                            container: { width: '100%', height: '100%' }
                        }}
                    />
                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                        <div className="w-full h-full border-2 border-white/50 rounded-lg animate-pulse" />
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <Button variant="secondary" size="sm" onClick={() => setStatus("idle")} className="rounded-full shadow-none">
                            Hủy bỏ
                        </Button>
                    </div>
                </div>
            )}

            {status === "loading" && (
                <Card className="p-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground font-mono">Đang xác thực check-in...</p>
                </Card>
            )}

            {status === "success" && (
                <Card className="p-12 flex flex-col items-center justify-center space-y-4 border-primary/20 bg-primary/5 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-none">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-xl font-semibold text-foreground">Điểm danh thành công!</h3>
                        <p className="text-sm text-muted-foreground">Bạn sẽ được chuyển hướng về trang lịch...</p>
                    </div>
                </Card>
            )}

            {status === "error" && (
                <Card className="p-12 flex flex-col items-center justify-center space-y-4 border-destructive/20 bg-destructive/5 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground shadow-none">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-xl font-semibold text-foreground">Lỗi điểm danh</h3>
                        <p className="text-sm text-destructive font-bold">{errorMsg}</p>
                    </div>
                    <Button variant="outline" onClick={() => setStatus("scanning")} className="rounded-lg mt-2 border-border/60">
                        Thử lại
                    </Button>
                </Card>
            )}
        </div>
    );
}

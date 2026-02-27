"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRManagerProps {
    meetingId: string;
    qrToken: string | null;
    expiresAt: Date | null;
}

export function QRManager({ meetingId, qrToken, expiresAt }: QRManagerProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState<number>(0);

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

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (!qrToken) return null;

    return (
        <Card className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
            <div>
                <h3 className="text-lg font-semibold text-foreground">Quét mã để điểm danh</h3>
                <p className="text-sm text-muted-foreground mt-1">Mã QR sẽ tự động hết hạn sau khi kết thúc buổi họp</p>
            </div>

            <div className="relative group">
                <div className="bg-card p-4 rounded-xl border border-border shadow-none">
                    {qrDataUrl ? (
                        <img src={qrDataUrl} alt="Meeting QR Code" className="w-64 h-64" />
                    ) : (
                        <div className="w-64 h-64 bg-muted animate-pulse rounded-lg" />
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

            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full border border-border">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                    Còn lại: {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
            </div>
        </Card>
    );
}

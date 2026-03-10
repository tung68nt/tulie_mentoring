import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QRScannerClient } from "@/components/features/meetings/qr-scanner-client";

interface PageProps {
    searchParams: Promise<{ m?: string; t?: string }>;
}

export default async function CheckinPage({ searchParams }: PageProps) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { m, t } = await searchParams;

    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            <div className="flex flex-col gap-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-foreground no-uppercase">Check-in / Check-out</h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    Quét mã QR được hiển thị trên màn hình của Mentor để ghi nhận sự hiện diện của bạn trong buổi gặp.
                </p>
            </div>

            <div className="mt-8">
                <QRScannerClient initialMeetingId={m} initialToken={t} />
            </div>

            <div className="max-w-md mx-auto p-4 bg-muted/50 rounded-xl border border-border/50">
                <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
                    Lưu ý: Hệ thống sẽ ghi nhận thời gian và vị trí của bạn khi check-in để đảm bảo tính minh bạch.
                    Vui lòng đảm bảo bạn đang ở cùng địa điểm với Mentor.
                </p>
            </div>
        </div>
    );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle2, Clock, MapPin, Video } from "lucide-react";
import { QRScannerClient } from "@/components/features/meetings/qr-scanner-client";
import { SelfieCheckin } from "@/components/features/meetings/selfie-checkin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getMyCheckinMeetings } from "@/lib/actions/checkin";

interface PageProps {
    searchParams: Promise<{ m?: string; t?: string }>;
}

export default async function CheckinPage({ searchParams }: PageProps) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const role = (session.user as any).role;

    if (role === "mentee") {
        const meetings = await getMyCheckinMeetings();
        return (
            <div className="space-y-8 pb-10">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Check-in</h1>
                    <p className="text-sm text-muted-foreground">
                        Check-in tự động mở trước giờ họp 15 phút. Bạn cần chụp selfie để xác nhận có mặt.
                    </p>
                </div>

                {meetings.length === 0 && (
                    <Card className="p-8 text-center text-sm text-muted-foreground">Chưa có buổi họp nào trong 48 giờ tới.</Card>
                )}

                <div className="space-y-4">
                    {meetings.map((m) => (
                        <Card key={m.id} className="p-5 space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="space-y-1">
                                    <h2 className="font-semibold text-foreground">{m.title}</h2>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(m.scheduledAt), "HH:mm, EEEE dd/MM/yyyy", { locale: vi })} · {m.duration} phút
                                    </p>
                                    {m.location && (
                                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />{m.location}</p>
                                    )}
                                    {m.meetingUrl && (
                                        <a href={m.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-foreground underline underline-offset-4">
                                            <Video className="w-4 h-4" />Link họp online
                                        </a>
                                    )}
                                </div>
                                {m.checkedIn ? (
                                    <Badge variant="success"><CheckCircle2 className="w-3 h-3" />Đã check-in {format(new Date(m.checkInTime!), "HH:mm")}</Badge>
                                ) : m.isOpen ? (
                                    <Badge variant="primary">Đang mở</Badge>
                                ) : (
                                    <Badge variant="secondary"><Clock className="w-3 h-3" />Mở lúc {format(new Date(m.opensAt), "HH:mm dd/MM")}</Badge>
                                )}
                            </div>
                            {!m.checkedIn && m.isOpen && <SelfieCheckin meetingId={m.id} />}
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const { m, t } = await searchParams;
    return (
        <div className="space-y-8 pb-10">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Check-in / Check-out</h1>
                <p className="text-sm text-muted-foreground max-w-lg">
                    Quét mã QR được hiển thị trong buổi gặp để ghi nhận sự hiện diện.
                </p>
            </div>
            <QRScannerClient initialMeetingId={m} initialToken={t} />
        </div>
    );
}

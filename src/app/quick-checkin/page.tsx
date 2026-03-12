import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QuickCheckinClient } from "./quick-checkin-client";

interface PageProps {
    searchParams: Promise<{ m?: string; t?: string }>;
}

export default async function QuickCheckinPage({ searchParams }: PageProps) {
    const session = await auth();
    const { m, t } = await searchParams;

    // If not logged in, redirect to login with callback URL
    if (!session?.user) {
        const callbackUrl = `/quick-checkin?m=${m || ""}&t=${t || ""}`;
        redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }

    // Missing params
    if (!m || !t) {
        return (
            <div className="max-w-md w-full">
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground mx-auto">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Mã QR không hợp lệ</h2>
                    <p className="text-sm text-muted-foreground">Vui lòng quét lại mã QR từ Mentor.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md w-full">
            <QuickCheckinClient
                meetingId={m}
                token={t}
                userName={`${(session.user as any).firstName || ""} ${(session.user as any).lastName || ""}`.trim()}
            />
        </div>
    );
}

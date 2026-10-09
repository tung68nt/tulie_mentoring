import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { PrintButton } from "@/components/features/reports/print-button";
import { getMenteeOverview } from "@/lib/actions/mentee-tracking";

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export default async function PrintableReportPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const role = (session.user as any).role as string;
    if (role === "mentee") redirect("/");

    const rows: any[] = await getMenteeOverview();
    const total = rows.length;
    const held = rows.reduce((a, r) => a + r.metrics.meetingsHeld, 0);
    const present = rows.reduce((a, r) => a + r.metrics.present, 0);
    const refl = rows.reduce((a, r) => a + r.metrics.reflectionsSubmitted, 0);
    const avgScore = total ? Math.round(rows.reduce((a, r) => a + r.metrics.score, 0) / total) : 0;
    const low = rows.filter((r) => r.metrics.meetingsHeld >= 2 && r.metrics.score < 40);

    return (
        <div className="space-y-6 pb-10 max-w-4xl mx-auto print:max-w-none">
            <div className="flex items-center justify-between print:hidden">
                <Link href="/mentees/overview" className="text-sm text-muted-foreground underline underline-offset-4">Quay lại</Link>
                <PrintButton />
            </div>

            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Báo cáo chuyên cần và mức độ tham gia của mentee</h1>
                <p className="text-sm text-muted-foreground">Ngày lập: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi })} · Phạm vi: {total} mentee</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    ["Số mentee", String(total)],
                    ["Tỷ lệ có mặt", `${pct(present, held)}%`],
                    ["Tỷ lệ nộp thu hoạch", `${pct(refl, held)}%`],
                    ["Điểm nhiệt tình TB", String(avgScore)],
                ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">{k}</p>
                        <p className="text-xl font-semibold text-foreground">{v}</p>
                    </div>
                ))}
            </div>

            {low.length > 0 && (
                <div className="space-y-1">
                    <h2 className="font-semibold text-foreground">Mentee cần chú ý ({low.length})</h2>
                    <p className="text-sm text-muted-foreground">{low.map((r) => `${r.mentee.firstName ?? ""} ${r.mentee.lastName ?? ""}`.trim()).join(", ")}</p>
                </div>
            )}

            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="py-2 pr-2 font-medium">Mentee</th>
                        <th className="py-2 pr-2 font-medium">Mentor</th>
                        <th className="py-2 pr-2 font-medium">Có mặt</th>
                        <th className="py-2 pr-2 font-medium">Thu hoạch</th>
                        <th className="py-2 pr-2 font-medium">Bài nộp 30 ngày</th>
                        <th className="py-2 font-medium">Điểm</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.mentee.id} className="border-b border-border break-inside-avoid">
                            <td className="py-2 pr-2 text-foreground">{r.mentee.firstName} {r.mentee.lastName}</td>
                            <td className="py-2 pr-2 text-muted-foreground">{r.mentorName}</td>
                            <td className="py-2 pr-2">{r.metrics.present}/{r.metrics.meetingsHeld}</td>
                            <td className="py-2 pr-2">{r.metrics.reflectionsSubmitted}/{r.metrics.meetingsHeld}</td>
                            <td className="py-2 pr-2">{r.metrics.submissions30d}</td>
                            <td className="py-2 font-medium">{r.metrics.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="text-xs text-muted-foreground">Điểm nhiệt tình (0–100) = 40% chuyên cần + 30% thu hoạch đúng hạn + 20% hoạt động 14 ngày + 10% bài nộp 30 ngày.</p>
        </div>
    );
}

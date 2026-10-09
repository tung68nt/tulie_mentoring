import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMenteeOverview } from "@/lib/actions/mentee-tracking";
import { formatDate } from "@/lib/utils";

const STALE_MS = 7 * 86_400_000;
const atRisk = (m: any) =>
    (m.meetingsHeld >= 2 && m.score < 40) ||
    (!m.lastActiveAt || Date.now() - new Date(m.lastActiveAt).getTime() > STALE_MS) ||
    (m.meetingsHeld >= 2 && m.present === 0);

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");

export default async function MenteeOverviewPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const role = (session.user as any).role as string;
    if (role === "mentee") redirect("/");

    const rows = await getMenteeOverview();
    const canExport = role !== "mentor";

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Theo dõi mentee</h1>
                    <p className="text-sm text-muted-foreground max-w-xl">
                        Chuyên cần, thu hoạch, bài nộp và mức độ hoạt động. Nhãn "Cần chú ý": điểm dưới 40, vắng liên tiếp hoặc không hoạt động quá 7 ngày. Điểm nhiệt tình (0–100) = 40% chuyên cần, 30% thu hoạch đúng hạn, 20% hoạt động 14 ngày, 10% bài nộp 30 ngày.
                    </p>
                </div>
                {canExport && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild><a href="/api/export/engagement"><Download className="w-4 h-4" />CSV chỉ số</a></Button>
                        <Button variant="outline" size="sm" asChild><a href="/api/export/attendance"><Download className="w-4 h-4" />CSV điểm danh</a></Button>
                        <Button variant="outline" size="sm" asChild><a href="/api/export/activity"><Download className="w-4 h-4" />CSV log truy cập</a></Button>
                    </div>
                )}
            </div>

            <Card className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                    <thead className="border-b border-border text-left text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">Mentee</th>
                            <th className="px-4 py-3 font-medium">Mentor</th>
                            <th className="px-4 py-3 font-medium">Chuyên cần</th>
                            <th className="px-4 py-3 font-medium">Thu hoạch</th>
                            <th className="px-4 py-3 font-medium">Bài nộp 30 ngày</th>
                            <th className="px-4 py-3 font-medium">Hoạt động gần nhất</th>
                            <th className="px-4 py-3 font-medium">Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Chưa có mentee trong phạm vi của bạn.</td></tr>
                        )}
                        {rows.map((r: any) => (
                            <tr key={r.mentee.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                                <td className="px-4 py-3">
                                    <Link href={`/mentees/m/${r.mentee.id}`} className="flex items-center gap-3">
                                        <Avatar firstName={r.mentee.firstName} lastName={r.mentee.lastName} src={r.mentee.avatar} size="sm" />
                                        <span>
                                            <span className="flex items-center gap-2 font-medium text-foreground">{r.mentee.firstName} {r.mentee.lastName}{atRisk(r.metrics) && <Badge variant="error">Cần chú ý</Badge>}</span>
                                            <span className="block text-xs text-muted-foreground">{r.mentee.menteeProfile?.studentId || r.mentee.email}</span>
                                        </span>
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{r.mentorName}</td>
                                <td className="px-4 py-3">{pct(r.metrics.present, r.metrics.meetingsHeld)} <span className="text-xs text-muted-foreground">({r.metrics.present}/{r.metrics.meetingsHeld}{r.metrics.late ? `, trễ ${r.metrics.late}` : ""})</span></td>
                                <td className="px-4 py-3">{pct(r.metrics.reflectionsSubmitted, r.metrics.meetingsHeld)} <span className="text-xs text-muted-foreground">({r.metrics.reflectionsSubmitted}/{r.metrics.meetingsHeld})</span></td>
                                <td className="px-4 py-3">{r.metrics.submissions30d}</td>
                                <td className="px-4 py-3 text-muted-foreground">{r.metrics.lastActiveAt ? formatDate(r.metrics.lastActiveAt, "dd/MM/yyyy HH:mm") : "Chưa có"}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={r.metrics.score >= 70 ? "success" : r.metrics.score >= 40 ? "secondary" : "error"}>{r.metrics.score}</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

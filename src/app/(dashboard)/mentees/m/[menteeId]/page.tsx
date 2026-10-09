import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileChips } from "@/components/features/files/file-chips";
import { SelfieViewButton } from "@/components/features/files/selfie-view-button";
import { getMenteeFullProfile } from "@/lib/actions/mentee-tracking";
import { formatDate } from "@/lib/utils";

function Field({ label, value }: { label: string; value?: string | number | null }) {
    if (!value) return null;
    return (
        <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="whitespace-pre-wrap text-sm text-foreground">{value}</p>
        </div>
    );
}

export default async function MenteeProfile360({ params }: { params: Promise<{ menteeId: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    if ((session.user as any).role === "mentee") redirect("/");

    const { menteeId } = await params;
    const data = await getMenteeFullProfile(menteeId);
    if (!data) notFound();

    const { user, attendances, reflections, submissions, tickets, metrics } = data;
    const p = user.menteeProfile;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild><Link href="/mentees/overview" aria-label="Quay lại"><ArrowLeft className="w-4 h-4" /></Link></Button>
                <Avatar firstName={user.firstName} lastName={user.lastName} src={user.avatar} size="lg" />
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">{user.firstName} {user.lastName}</h1>
                    <p className="text-sm text-muted-foreground">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
                </div>
                <Badge className="ml-auto" variant={metrics.score >= 70 ? "success" : metrics.score >= 40 ? "secondary" : "error"}>Điểm nhiệt tình {metrics.score}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    ["Chuyên cần", `${metrics.present}/${metrics.meetingsHeld}`],
                    ["Đi muộn", String(metrics.late)],
                    ["Thu hoạch đã nộp", `${metrics.reflectionsSubmitted}/${metrics.meetingsHeld}`],
                    ["Ngày hoạt động (14 ngày)", String(metrics.activeDays14d)],
                ].map(([k, v]) => (
                    <Card key={k} className="p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="text-xl font-semibold text-foreground">{v}</p></Card>
                ))}
            </div>

            <Card className="p-5 space-y-4">
                <h2 className="font-semibold text-foreground">Hồ sơ đầu vào</h2>
                {!p?.isOnboardingComplete && <p className="text-sm text-muted-foreground">Mentee chưa hoàn thành hồ sơ đầu vào.</p>}
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Mã sinh viên" value={p?.studentId} />
                    <Field label="Ngành / Năm" value={[p?.major, p?.year && `Năm ${p.year}`].filter(Boolean).join(" · ")} />
                    <Field label="Điểm mạnh" value={p?.strengths} />
                    <Field label="Điểm yếu" value={p?.weaknesses} />
                    <Field label="Kỹ năng" value={p?.skills} />
                    <Field label="Kỹ năng mềm" value={p?.softSkills} />
                    <Field label="Liên kết liên hệ" value={p?.contactLink} />
                    <Field label="Khó khăn hiện tại" value={p?.currentChallenges} />
                    <Field label="Mong muốn" value={p?.expectations} />
                    <Field label="Mục tiêu nghề nghiệp" value={p?.careerGoals} />
                    <Field label="Ghi chú" value={p?.personalNotes} />
                </div>
            </Card>

            <Card className="p-5 space-y-3">
                <h2 className="font-semibold text-foreground">Điểm danh gần đây</h2>
                {attendances.length === 0 && <p className="text-sm text-muted-foreground">Chưa có lượt check-in.</p>}
                {attendances.map((a: any) => (
                    <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-border pb-2 last:border-0">
                        <span className="text-foreground">{a.meeting.title} <span className="text-muted-foreground">· {formatDate(a.checkInTime, "HH:mm dd/MM/yyyy")}</span></span>
                        <span className="flex items-center gap-2">
                            {a.lateMinutes > 0 && <Badge variant="warning">Trễ {a.lateMinutes} phút</Badge>}
                            {a.selfieFileId && <SelfieViewButton fileId={a.selfieFileId} />}
                        </span>
                    </div>
                ))}
            </Card>

            <Card className="p-5 space-y-4">
                <h2 className="font-semibold text-foreground">Thu hoạch</h2>
                {reflections.length === 0 && <p className="text-sm text-muted-foreground">Chưa có thu hoạch.</p>}
                {reflections.map((r: any) => (
                    <div key={r.id} className="space-y-2 border-b border-border pb-3 last:border-0">
                        <p className="text-sm font-medium text-foreground">{r.meeting.title} <span className="text-muted-foreground font-normal">· {formatDate(r.meeting.scheduledAt, "dd/MM/yyyy")}</span></p>
                        <FileChips files={r.files} />
                        {r.linkUrl && <a href={r.linkUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4 break-all"><ExternalLink className="w-4 h-4 shrink-0" />{r.linkUrl}</a>}
                        {r.mentorFeedback && <p className="text-sm text-muted-foreground">Nhận xét: {r.mentorFeedback}</p>}
                    </div>
                ))}
            </Card>

            <Card className="p-5 space-y-4">
                <h2 className="font-semibold text-foreground">Bài tập và thực hành</h2>
                {submissions.length === 0 && <p className="text-sm text-muted-foreground">Chưa có bài nộp.</p>}
                {submissions.map((s: any) => (
                    <div key={s.id} className="space-y-2 border-b border-border pb-3 last:border-0">
                        <p className="text-sm font-medium text-foreground">{s.title} <Badge variant="outline">{s.status}</Badge></p>
                        <FileChips files={s.files} />
                        {s.linkUrl && <a href={s.linkUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4 break-all"><ExternalLink className="w-4 h-4 shrink-0" />{s.linkUrl}</a>}
                    </div>
                ))}
            </Card>

            {tickets.length > 0 && (
                <Card className="p-5 space-y-2">
                    <h2 className="font-semibold text-foreground">Câu hỏi / ticket</h2>
                    {tickets.map((t: any) => (
                        <Link key={t.id} href={`/tickets/${t.id}`} className="flex justify-between text-sm hover:underline"><span>{t.title}</span><Badge variant="outline">{t.status}</Badge></Link>
                    ))}
                </Card>
            )}
        </div>
    );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, Clock, Target, ArrowRight, FileText, AlertTriangle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SystemClock, Countdown } from "@/components/ui/fomo-timer";

import { redirect } from "next/navigation";

export default async function MentorDashboard() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const userId = session.user.id;
    const role = (session.user as any).role;
    const isAdmin = role === "admin";

    // Admin sees all, mentor sees only theirs
    const mentorFilter = isAdmin ? {} : { mentorId: userId };
    const meetingFilter = isAdmin
        ? { status: "scheduled" }
        : { mentorship: { mentorId: userId }, status: "scheduled" };

    try {
        const allMeetingFilter = isAdmin
            ? {}
            : { mentorship: { mentorId: userId } };

        const [mentorships, upcomingMeetings, allMeetings] = await Promise.all([
            prisma.mentorship.findMany({
                where: mentorFilter,
                include: {
                    mentees: { include: { mentee: true } },
                    programCycle: true,
                    mentor: true,
                    goals: {
                        where: {
                            status: { not: "completed" },
                            dueDate: { not: null }
                        }
                    }
                }
            }),
            prisma.meeting.findMany({
                where: meetingFilter,
                orderBy: { scheduledAt: "asc" },
                take: 5
            }),
            prisma.meeting.findMany({
                where: allMeetingFilter,
                include: {
                    minutes: {
                        select: { id: true, status: true, submittedAt: true, approvedAt: true }
                    },
                    mentorship: {
                        select: { id: true, mentor: { select: { firstName: true, lastName: true } } }
                    }
                },
                orderBy: { scheduledAt: "asc" },
            })
        ]);

        const serializedMentorships = JSON.parse(JSON.stringify(mentorships || []));
        const serializedUpcomingMeetings = JSON.parse(JSON.stringify(upcomingMeetings || []));
        const serializedAllMeetings = JSON.parse(JSON.stringify(allMeetings || []));

        const totalMentees = serializedMentorships.reduce((acc: number, m: any) => acc + m.mentees.length, 0);

        const stats = [
            { title: "Mentees", value: totalMentees, icon: <Users /> },
            { title: "Buổi họp sắp tới", value: serializedUpcomingMeetings.length, icon: <Calendar /> },
            { title: "Mentorship", value: serializedMentorships.length, icon: <CheckCircle /> },
        ];

        return (
            <div className="space-y-8 pb-32 animate-fade-in">
                {isAdmin && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl text-xs text-muted-foreground/60 no-uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Chế độ Admin Preview — dữ liệu toàn hệ thống
                    </div>
                )}
                <div className="space-y-1">
                    <SystemClock />
                    <h1 className="text-2xl font-semibold text-foreground mt-4">Bảng điều khiển Mentor</h1>
                    <p className="text-sm text-muted-foreground mt-1">{isAdmin ? "Xem trước giao diện Mentor (tổng hợp dữ liệu toàn hệ thống)" : `Chào buổi sáng, ${session?.user?.name || "Mentor"}.`}</p>
                </div>

                {/* Unified Countdown Section */}
                <div className="flex flex-col gap-4 w-full">
                    <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" />
                        Theo dõi thời gian &amp; Deadline
                    </h3>

                    {(() => {
                        // Deduplicate program cycles
                        const seenCycles = new Set<string>();
                        const uniqueCycles = serializedMentorships
                            .filter((m: any) => m.programCycle?.endDate)
                            .filter((m: any) => {
                                if (seenCycles.has(m.programCycle.id)) return false;
                                seenCycles.add(m.programCycle.id);
                                return true;
                            });

                        // Collect all goal deadlines
                        const goalDeadlines = serializedMentorships.flatMap((m: any) =>
                            m.goals.map((g: any) => ({
                                ...g,
                                menteeName: m.mentees?.[0]?.mentee?.firstName + ' ' + m.mentees?.[0]?.mentee?.lastName
                            }))
                        )
                            .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                            .slice(0, 6);

                        // Calculate maxDays from the longest countdown for consistent bar scale
                        const now = new Date();
                        const allDates = [
                            ...uniqueCycles.map((m: any) => new Date(m.programCycle.endDate)),
                            ...goalDeadlines.map((g: any) => new Date(g.dueDate)),
                        ];
                        const globalMaxDays = Math.max(
                            30,
                            ...allDates.map(d => Math.max(0, Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))))
                        );

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {uniqueCycles.map((m: any) => (
                                    <Countdown
                                        key={`cycle-${m.programCycle.id}`}
                                        targetDate={m.programCycle.endDate}
                                        label={`Thời gian còn lại: ${m.programCycle.name}`}
                                        maxDays={globalMaxDays}
                                    />
                                ))}
                                {goalDeadlines.map((goal: any) => (
                                    <Countdown
                                        key={goal.id}
                                        targetDate={goal.dueDate}
                                        label={goal.title}
                                        subtitle={`Mentee: ${goal.menteeName}`}
                                        maxDays={globalMaxDays}
                                    />
                                ))}
                            </div>
                        );
                    })()}

                    {serializedMentorships.length === 0 && (
                        <div className="py-4 text-center text-xs text-muted-foreground">
                            Chưa có chương trình hoạt động
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>

                {/* Meeting Minutes Tracking */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Theo dõi biên bản cuộc họp
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Đã duyệt
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                Đã nộp
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                Nháp
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                Chưa có
                            </span>
                        </div>
                    </div>

                    {serializedAllMeetings.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                            Chưa có cuộc họp nào.
                        </div>
                    ) : (
                        <div className="border border-border/40 rounded-xl overflow-hidden bg-card">
                            <div className="grid grid-cols-[1fr_120px_100px_100px] md:grid-cols-[1fr_160px_120px_120px] gap-0 px-4 py-2.5 bg-muted/30 border-b border-border/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                <span>Cuộc họp</span>
                                <span>Ngày</span>
                                <span>Trạng thái</span>
                                <span className="text-right">Biên bản</span>
                            </div>
                            <div className="divide-y divide-border/30 max-h-[400px] overflow-y-auto">
                                {serializedAllMeetings.map((meeting: any) => {
                                    const hasMinutes = meeting.minutes?.length > 0;
                                    const latestMinute = hasMinutes ? meeting.minutes[meeting.minutes.length - 1] : null;
                                    const minuteStatus = latestMinute?.status || null;

                                    let statusLabel = "Chưa có";
                                    let statusColor = "bg-rose-500/10 text-rose-600";
                                    let dotColor = "bg-rose-500";

                                    if (minuteStatus === "approved") {
                                        statusLabel = "Đã duyệt";
                                        statusColor = "bg-emerald-500/10 text-emerald-600";
                                        dotColor = "bg-emerald-500";
                                    } else if (minuteStatus === "submitted") {
                                        statusLabel = "Đã nộp";
                                        statusColor = "bg-blue-500/10 text-blue-600";
                                        dotColor = "bg-blue-500";
                                    } else if (minuteStatus === "draft") {
                                        statusLabel = "Nháp";
                                        statusColor = "bg-amber-500/10 text-amber-600";
                                        dotColor = "bg-amber-500";
                                    }

                                    return (
                                        <div key={meeting.id} className="grid grid-cols-[1fr_120px_100px_100px] md:grid-cols-[1fr_160px_120px_120px] gap-0 px-4 py-3 items-center hover:bg-muted/20 transition-colors group">
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold text-foreground truncate">
                                                    {meeting.sessionNumber ? `Buổi ${meeting.sessionNumber}: ` : ""}{meeting.title}
                                                </p>
                                            </div>
                                            <div className="text-[12px] text-muted-foreground font-medium">
                                                {formatDate(meeting.scheduledAt, "dd/MM/yyyy")}
                                            </div>
                                            <div>
                                                <Badge status={meeting.status} size="sm" />
                                            </div>
                                            <div className="flex justify-end">
                                                <Link
                                                    href={`/meetings/${meeting.id}`}
                                                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all hover:opacity-80 hover:scale-105 active:scale-95 ${statusColor}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                                    {statusLabel}
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {(() => {
                                const missing = serializedAllMeetings.filter((m: any) => !m.minutes?.length && ["completed", "cancelled"].indexOf(m.status) === -1);
                                if (missing.length === 0) return null;
                                return (
                                    <div className="px-4 py-2.5 bg-amber-500/5 border-t border-amber-500/20 flex items-center gap-2 text-[12px] text-amber-600 font-medium">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        {missing.length} cuộc họp chưa có biên bản
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold text-foreground">Danh sách Mentees</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {serializedMentorships.flatMap((m: any) => m.mentees).map((mt: any) => (
                                    <Link 
                                        key={mt.id}
                                        href={`/admin/mentorships/${mt.mentorshipId}`}
                                        className="group relative flex flex-col items-center p-5 rounded-xl border border-border/40 bg-card hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        
                                        <div className="relative mb-3">
                                            <Avatar
                                                firstName={mt.mentee?.firstName}
                                                lastName={mt.mentee?.lastName}
                                                src={mt.mentee?.avatar}
                                                size="lg"
                                            />
                                        </div>
                                        <p className="text-sm font-semibold text-foreground text-center truncate w-full">
                                            {mt.mentee?.firstName} {mt.mentee?.lastName}
                                        </p>
                                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium mt-1.5 px-2 py-0.5 rounded-full ${
                                            mt.status === "active"
                                                ? "text-emerald-600 bg-emerald-500/10"
                                                : "text-muted-foreground bg-muted"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                mt.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/40"
                                            }`} />
                                            {mt.status === "active" ? "Đang tham gia" : "Không hoạt động"}
                                        </span>
                                        <span className="text-[11px] text-primary font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            Xem hồ sơ
                                            <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Lịch họp sắp tới</h3>
                        <div className="space-y-4">
                            {serializedUpcomingMeetings.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-10 text-center border border-dashed rounded-xl bg-muted/20">Chưa có lịch họp nào.</p>
                            ) : (
                                serializedUpcomingMeetings.map((meeting: any) => (
                                    <div key={meeting.id} className="flex gap-5 p-5 rounded-xl border border-border bg-background group hover:border-foreground/20 transition-all shadow-none">
                                        <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex flex-col items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold leading-none no-uppercase">{formatDate(meeting.scheduledAt, "MMM")}</span>
                                            <span className="text-lg font-bold leading-none mt-1">{formatDate(meeting.scheduledAt, "dd")}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <p className="text-sm font-semibold text-foreground truncate">{meeting.title}</p>
                                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatDate(meeting.scheduledAt, "HH:mm")}
                                                </div>
                                                <Badge status={meeting.status} size="sm" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <Button className="w-full mt-4" variant="outline" asChild>
                                <Link href="/calendar">Xem tất cả lịch trình</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch mentor dashboard data:", error);
        return (
            <div className="p-8 border border-destructive/20 rounded-xl bg-destructive/5">
                <p className="text-destructive font-semibold mb-2">Đã có lỗi xảy ra khi tải dữ liệu:</p>
                <code className="text-xs bg-background p-2 rounded block overflow-auto whitespace-pre-wrap">
                    {error instanceof Error ? error.message : String(error)}
                </code>
            </div>
        );
    }
}

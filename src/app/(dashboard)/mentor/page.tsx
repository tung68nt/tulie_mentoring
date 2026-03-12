import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, Clock, Target, ArrowRight } from "lucide-react";
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
        const [mentorships, upcomingMeetings] = await Promise.all([
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
            })
        ]);

        const serializedMentorships = JSON.parse(JSON.stringify(mentorships || []));
        const serializedUpcomingMeetings = JSON.parse(JSON.stringify(upcomingMeetings || []));

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
                                        {/* Top accent */}
                                        <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="relative mb-3">
                                            <Avatar
                                                firstName={mt.mentee?.firstName}
                                                lastName={mt.mentee?.lastName}
                                                src={mt.mentee?.avatar}
                                                size="lg"
                                            />
                                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card ring-1 ring-black/5" />
                                        </div>
                                        <p className="text-sm font-bold text-foreground text-center truncate w-full">
                                            {mt.mentee?.firstName} {mt.mentee?.lastName}
                                        </p>
                                        <Badge 
                                            status={mt.status || "active"} 
                                            size="sm"
                                            className="mt-1.5"
                                        />
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

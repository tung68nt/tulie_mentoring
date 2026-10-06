import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Clock,
    Zap,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getMenteeStats } from "@/lib/actions/report";
import { getActivityLogs } from "@/lib/actions/activity";
import { getProgramGridData } from "@/lib/actions/daily";
import { getMenteeJourneyStats } from "@/lib/actions/journey";
import { StatsCards } from "@/components/features/reports/stats-cards";
import { ActivityFeed } from "@/components/features/reports/activity-feed";
import { ProgramGrid } from "@/components/features/daily/program-grid";
import { MenteeJourneyLog } from "@/components/features/mentees/mentee-journey-log";
import { SystemClock, Countdown } from "@/components/ui/fomo-timer";


export default async function MenteeDashboard() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const userId = session.user.id;
    const role = (session.user as any).role;
    const isAdmin = role === "admin";

    // Kiểm tra trạng thái khảo sát đầu vào (Soft Gate - không chặn cứng)
    const menteeProfile = await prisma.menteeProfile.findUnique({
        where: { userId },
        select: { isOnboardingComplete: true, personalityType: true },
    });
    const needsOnboarding = role === "mentee" && !menteeProfile?.isOnboardingComplete;

    try {
        const [mentorship, goals, upcomingMeetings, stats, logs, gridData, journeyStats] = await Promise.all([
            prisma.mentorship.findFirst({
                where: isAdmin ? { status: "active" } : {
                    mentees: { some: { menteeId: userId } },
                    status: "active"
                },
                include: {
                    mentor: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            bio: true,
                        },
                    },
                    programCycle: true,
                },
            }).catch(e => { console.error("Mentorship fetch error:", e); return null; }),
            prisma.goal.findMany({
                where: isAdmin ? {} : {
                    mentorship: {
                        mentees: { some: { menteeId: userId } }
                    }
                },
                orderBy: { createdAt: "desc" },
                take: 4,
            }).catch(e => { console.error("Goals fetch error:", e); return []; }),
            prisma.meeting.findMany({
                where: isAdmin ? {
                    status: { in: ["scheduled", "ongoing"] }
                } : {
                    mentorship: {
                        mentees: { some: { menteeId: userId } }
                    },
                    status: { in: ["scheduled", "ongoing"] }
                },
                include: {
                    attendances: {
                        where: { userId }
                    }
                },
                orderBy: { scheduledAt: "asc" },
                take: 5,
            }).catch(e => { console.error("Meetings fetch error:", e); return []; }),
            getMenteeStats(userId).catch(e => {
                console.error("Stats fetch error:", e);
                return { attendanceRate: 0, avgGoalProgress: 0, taskCompletionRate: 0, recentActivitiesCount: 0 };
            }),
            getActivityLogs(8).catch(e => { console.error("Logs fetch error:", e); return []; }),
            getProgramGridData().catch(e => { console.error("Grid data fetch error:", e); return null; }),
            getMenteeJourneyStats(userId).catch(e => { console.error("Journey stats error:", e); return null; }),
        ]);

        const serializedMentorship = JSON.parse(JSON.stringify(mentorship));
        const serializedGoals = JSON.parse(JSON.stringify(goals || []));
        const serializedUpcomingMeetings = JSON.parse(JSON.stringify(upcomingMeetings || []));
        const serializedJourneyStats = journeyStats ? JSON.parse(JSON.stringify(journeyStats)) : null;

        // Nhận diện buổi họp đang diễn ra (Live Session)
        const ongoingMeeting = serializedUpcomingMeetings.find((m: any) => m.status === "ongoing");
        const hasCheckedInOngoing = ongoingMeeting?.attendances?.some((a: any) => a.checkInTime);

        return (
            <div className="space-y-8 pb-32">
                {/* Onboarding & DISC Survey Reminder Banner */}
                {needsOnboarding && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                        Khảo sát đầu vào & Trắc nghiệm tính cách DISC
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">
                                        Chưa hoàn thành
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    Bạn chưa hoàn tất khảo sát hồ sơ & bài trắc nghiệm DISC
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                                    Dữ liệu tính cách và định hướng cá nhân giúp Mentor xây dựng lộ trình mentoring sát với năng lực của bạn nhất. Bạn vẫn có thể sử dụng các chức năng bình thường, nhưng vui lòng dành 3-5 phút hoàn tất nhé!
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" asChild className="rounded-xl h-9 px-4 font-semibold text-xs shadow-xs">
                                <Link href="/mentee/onboarding">
                                    Làm bài trắc nghiệm ngay
                                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Live Meeting Alert Banner */}
                {ongoingMeeting && !hasCheckedInOngoing && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in-50 duration-200">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                            </span>
                            <div>
                                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                    Buổi họp đang diễn ra: {ongoingMeeting.title}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Mentor đã mở phiên điểm danh. Vui lòng check-in khuôn mặt để ghi nhận quân số.
                                </p>
                            </div>
                        </div>
                        <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shrink-0">
                            <Link href={`/meetings/${ongoingMeeting.id}`}>
                                Check-in & Vào họp ngay
                            </Link>
                        </Button>
                    </div>
                )}

                {isAdmin && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl text-xs text-muted-foreground/60 no-uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Chế độ Admin Preview — dữ liệu toàn hệ thống
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <SystemClock />
                        <h1 className="text-2xl font-semibold text-foreground no-uppercase mt-4">Bảng điều khiển Mentee</h1>
                        <p className="text-sm text-muted-foreground/60 no-uppercase font-medium">Chào mừng bạn trở lại, {session?.user?.name || "Mentee"}.</p>
                    </div>
                    <Button variant="outline" className="rounded-xl no-uppercase h-11 px-6 font-medium" asChild>
                        <Link href="/reports">Xem báo cáo chi tiết</Link>
                    </Button>
                </div>

                {/* FOMO Countdowns */}
                <div className="flex flex-col gap-1 w-full max-w-2xl bg-muted/10 rounded-2xl p-4 border border-border/40">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Danh sách mục tiêu
                    </h3>
                    {serializedMentorship?.programCycle?.endDate && (
                        <Countdown
                            targetDate={serializedMentorship.programCycle.endDate}
                            label="Thời gian còn lại"
                        />
                    )}

                    {serializedGoals
                        .filter((g: any) => g.dueDate && g.status !== "completed")
                        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                        .map((goal: any) => (
                            <Countdown
                                key={goal.id}
                                targetDate={goal.dueDate}
                                label={goal.title}
                            />
                        ))}

                    {!isAdmin && !serializedMentorship && (
                        <div className="py-4 text-center text-xs text-muted-foreground">
                            Chưa có chương trình hoạt động
                        </div>
                    )}
                </div>

                {/* Mentee Journey & Diligence Metrics Log */}
                {serializedJourneyStats && (
                    <MenteeJourneyLog stats={serializedJourneyStats} />
                )}

                {/* New Stats Cards Component */}
                <StatsCards stats={stats} />

                {/* Program Tracker Grid Section */}
                {gridData && (
                    <Card className="p-6 shadow-none border-border/60 bg-background/50 backdrop-blur-sm">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground no-uppercase">Lộ trình rèn luyện</h3>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 no-uppercase">
                                        Theo dõi sự kỷ luật qua từng ngày và chinh phục các cột mốc quan trọng.
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground no-uppercase h-8 text-xs">
                                    <Link href="/reflections">Thu hoạch Mentoring</Link>
                                </Button>
                            </div>
                            <ProgramGrid
                                startDate={gridData.startDate}
                                endDate={gridData.endDate}
                                submittedDates={gridData.submittedDates}
                                deadlines={gridData.deadlines}
                                className="w-full overflow-x-auto pb-1 scrollbar-none"
                            />
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-12">

                        {/* Goal Progress Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-lg font-semibold text-foreground no-uppercase">Tiến độ mục tiêu</h3>
                                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground no-uppercase h-8">
                                    <Link href="/goals">Xem tất cả</Link>
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {serializedGoals.length > 0 ? (
                                    serializedGoals.map((goal: any) => (
                                        <Card key={goal.id} className="p-5 space-y-4 border-border/50 hover:border-primary/30 transition-colors rounded-xl shadow-none">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-foreground flex-1 pr-4 no-uppercase">{goal.title}</p>
                                                <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">{goal.currentValue}%</span>
                                            </div>
                                            <Progress value={goal.currentValue} size="sm" />
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full py-10 text-center bg-muted/20 border border-dashed border-border rounded-xl">
                                        <p className="text-xs text-muted-foreground no-uppercase">Chưa có mục tiêu nào được thiết lập.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-10">
                        {/* Upcoming Meetings (Moved up for better visibility) */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-sm font-semibold text-foreground no-uppercase">Lịch họp sắp tới</h3>
                                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground no-uppercase h-9 text-xs px-4">
                                    <Link href="/calendar">Xem lịch</Link>
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {serializedUpcomingMeetings.length === 0 ? (
                                    <div className="p-8 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-2">
                                        <Calendar className="w-6 h-6 text-muted-foreground/30 mx-auto" />
                                        <p className="text-xs text-muted-foreground no-uppercase">Hiện không có lịch họp.</p>
                                    </div>
                                ) : (
                                    serializedUpcomingMeetings.map((meeting: any) => (
                                        <div key={meeting.id} className="p-4 rounded-xl border border-border/60 flex items-center gap-4 hover:border-primary/20 transition-all bg-background shadow-none group">
                                            <div className="w-10 h-10 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center text-muted-foreground/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <p className="text-xs font-bold text-foreground truncate no-uppercase">{meeting.title}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(meeting.scheduledAt, "dd/MM · HH:mm")}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* New Activity Feed Component */}
                        <ActivityFeed logs={logs} />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch mentee dashboard data:", error);
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

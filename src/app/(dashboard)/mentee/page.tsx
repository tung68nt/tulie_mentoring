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
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getMenteeStats } from "@/lib/actions/report";
import { getActivityLogs } from "@/lib/actions/activity";
import { getProgramGridData } from "@/lib/actions/daily";
import { StatsCards } from "@/components/features/reports/stats-cards";
import { ActivityFeed } from "@/components/features/reports/activity-feed";
import { ProgramGrid } from "@/components/features/daily/program-grid";
import { SystemClock, Countdown } from "@/components/ui/fomo-timer";


export default async function MenteeDashboard() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const userId = session.user.id;
    const role = (session.user as any).role;
    const isAdmin = role === "admin";

    try {
        const [mentorship, goals, upcomingMeetings, stats, logs, gridData] = await Promise.all([
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
                    status: "scheduled"
                } : {
                    mentorship: {
                        mentees: { some: { menteeId: userId } }
                    },
                    status: "scheduled"
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
        ]);

        const serializedMentorship = JSON.parse(JSON.stringify(mentorship));
        const serializedGoals = JSON.parse(JSON.stringify(goals || []));
        const serializedUpcomingMeetings = JSON.parse(JSON.stringify(upcomingMeetings || []));

        return (
            <div className="space-y-10 pb-32 animate-fade-in">
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
                <div className="flex flex-wrap gap-6">
                    {serializedMentorship?.programCycle?.endDate && (
                        <Countdown
                            targetDate={serializedMentorship.programCycle.endDate}
                            label="Thời gian còn lại của chương trình"
                            className="bg-primary/5 border-primary/10 shadow-sm"
                        />
                    )}

                    {serializedGoals.find((g: any) => g.dueDate) && (
                        <Countdown
                            targetDate={serializedGoals.find((g: any) => g.dueDate).dueDate}
                            label={`Hạn chót mục tiêu: ${serializedGoals.find((g: any) => g.dueDate).title}`}
                            variant="warning"
                            className="shadow-sm"
                        />
                    )}

                    {!isAdmin && !serializedMentorship && (
                        <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                            Chưa có chương trình hoạt động
                        </div>
                    )}
                </div>

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
                                    <Link href="/daily">Nhật ký hằng ngày</Link>
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
                                                <p className="text-sm font-semibold text-foreground truncate flex-1 pr-4 no-uppercase">{goal.title}</p>
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
            <div className="p-10 text-center bg-destructive/5 rounded-xl border border-destructive/20">
                <p className="text-sm text-destructive font-medium">Không thể tải dữ liệu dashboard. Vui lòng kiểm tra kết nối và thử lại.</p>
            </div>
        );
    }
}

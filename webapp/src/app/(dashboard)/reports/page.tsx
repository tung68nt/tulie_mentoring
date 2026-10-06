import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProgramProgress, getMenteeStats } from "@/lib/actions/report";
import { getMenteeJourneyStats } from "@/lib/actions/journey";
import { getActivityLogs } from "@/lib/actions/activity";
import { ActivityFeed } from "@/components/features/reports/activity-feed";
import { ProgramMatrix } from "@/components/features/reports/program-matrix";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { 
    CheckCircle2, 
    Clock, 
    ListTodo, 
    Target, 
    Activity, 
    CalendarCheck, 
    BookOpen, 
    Flame, 
    FileCheck2, 
    Users, 
    TrendingUp 
} from "lucide-react";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ menteeId?: string }> }) {
    const { menteeId } = await searchParams;
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const userId = session.user.id!;
    const role = (session.user as any).role;
    const isAdmin = role === "admin" || role === "manager" || role === "program_manager";

    // If admin selects a mentee, targetUserId is that mentee. Otherwise its the current user.
    const targetUserId = (isAdmin && menteeId) ? menteeId : (role === "mentee" ? userId : null);

    try {
        const [logs, goals, tasks, programData, allMentees, targetUser, stats, journeyStats] = await Promise.all([
            getActivityLogs(15).catch(e => { console.error("Logs fetch error:", e); return []; }),
            prisma.goal.findMany({
                where: targetUserId ? {
                    mentorship: {
                        mentees: { some: { menteeId: targetUserId } }
                    }
                } : {},
                include: {
                    mentorship: {
                        include: {
                            mentor: { select: { firstName: true, lastName: true } },
                            mentees: { include: { mentee: { select: { firstName: true, lastName: true } } } }
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                take: 8,
            }).catch(e => { console.error("Goals fetch error:", e); return []; }),
            prisma.todoItem.findMany({
                where: targetUserId ? { menteeId: targetUserId } : {},
                include: {
                    mentee: { select: { firstName: true, lastName: true } }
                },
                orderBy: { updatedAt: "desc" },
                take: 10,
            }).catch(e => { console.error("Tasks fetch error:", e); return []; }),
            getProgramProgress(targetUserId || undefined).catch(e => { console.error("Program progress error:", e); return null; }),
            isAdmin ? prisma.user.findMany({
                where: { role: "mentee", isActive: true },
                select: { id: true, firstName: true, lastName: true, avatar: true },
                orderBy: { firstName: 'asc' }
            }) : Promise.resolve([]),
            targetUserId ? prisma.user.findUnique({
                where: { id: targetUserId },
                select: { id: true, firstName: true, lastName: true, avatar: true }
            }).catch(() => null) : Promise.resolve(null),
            getMenteeStats(targetUserId || undefined).catch(e => { console.error("Stats fetch error:", e); return null; }),
            targetUserId ? getMenteeJourneyStats(targetUserId).catch(e => { console.error("Journey stats error:", e); return null; }) : Promise.resolve(null),
        ]);

        const selectedMentee = targetUser || allMentees.find(m => m.id === targetUserId);
        const targetUserName = selectedMentee 
            ? `${selectedMentee.firstName || ""} ${selectedMentee.lastName || ""}`.trim() 
            : null;

        const serializedGoals = JSON.parse(JSON.stringify(goals || []));
        const serializedTasks = JSON.parse(JSON.stringify(tasks || []));

        // Calculate goal stats for summary
        const totalGoals = serializedGoals.length;
        const completedGoals = serializedGoals.filter((g: any) => g.status === "completed").length;
        const inProgressGoals = serializedGoals.filter((g: any) => g.status === "in_progress").length;

        // Task stats
        const totalTasks = serializedTasks.length;
        const doneTasks = serializedTasks.filter((t: any) => t.status === "done").length;
        const doingTasks = serializedTasks.filter((t: any) => t.status === "doing").length;

        // Rates
        const attendanceRate = journeyStats?.attendance.attendanceRate ?? stats?.attendanceRate ?? 0;
        const presentCount = journeyStats?.attendance.presentCount ?? stats?.presentMeetings ?? 0;
        const totalMeetingsCount = journeyStats?.attendance.totalMeetings ?? stats?.totalMeetings ?? 0;

        const goalProgress = stats?.avgGoalProgress ?? 0;
        const taskCompletion = stats?.taskCompletionRate ?? (totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0);

        return (
            <div className="space-y-8 pb-20 animate-fade-in px-4 md:px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Báo cáo & Tiến độ chi tiết</h1>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                            {targetUserId
                                ? `Báo cáo chi tiết cho: ${targetUserName || "Học viên"}`
                                : "Tổng quan tiến độ mục tiêu, công việc và hoạt động của toàn bộ chương trình."}
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="flex flex-wrap gap-2">
                            <Button variant={!menteeId ? "default" : "outline"} size="sm" asChild className="h-9 shadow-xs">
                                <Link href="/reports">Tiến độ chung</Link>
                            </Button>
                            {allMentees.slice(0, 3).map(m => (
                                <Button
                                    key={m.id}
                                    variant={menteeId === m.id ? "default" : "outline"}
                                    size="sm"
                                    asChild
                                    className="h-9 shadow-xs"
                                >
                                    <Link href={`/reports?menteeId=${m.id}`}>
                                        {m.firstName} {m.lastName}
                                    </Link>
                                </Button>
                            ))}
                            {allMentees.length > 3 && (
                                <Button variant="outline" size="sm" asChild className="h-9 border-dashed">
                                    <Link href="/mentees">Xem thêm...</Link>
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Stat Cards Section - Flat Clean Solid Aesthetic (No Gradients) */}
                {targetUserId ? (
                    /* Mentee-Specific Stat Cards (6 cards) */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                        {/* 1. Chuyên cần */}
                        <div className="bg-card border border-border/70 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-border transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Chuyên cần</span>
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <CalendarCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <div className="text-2xl font-bold tracking-tight text-foreground">{attendanceRate}%</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    {presentCount}/{totalMeetingsCount} buổi tham gia
                                </div>
                                <div className="w-full bg-muted/60 rounded-full h-1 mt-2.5 overflow-hidden">
                                    <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.min(100, attendanceRate)}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Thu hoạch Mentoring */}
                        <div className="bg-card border border-border/70 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-border transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Thu hoạch Mentoring</span>
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <div className="text-2xl font-bold tracking-tight text-foreground">{journeyStats?.reflections.submittedCount ?? 0}</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                    {(journeyStats?.reflections.submittedCount ?? 0) > 0
                                        ? `${journeyStats?.reflections.submittedCount} bài thu hoạch buổi học`
                                        : "Chưa có bài thu hoạch"}
                                </div>
                                <div className="w-full bg-muted/60 rounded-full h-1 mt-2.5 overflow-hidden">
                                    <div
                                        className="bg-purple-500 h-full transition-all"
                                        style={{
                                            width: `${Math.min(100, totalMeetingsCount > 0 ? ((journeyStats?.reflections.submittedCount ?? 0) / totalMeetingsCount) * 100 : ((journeyStats?.reflections.submittedCount ?? 0) > 0 ? 100 : 0))}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Bài tập thực hành */}
                        <div className="bg-card border border-border/70 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-border transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Bài tập thực hành</span>
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <FileCheck2 className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <div className="text-2xl font-bold tracking-tight text-foreground">
                                    {(journeyStats?.assignments.totalAssigned ?? 0) > 0 ? `${journeyStats?.assignments.submissionRate ?? 0}%` : "0%"}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    {(journeyStats?.assignments.totalAssigned ?? 0) > 0
                                        ? `${journeyStats?.assignments.submittedCount ?? 0}/${journeyStats?.assignments.totalAssigned} bài đã nộp`
                                        : "Chưa có bài tập giao"}
                                </div>
                                <div className="w-full bg-muted/60 rounded-full h-1 mt-2.5 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full transition-all"
                                        style={{
                                            width: `${Math.min(100, (journeyStats?.assignments.totalAssigned ?? 0) > 0 ? (journeyStats?.assignments.submissionRate ?? 0) : 0)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. Tiến độ mục tiêu */}
                        <div className="bg-card border border-border/70 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-border transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Tiến độ mục tiêu</span>
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                    <Target className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <div className="text-2xl font-bold tracking-tight text-foreground">{goalProgress}%</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    {totalGoals > 0 ? `${completedGoals}/${totalGoals} mục tiêu xong` : "Chưa đặt mục tiêu"}
                                </div>
                                <div className="w-full bg-muted/60 rounded-full h-1 mt-2.5 overflow-hidden">
                                    <div className="bg-amber-500 h-full transition-all" style={{ width: `${Math.min(100, goalProgress)}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* 5. Công việc */}
                        <div className="bg-card border border-border/70 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-border transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Công việc</span>
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    <ListTodo className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <div className="text-2xl font-bold tracking-tight text-foreground">{taskCompletion}%</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    {totalTasks > 0 ? `${doneTasks}/${totalTasks} việc hoàn thành` : "Chưa có công việc nào"}
                                </div>
                                <div className="w-full bg-muted/60 rounded-full h-1 mt-2.5 overflow-hidden">
                                    <div className="bg-indigo-500 h-full transition-all" style={{ width: `${Math.min(100, taskCompletion)}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* 6. Chỉ số nỗ lực */}
                        <div className="bg-card border border-border/70 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-border transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Chỉ số nỗ lực</span>
                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                    <Flame className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <div className="text-2xl font-bold tracking-tight text-foreground">{journeyStats?.engagementScore ?? 0}<span className="text-xs font-normal text-muted-foreground">/100</span></div>
                                <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                                    {journeyStats?.levelLabel ?? "Đang cập nhật"}
                                </div>
                                <div className="w-full bg-muted/60 rounded-full h-1 mt-2.5 overflow-hidden">
                                    <div className="bg-rose-500 h-full transition-all" style={{ width: `${Math.min(100, journeyStats?.engagementScore ?? 0)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Global Program Overview Stat Cards (5 cards) */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {/* 1. Chuyên cần chung */}
                        <div className="bg-card border border-border/70 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-border transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Chuyên cần chung</span>
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <CalendarCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <div className="text-2xl font-bold tracking-tight text-foreground">{attendanceRate}%</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    {presentCount}/{totalMeetingsCount} lượt có mặt
                                </div>
                                <div className="w-full bg-muted/60 rounded-full h-1 mt-2.5 overflow-hidden">
                                    <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.min(100, attendanceRate)}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Tiến độ mục tiêu */}
                        <div className="bg-card border border-border/70 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-border transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Tiến độ mục tiêu</span>
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                    <Target className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <div className="text-2xl font-bold tracking-tight text-foreground">{goalProgress}%</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    {completedGoals}/{totalGoals} mục tiêu xong
                                </div>
                                <div className="w-full bg-muted/60 rounded-full h-1 mt-2.5 overflow-hidden">
                                    <div className="bg-amber-500 h-full transition-all" style={{ width: `${Math.min(100, goalProgress)}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* 3. Công việc */}
                        <div className="bg-card border border-border/70 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-border transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Tỉ lệ xong việc</span>
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    <ListTodo className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <div className="text-2xl font-bold tracking-tight text-foreground">{taskCompletion}%</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    {doneTasks}/{totalTasks} việc hoàn thành
                                </div>
                                <div className="w-full bg-muted/60 rounded-full h-1 mt-2.5 overflow-hidden">
                                    <div className="bg-indigo-500 h-full transition-all" style={{ width: `${Math.min(100, taskCompletion)}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* 4. Tổng Mentee */}
                        <div className="bg-card border border-border/70 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-border transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Học viên hoạt động</span>
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <div className="text-2xl font-bold tracking-tight text-foreground">{allMentees.length}</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    Mentee đang tham gia
                                </div>
                                <div className="mt-2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                    Toàn bộ khóa học
                                </div>
                            </div>
                        </div>

                        {/* 5. Tương tác tuần qua */}
                        <div className="bg-card border border-border/70 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-border transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Hoạt động tuần qua</span>
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <div className="text-2xl font-bold tracking-tight text-foreground">{stats?.recentActivitiesCount ?? 0}</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    Tương tác ghi nhận
                                </div>
                                <div className="mt-2 text-[10px] font-medium text-purple-600 dark:text-purple-400">
                                    7 ngày gần nhất
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Heatmap */}
                {programData && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 no-uppercase">
                            <Activity className="w-4 h-4 text-purple-500" />
                            Bản đồ hoạt động {targetUserId ? "(Cá nhân)" : "(Chương trình)"}
                        </h3>
                        <ProgramMatrix
                            startDate={programData.startDate}
                            endDate={programData.endDate}
                            activityMap={programData.activityMap}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Goals Detail */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Detailed Goal Progress */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 no-uppercase">
                                    <Target className="w-4 h-4 text-purple-500" />
                                    Chi tiết mục tiêu
                                </h3>
                                <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-bold no-uppercase">
                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Xong: {completedGoals}</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Đang làm: {inProgressGoals}</span>
                                </div>
                            </div>
                            {serializedGoals.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {serializedGoals.map((goal: any) => (
                                        <Card key={goal.id} className="p-5 space-y-4 shadow-none border-border/60 bg-background/50 hover:border-primary/20 transition-all" hover>
                                            <div className="flex items-center justify-between gap-4">
                                                <p className="text-sm font-bold text-foreground truncate flex-1 pr-2 no-uppercase">{goal.title}</p>
                                                <span className="text-xs font-bold text-muted-foreground tabular-nums">
                                                    {Math.round((goal.currentValue / (goal.targetValue || 100)) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-primary h-full transition-all duration-500"
                                                    style={{ width: `${Math.min(100, Math.round((goal.currentValue / (goal.targetValue || 100)) * 100))}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-bold text-muted-foreground no-uppercase opacity-80">
                                                    {goal.status === "completed" ? "Hoàn thành" : "Đang thực hiện"}
                                                </p>
                                                {isAdmin && goal.mentorship && (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar
                                                            firstName={goal.mentorship.mentees?.[0]?.mentee?.firstName}
                                                            lastName={goal.mentorship.mentees?.[0]?.mentee?.lastName}
                                                            src={goal.mentorship.mentees?.[0]?.mentee?.avatar}
                                                            size="xs"
                                                        />
                                                        <span className="text-[10px] whitespace-nowrap overflow-hidden text-muted-foreground font-semibold">
                                                            {goal.mentorship.mentees?.[0]?.mentee?.firstName}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                                    <p className="text-xs font-medium text-muted-foreground">Chưa có mục tiêu nào trong chế độ này.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Tasks + Activity */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Tasks Breakdown */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 no-uppercase">
                                    <ListTodo className="w-4 h-4 text-green-500" />
                                    Công việc
                                </h3>
                                <span className="text-xs font-bold text-muted-foreground no-uppercase">{doneTasks}/{totalTasks} Xong</span>
                            </div>

                            {totalTasks > 0 && (
                                <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-muted">
                                    <div className="bg-green-500 transition-all shadow-sm" style={{ width: `${(doneTasks / totalTasks) * 100}%` }} />
                                    <div className="bg-blue-500 transition-all shadow-sm" style={{ width: `${(doingTasks / totalTasks) * 100}%` }} />
                                </div>
                            )}

                            {serializedTasks.length > 0 ? (
                                <div className="space-y-2">
                                    {serializedTasks.map((task: any) => (
                                        <div key={task.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm group hover:border-primary/20 transition-all shadow-none">
                                            {task.status === "done" ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                            ) : task.status === "doing" ? (
                                                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[13px] truncate no-uppercase ${task.status === "done" ? "line-through text-muted-foreground opacity-60" : "text-foreground font-semibold"}`}>
                                                    {task.title}
                                                </p>
                                                {isAdmin && task.mentee && (
                                                    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                        {task.mentee.firstName} {task.mentee.lastName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                                    <p className="text-xs font-medium text-muted-foreground">Không tìm thấy công việc nào.</p>
                                </div>
                            )}
                        </div>

                        {/* Activity Feed */}
                        <ActivityFeed logs={logs} />
                    </div>
                </div>
            </div>
        );

    } catch (error) {
        console.error("Failed to load reports:", error);
        return (
            <div className="p-12 text-center bg-destructive/5 rounded-2xl border border-destructive/20 m-10">
                <p className="font-semibold text-destructive mb-2 truncate">Không thể tải báo cáo</p>
                <p className="text-xs text-muted-foreground">Vui lòng kiểm tra lại kết nối hoặc thử lại sau.</p>
            </div>
        );
    }
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProgramProgress } from "@/lib/actions/report";
import { getActivityLogs } from "@/lib/actions/activity";
import { ActivityFeed } from "@/components/features/reports/activity-feed";
import { ProgramMatrix } from "@/components/features/reports/program-matrix";
import { DailyDiary } from "@/components/features/reports/daily-diary";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CheckCircle2, Clock, ListTodo, Target, Activity } from "lucide-react";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ menteeId?: string }> }) {
    const { menteeId } = await searchParams;
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const userId = session.user.id!;
    const role = (session.user as any).role;
    const isAdmin = role === "admin" || role === "viewer" || role === "program_manager";

    // If admin selects a mentee, targetUserId is that mentee. Otherwise its the current user.
    const targetUserId = (isAdmin && menteeId) ? menteeId : (role === "mentee" ? userId : null);

    try {
        const [logs, goals, tasks, programData, allMentees] = await Promise.all([
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
            }) : Promise.resolve([])
        ]);

        const selectedMentee = allMentees.find(m => m.id === targetUserId);

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

        return (
            <div className="space-y-10 pb-20 animate-fade-in px-4 md:px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold text-foreground">Báo cáo & Tiến độ chi tiết</h1>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                            {targetUserId
                                ? `Báo cáo chi tiết cho: ${selectedMentee?.firstName} ${selectedMentee?.lastName}`
                                : "Tổng quan tiến độ mục tiêu, công việc và hoạt động của toàn bộ chương trình."}
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="flex flex-wrap gap-2">
                            <Button variant={!menteeId ? "default" : "outline"} size="sm" asChild className="h-9 shadow-sm">
                                <Link href="/reports">Tiến độ chung</Link>
                            </Button>
                            {allMentees.slice(0, 3).map(m => (
                                <Button
                                    key={m.id}
                                    variant={menteeId === m.id ? "default" : "outline"}
                                    size="sm"
                                    asChild
                                    className="h-9 shadow-sm"
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
                    {/* Left Column: Daily Diary + Goals Detail */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Daily Diary */}
                        {programData && (
                            <DailyDiary
                                startDate={programData.startDate}
                                endDate={programData.endDate}
                                diaryMap={programData.diaryMap}
                            />
                        )}

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

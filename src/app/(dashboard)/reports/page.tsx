import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMenteeStats, getProgramProgress } from "@/lib/actions/report";
import { getActivityLogs } from "@/lib/actions/activity";
import { StatsCards } from "@/components/features/reports/stats-cards";
import { ActivityFeed } from "@/components/features/reports/activity-feed";
import { ProgramMatrix } from "@/components/features/reports/program-matrix";
import { DailyDiary } from "@/components/features/reports/daily-diary";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/db";
import { CheckCircle2, Clock, ListTodo, Target } from "lucide-react";

export default async function ReportsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const userId = session.user.id!;
    const role = (session.user as any).role;
    const isAdmin = role === "admin" || role === "viewer";

    try {
        const [stats, logs, goals, tasks, programData] = await Promise.all([
            getMenteeStats(),
            getActivityLogs(10),
            prisma.goal.findMany({
                where: isAdmin ? {} : {
                    mentorship: {
                        mentees: { some: { menteeId: userId } }
                    }
                },
                orderBy: { createdAt: "desc" },
                take: 4,
            }),
            prisma.todoItem.findMany({
                where: isAdmin ? {} : { menteeId: userId },
                orderBy: { createdAt: "desc" },
                take: 6,
            }),
            getProgramProgress(),
        ]);

        const serializedGoals = JSON.parse(JSON.stringify(goals || []));
        const serializedTasks = JSON.parse(JSON.stringify(tasks || []));

        return (
            <div className="space-y-10 pb-20 animate-fade-in px-4 md:px-6 max-w-7xl mx-auto">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Báo cáo</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                        {role === "mentee"
                            ? "Theo dõi tiến độ học tập và rèn luyện của bạn thông qua các số liệu thống kê chi tiết."
                            : "Theo dõi tiến độ học tập và rèn luyện của toàn bộ sinh viên thông qua các số liệu thống kê."}
                    </p>
                </div>

                {/* Stats Overview */}
                <StatsCards stats={stats} />

                {/* Habit Tracking Matrix */}
                {programData && (
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-purple-500" />
                            Tần suất hoạt động
                        </h3>
                        <ProgramMatrix
                            startDate={programData.startDate}
                            endDate={programData.endDate}
                            activityMap={programData.activityMap}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Daily Diary */}
                    <div className="lg:col-span-8 space-y-10">
                        {programData && (
                            <DailyDiary
                                startDate={programData.startDate}
                                endDate={programData.endDate}
                                diaryMap={programData.diaryMap}
                            />
                        )}
                    </div>

                    {/* Right Column: Side Info */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Goal Progress */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <Target className="w-4 h-4 text-purple-500" />
                                Tiến độ mục tiêu
                            </h3>
                            {serializedGoals.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {serializedGoals.map((goal: any) => (
                                        <Card key={goal.id} className="p-4 space-y-3 shadow-none border-border/60 bg-background/50">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-foreground truncate flex-1 pr-4">{goal.title}</p>
                                                <span className="text-xs font-bold text-muted-foreground tabular-nums">{goal.currentValue || 0}%</span>
                                            </div>
                                            <Progress value={goal.currentValue || 0} size="sm" />
                                            <p className="text-[10px] text-muted-foreground">
                                                {goal.status === "completed" ? "Đã hoàn thành" : goal.status === "in_progress" ? "Đang thực hiện" : "Chưa bắt đầu"}
                                            </p>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center bg-muted/20 border border-dashed border-border rounded-xl">
                                    <p className="text-xs text-muted-foreground">Chưa có mục tiêu nào được thiết lập.</p>
                                </div>
                            )}
                        </div>

                        {/* Tasks Summary */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-green-500" />
                                Công việc gần đây
                            </h3>
                            {serializedTasks.length > 0 ? (
                                <div className="space-y-2">
                                    {serializedTasks.map((task: any) => (
                                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background/50 backdrop-blur-sm">
                                            {task.status === "done" ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                            )}
                                            <p className={`text-sm flex-1 truncate ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                                                {task.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center bg-muted/20 border border-dashed border-border rounded-xl">
                                    <p className="text-xs text-muted-foreground">Chưa có công việc nào.</p>
                                </div>
                            )}
                        </div>

                        <ActivityFeed logs={logs} />
                    </div>
                </div>
            </div>
        );

    } catch (error) {
        console.error("Failed to load reports:", error);
        return (
            <div className="space-y-10 pb-20 animate-fade-in">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Báo cáo</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                        Theo dõi tiến độ học tập và rèn luyện của bạn thông qua các số liệu thống kê.
                    </p>
                </div>
                <div className="p-10 text-center bg-destructive/5 rounded-xl border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.</p>
                </div>
            </div>
        );
    }
}

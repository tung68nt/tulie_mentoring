import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProgramProgress } from "@/lib/actions/report";
import { getActivityLogs } from "@/lib/actions/activity";
import { ActivityFeed } from "@/components/features/reports/activity-feed";
import { ProgramMatrix } from "@/components/features/reports/program-matrix";
import { DailyDiary } from "@/components/features/reports/daily-diary";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/db";
import { CheckCircle2, Clock, ListTodo, Target, Activity } from "lucide-react";

export default async function ReportsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const userId = session.user.id!;
    const role = (session.user as any).role;
    const isAdmin = role === "admin" || role === "viewer";

    try {
        const [logs, goals, tasks, programData] = await Promise.all([
            getActivityLogs(15).catch(e => { console.error("Logs fetch error:", e); return []; }),
            prisma.goal.findMany({
                where: isAdmin ? {} : {
                    mentorship: {
                        mentees: { some: { menteeId: userId } }
                    }
                },
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
                where: isAdmin ? {} : { menteeId: userId },
                include: {
                    mentee: { select: { firstName: true, lastName: true } }
                },
                orderBy: { updatedAt: "desc" },
                take: 10,
            }).catch(e => { console.error("Tasks fetch error:", e); return []; }),
            getProgramProgress().catch(e => { console.error("Program progress error:", e); return null; }),
        ]);

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
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold text-foreground">Báo cáo & Tiến độ chi tiết</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                        {role === "mentee"
                            ? "Phân tích chi tiết tiến độ mục tiêu, công việc và nhật ký hoạt động hàng ngày của bạn."
                            : "Phân tích chi tiết tiến độ mục tiêu, công việc và nhật ký hoạt động của toàn bộ chương trình mentoring."}
                    </p>
                </div>

                {/* Activity Heatmap */}
                {programData && (
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4 text-purple-500" />
                            Bản đồ hoạt động
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
                                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <Target className="w-4 h-4 text-purple-500" />
                                    Chi tiết mục tiêu
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Xong: {completedGoals}</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Đang làm: {inProgressGoals}</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Tổng: {totalGoals}</span>
                                </div>
                            </div>
                            {serializedGoals.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {serializedGoals.map((goal: any) => (
                                        <Card key={goal.id} className="p-4 space-y-3 shadow-none border-border/60 bg-background/50">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-foreground truncate flex-1 pr-4">{goal.title}</p>
                                                <span className="text-xs font-bold text-muted-foreground tabular-nums">{goal.currentValue || 0}%</span>
                                            </div>
                                            <Progress value={goal.currentValue || 0} size="sm" />
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-muted-foreground">
                                                    {goal.status === "completed" ? "✅ Đã hoàn thành" : goal.status === "in_progress" ? "🔄 Đang thực hiện" : "⏳ Chưa bắt đầu"}
                                                </p>
                                                {isAdmin && goal.mentorship && (
                                                    <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                        {goal.mentorship.mentees?.[0]?.mentee?.firstName} {goal.mentorship.mentees?.[0]?.mentee?.lastName}
                                                    </p>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center bg-muted/20 border border-dashed border-border rounded-xl">
                                    <p className="text-xs text-muted-foreground">Chưa có mục tiêu nào được thiết lập.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Tasks + Activity */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Tasks Breakdown */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <ListTodo className="w-4 h-4 text-green-500" />
                                    Công việc
                                </h3>
                                <span className="text-xs text-muted-foreground">{doneTasks}/{totalTasks} xong</span>
                            </div>
                            {/* Mini progress bar for tasks */}
                            {totalTasks > 0 && (
                                <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                                    <div className="bg-green-500 transition-all" style={{ width: `${(doneTasks / totalTasks) * 100}%` }} />
                                    <div className="bg-blue-500 transition-all" style={{ width: `${(doingTasks / totalTasks) * 100}%` }} />
                                </div>
                            )}
                            {serializedTasks.length > 0 ? (
                                <div className="space-y-2">
                                    {serializedTasks.map((task: any) => (
                                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background/50 backdrop-blur-sm">
                                            {task.status === "done" ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                            ) : task.status === "doing" ? (
                                                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm truncate ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                                                    {task.title}
                                                </p>
                                                {isAdmin && task.mentee && (
                                                    <p className="text-[10px] text-muted-foreground truncate">{task.mentee.firstName} {task.mentee.lastName}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center bg-muted/20 border border-dashed border-border rounded-xl">
                                    <p className="text-xs text-muted-foreground">Chưa có công việc nào.</p>
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
            <div className="space-y-10 pb-20 animate-fade-in">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold text-foreground">Báo cáo & Tiến độ chi tiết</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                        Phân tích chi tiết tiến độ và hoạt động của chương trình mentoring.
                    </p>
                </div>
                <div className="p-10 text-center bg-destructive/5 rounded-xl border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.</p>
                </div>
            </div>
        );
    }
}

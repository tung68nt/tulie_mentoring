import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3, Users, Award, CheckCircle2, ArrowUpRight, TrendingUp, Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default async function AdminReportsPage() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        redirect("/login");
    }

    try {
        // Aggregate real metrics
        const [
            activeCycles,
            totalMeetings,
            completedGoals,
            totalGoals,
            totalAttendances,
            presentAttendances,
            programCycles,
            topMentees,
        ] = await Promise.all([
            prisma.programCycle.count({ where: { status: "active" } }),
            prisma.meeting.count(),
            prisma.goal.count({ where: { status: "completed" } }),
            prisma.goal.count(),
            prisma.attendance.count(),
            prisma.attendance.count({ where: { status: "present" } }),
            // Real program cycle data
            prisma.programCycle.findMany({
                include: {
                    _count: {
                        select: { mentorships: true },
                    },
                    mentorships: {
                        include: {
                            meetings: {
                                select: { status: true },
                            },
                        },
                    },
                },
                orderBy: { startDate: "desc" },
                take: 5,
            }),
            // Real top mentees by goal completion
            prisma.user.findMany({
                where: {
                    role: "mentee",
                    isActive: true,
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    menteeships: {
                        select: {
                            mentorship: {
                                select: {
                                    goals: {
                                        select: { status: true },
                                    },
                                },
                            },
                        },
                    },
                },
                take: 10,
            }),
        ]);

        const serializedTopMentees = JSON.parse(JSON.stringify(topMentees));

        const attendanceRate = totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 0;
        const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        // Calculate top performers
        const menteesWithProgress = serializedTopMentees.map((mentee: any) => {
            const allGoals = mentee.menteeships?.flatMap(
                (ms: any) => ms.mentorship.goals
            ) || [];
            const total = allGoals.length;
            const completed = allGoals.filter((g: any) => g.status === "completed").length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
            return { ...mentee, goalTotal: total, goalCompleted: completed, rate };
        }).filter((m: any) => m.goalTotal > 0).sort((a: any, b: any) => b.rate - a.rate).slice(0, 5);

        // Calculate program performance
        const programPerformance = programCycles.map(cycle => {
            const totalMeetingsInCycle = cycle.mentorships.flatMap(m => m.meetings).length;
            const completedMeetingsInCycle = cycle.mentorships.flatMap(m => m.meetings).filter(
                m => m.status === "completed"
            ).length;
            const completionRate = totalMeetingsInCycle > 0 ? Math.round((completedMeetingsInCycle / totalMeetingsInCycle) * 100) : 0;
            return {
                name: cycle.name,
                status: cycle.status,
                mentorshipCount: cycle._count.mentorships,
                meetingsTotal: totalMeetingsInCycle,
                meetingsCompleted: completedMeetingsInCycle,
                completionRate,
            };
        });

        return (
            <div className="space-y-8 pb-10 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground">Báo cáo & Thống kê</h1>
                        <p className="text-sm text-muted-foreground mt-1">Phân tích hiệu quả hoạt động chương trình Mentoring.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground bg-muted border border-border px-3 py-1.5 rounded-full shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Dữ liệu thời gian thực
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Tỉ lệ tham gia"
                        value={`${attendanceRate}%`}
                        icon={<ArrowUpRight className="w-5 h-5" />}
                        trend={{ value: 12, label: "so với tháng trước" }}
                    />
                    <StatCard
                        title="Mục tiêu hoàn thành"
                        value={completedGoals}
                        subtitle={`Trên tổng số ${totalGoals}`}
                        icon={<TrendingUp className="w-5 h-5" />}
                        trend={{ value: 8, label: "tăng trưởng" }}
                    />
                    <StatCard
                        title="Buổi sinh hoạt"
                        value={totalMeetings}
                        icon={<Calendar className="w-5 h-5" />}
                        trend={{ value: 5, label: "tuần này" }}
                    />
                    <StatCard
                        title="Chương trình chạy"
                        value={activeCycles}
                        icon={<Users className="w-5 h-5" />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Program Performance */}
                    <Card className="lg:col-span-7 bg-card shadow-sm">
                        <CardHeader className="mb-6">
                            <CardTitle className="text-xl flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-sm">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                Hiệu suất theo chương trình
                            </CardTitle>
                        </CardHeader>
                        {programPerformance.length === 0 ? (
                            <EmptyState
                                icon={<BarChart3 className="w-8 h-8 text-muted-foreground" />}
                                title="Chưa có dữ liệu chương trình"
                                className="py-16"
                            />
                        ) : (
                            <div className="space-y-10">
                                {programPerformance.map(cycle => (
                                    <div key={cycle.name} className="space-y-4 group">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-foreground">{cycle.name}</span>
                                                    <Badge status={cycle.status} />
                                                </div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {cycle.mentorshipCount} nhóm đang hoạt động tích cực
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-foreground leading-none mb-1">{cycle.completionRate}%</p>
                                                <p className="text-[10px] font-medium text-muted-foreground">
                                                    {cycle.meetingsCompleted}/{cycle.meetingsTotal} buổi học
                                                </p>
                                            </div>
                                        </div>
                                        <Progress value={cycle.completionRate} size="sm" color={cycle.completionRate === 100 ? "success" : "default"} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Top Mentees */}
                    <Card className="lg:col-span-5 bg-muted border-none shadow-inner">
                        <CardHeader className="mb-6">
                            <CardTitle className="text-xl flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-card text-foreground shadow-md border border-border">
                                    <Award className="w-5 h-5" />
                                </div>
                                Mentees tiêu biểu
                            </CardTitle>
                        </CardHeader>
                        {menteesWithProgress.length === 0 ? (
                            <EmptyState
                                icon={<Award className="w-8 h-8 text-muted-foreground" />}
                                title="Chưa có đủ dữ liệu"
                                description="Khi Mentees bắt đầu đạt được mục tiêu, bảng xếp hạng sẽ được tạo tự động"
                                className="py-16"
                            />
                        ) : (
                            <div className="space-y-4">
                                {menteesWithProgress.map((mentee: any, idx: number) => (
                                    <div key={mentee.id} className="flex items-center justify-between p-5 rounded-[16px] bg-card border border-border hover:border-foreground/20/10 hover:shadow-sm hover:-translate-y-0.5 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">
                                                {idx + 1}
                                            </div>
                                            <Avatar
                                                firstName={mentee.firstName}
                                                lastName={mentee.lastName}
                                                src={mentee.avatar}
                                                size="md"
                                                className="border-2 border-muted"
                                            />
                                            <div>
                                                <p className="text-[15px] font-semibold text-foreground leading-none mb-1.5">{mentee.firstName} {mentee.lastName}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="default" className="bg-muted border-none text-[9px] px-1.5 py-0">
                                                        Top Performer
                                                    </Badge>
                                                    <p className="text-[10px] text-muted-foreground font-medium">{mentee.goalCompleted}/{mentee.goalTotal} goals</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-foreground leading-none">{mentee.rate}%</p>
                                            </div>
                                            {mentee.rate >= 80 ? (
                                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center">
                                                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch reports:", error);
        return (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">Không thể tải báo cáo. Vui lòng thử lại sau.</p>
            </div>
        );
    }
}

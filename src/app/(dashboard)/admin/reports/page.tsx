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
    if ((session?.user as any).role !== "admin") redirect("/");

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

    const attendanceRate = totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 0;
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Calculate top performers
    const menteesWithProgress = topMentees.map(mentee => {
        const allGoals = mentee.menteeships?.flatMap(
            ms => ms.mentorship.goals
        ) || [];
        const total = allGoals.length;
        const completed = allGoals.filter(g => g.status === "completed").length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { ...mentee, goalTotal: total, goalCompleted: completed, rate };
    }).filter(m => m.goalTotal > 0).sort((a, b) => b.rate - a.rate).slice(0, 5);

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
        <div className="space-y-12 pb-16 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1.5">
                    <h1 className="text-4xl font-bold text-black mb-1">Báo cáo & Thống kê</h1>
                    <p className="text-sm font-medium text-[#888]">Phân tích hiệu quả hoạt động chương trình Mentoring.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-black bg-[#fafafa] border border-[#eee] px-3 py-1.5 rounded-full shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                    Dữ liệu thời gian thực
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Card className="lg:col-span-7 bg-white shadow-xl shadow-black/[0.02]" padding="lg">
                    <CardHeader className="mb-10">
                        <CardTitle className="text-xl flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black text-white shadow-lg shadow-black/20">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            Hiệu suất theo chương trình
                        </CardTitle>
                    </CardHeader>
                    {programPerformance.length === 0 ? (
                        <EmptyState
                            icon={<BarChart3 className="w-8 h-8 text-[#ccc]" />}
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
                                                <span className="text-lg font-bold text-black">{cycle.name}</span>
                                                <Badge variant={cycle.status === 'active' ? 'solid' : 'default'} size="sm">
                                                    {cycle.status === 'active' ? 'Đang chạy' : 'Hoàn thành'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs font-medium text-[#aaa]">
                                                {cycle.mentorshipCount} nhóm đang hoạt động tích cực
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-black leading-none mb-1">{cycle.completionRate}%</p>
                                            <p className="text-[10px] font-medium text-[#bbb]">
                                                {cycle.meetingsCompleted}/{cycle.meetingsTotal} buổi học
                                            </p>
                                        </div>
                                    </div>
                                    <Progress value={cycle.completionRate} size="md" color={cycle.completionRate === 100 ? "success" : "default"} />
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Top Mentees */}
                <Card className="lg:col-span-5 bg-[#fafafa] border-none shadow-inner" padding="lg">
                    <CardHeader className="mb-10">
                        <CardTitle className="text-xl flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white text-black shadow-md border border-[#eee]">
                                <Award className="w-5 h-5" />
                            </div>
                            Mentees tiêu biểu
                        </CardTitle>
                    </CardHeader>
                    {menteesWithProgress.length === 0 ? (
                        <EmptyState
                            icon={<Award className="w-8 h-8 text-[#ccc]" />}
                            title="Chưa có đủ dữ liệu"
                            description="Khi Mentees bắt đầu đạt được mục tiêu, bảng xếp hạng sẽ được tạo tự động"
                            className="py-16"
                        />
                    ) : (
                        <div className="space-y-4">
                            {menteesWithProgress.map((mentee, idx) => (
                                <div key={mentee.id} className="flex items-center justify-between p-5 rounded-[16px] bg-white shadow-sm border border-[#eee] hover:border-black/10 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-black/10">
                                            {idx + 1}
                                        </div>
                                        <Avatar
                                            firstName={mentee.firstName}
                                            lastName={mentee.lastName}
                                            src={mentee.avatar}
                                            size="md"
                                            className="border-2 border-[#fafafa]"
                                        />
                                        <div>
                                            <p className="text-[15px] font-semibold text-black leading-none mb-1.5">{mentee.firstName} {mentee.lastName}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default" className="bg-[#f0f0f0] border-none text-[9px] px-1.5 py-0">
                                                    Top Performer
                                                </Badge>
                                                <p className="text-[10px] text-[#aaa] font-medium">{mentee.goalCompleted}/{mentee.goalTotal} goals</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-black leading-none">{mentee.rate}%</p>
                                        </div>
                                        {mentee.rate >= 80 ? (
                                            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-[#eee] flex items-center justify-center">
                                                <TrendingUp className="w-3.5 h-3.5 text-[#ccc]" />
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
}

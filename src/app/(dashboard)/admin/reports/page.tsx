import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
        <div className="space-y-10 pb-12 animate-fade-in">
            <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight text-black">Báo cáo & Thống kê</h1>
                <p className="text-sm text-[#666]">Phân tích hiệu quả hoạt động chương trình Mentoring.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Tỉ lệ tham gia"
                    value={`${attendanceRate}%`}
                    icon={<ArrowUpRight className="w-4 h-4" />}
                />
                <StatCard
                    title="Hoàn thành mục tiêu"
                    value={completedGoals}
                    subtitle={`Trên tổng số ${totalGoals}`}
                    icon={<TrendingUp className="w-4 h-4" />}
                />
                <StatCard
                    title="Buổi sinh hoạt"
                    value={totalMeetings}
                    icon={<Calendar className="w-4 h-4" />}
                />
                <StatCard
                    title="Chương trình đang chạy"
                    value={activeCycles}
                    icon={<Users className="w-4 h-4" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Program Performance */}
                <Card className="p-8">
                    <CardHeader className="mb-8">
                        <CardTitle className="text-lg flex items-center gap-2.5">
                            <BarChart3 className="w-5 h-5 text-[#999]" />
                            Hiệu suất theo chương trình
                        </CardTitle>
                    </CardHeader>
                    {programPerformance.length === 0 ? (
                        <EmptyState
                            icon={<BarChart3 className="w-6 h-6" />}
                            title="Chưa có dữ liệu chương trình"
                            className="py-12"
                        />
                    ) : (
                        <div className="space-y-8">
                            {programPerformance.map(cycle => (
                                <div key={cycle.name} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-black tracking-tight">{cycle.name}</span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider ${cycle.status === 'active' ? 'bg-black text-white' : 'bg-[#fafafa] text-[#999] border border-[#eaeaea]'}`}>
                                                    {cycle.status === 'active' ? 'Đang chạy' : 'Hoàn thành'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#999]">
                                                {cycle.mentorshipCount} nhóm đang tham gia
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium text-[#666]">
                                            {cycle.meetingsCompleted}/{cycle.meetingsTotal} buổi ({cycle.completionRate}%)
                                        </span>
                                    </div>
                                    <Progress value={cycle.completionRate} size="sm" color={cycle.completionRate === 100 ? "success" : "default"} />
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Top Mentees */}
                <Card className="p-8">
                    <CardHeader className="mb-8">
                        <CardTitle className="text-lg flex items-center gap-2.5">
                            <Award className="w-5 h-5 text-[#999]" />
                            Mentees tiêu biểu
                        </CardTitle>
                    </CardHeader>
                    {menteesWithProgress.length === 0 ? (
                        <EmptyState
                            icon={<Award className="w-6 h-6" />}
                            title="Chưa có đủ dữ liệu"
                            description="Khi Mentees bắt đầu đạt được mục tiêu, bảng xếp hạng sẽ được tạo tự động"
                            className="py-12"
                        />
                    ) : (
                        <div className="space-y-4">
                            {menteesWithProgress.map((mentee, idx) => (
                                <div key={mentee.id} className="flex items-center justify-between p-4 rounded-[8px] border border-[#eaeaea] bg-white hover:border-black transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-[#fafafa] border border-[#eaeaea] flex items-center justify-center text-[#666] font-bold text-[10px]">
                                            {idx + 1}
                                        </div>
                                        <Avatar
                                            firstName={mentee.firstName}
                                            lastName={mentee.lastName}
                                            src={mentee.avatar}
                                            size="sm"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-black leading-none mb-1">{mentee.firstName} {mentee.lastName}</p>
                                            <p className="text-[11px] text-[#999] font-medium">{mentee.goalCompleted}/{mentee.goalTotal} mục tiêu hoàn tất</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-black">{mentee.rate}%</span>
                                        </div>
                                        {mentee.rate >= 80 && <CheckCircle2 className="w-4 h-4 text-black" />}
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

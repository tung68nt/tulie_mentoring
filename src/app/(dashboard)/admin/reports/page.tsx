import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
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
        <div className="space-y-8 pb-10">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-black">Báo cáo & Thống kê</h1>
                <p className="text-[#666] text-sm">Phân tích hiệu quả hoạt động chương trình Mentoring</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 space-y-3" hover>
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[#666]">Tỉ lệ tham gia</p>
                        <ArrowUpRight className="w-4 h-4 text-[#999]" />
                    </div>
                    <h3 className="text-2xl font-bold text-black">{attendanceRate}%</h3>
                    <Progress value={attendanceRate} size="xs" color="success" />
                </Card>

                <Card className="p-5 space-y-3" hover>
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[#666]">Hoàn thành mục tiêu</p>
                        <TrendingUp className="w-4 h-4 text-[#999]" />
                    </div>
                    <h3 className="text-2xl font-bold text-black">{completedGoals}<span className="text-sm font-normal text-[#999]">/{totalGoals}</span></h3>
                    <Progress value={goalCompletionRate} size="xs" color="default" />
                </Card>

                <Card className="p-5 space-y-3" hover>
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[#666]">Buổi sinh hoạt</p>
                        <Calendar className="w-4 h-4 text-[#999]" />
                    </div>
                    <h3 className="text-2xl font-bold text-black">{totalMeetings}</h3>
                    <Progress value={Math.min(totalMeetings * 10, 100)} size="xs" color="default" />
                </Card>

                <Card className="p-5 space-y-3" hover>
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[#666]">Chương trình đang chạy</p>
                        <Users className="w-4 h-4 text-[#999]" />
                    </div>
                    <h3 className="text-2xl font-bold text-black">{activeCycles}</h3>
                    <Progress value={100} size="xs" color="success" />
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Program Performance - Real Data */}
                <Card className="p-6">
                    <h3 className="text-base font-semibold text-black mb-6 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#999]" />
                        Hiệu suất theo chương trình
                    </h3>
                    {programPerformance.length === 0 ? (
                        <EmptyState
                            icon={<BarChart3 className="w-5 h-5" />}
                            title="Chưa có dữ liệu chương trình"
                            className="py-8"
                        />
                    ) : (
                        <div className="space-y-5">
                            {programPerformance.map(cycle => (
                                <div key={cycle.name} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-black">{cycle.name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${cycle.status === 'active' ? 'bg-black text-white' : 'bg-[#f5f5f5] text-[#999]'}`}>
                                                {cycle.status === 'active' ? 'Đang chạy' : 'Hoàn thành'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-[#666]">
                                            {cycle.meetingsCompleted}/{cycle.meetingsTotal} buổi · {cycle.mentorshipCount} nhóm
                                        </span>
                                    </div>
                                    <Progress value={cycle.completionRate} size="sm" color={cycle.completionRate === 100 ? "success" : "default"} />
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Top Mentees - Real Data */}
                <Card className="p-6">
                    <h3 className="text-base font-semibold text-black mb-6 flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#999]" />
                        Mentees tiêu biểu
                    </h3>
                    {menteesWithProgress.length === 0 ? (
                        <EmptyState
                            icon={<Award className="w-5 h-5" />}
                            title="Chưa có đủ dữ liệu"
                            description="Khi Mentees bắt đầu đạt được mục tiêu, bảng xếp hạng sẽ được tạo tự động"
                            className="py-8"
                        />
                    ) : (
                        <div className="space-y-3">
                            {menteesWithProgress.map((mentee, idx) => (
                                <div key={mentee.id} className="flex items-center justify-between p-3 rounded-md border border-[#eaeaea] bg-white hover:border-black/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-[#fafafa] border border-[#eaeaea] flex items-center justify-center text-[#999] font-medium text-xs">
                                            {idx + 1}
                                        </div>
                                        <Avatar
                                            firstName={mentee.firstName}
                                            lastName={mentee.lastName}
                                            src={mentee.avatar}
                                            size="sm"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-black">{mentee.firstName} {mentee.lastName}</p>
                                            <p className="text-[10px] text-[#999]">{mentee.goalCompleted}/{mentee.goalTotal} mục tiêu đạt</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-black">{mentee.rate}%</span>
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

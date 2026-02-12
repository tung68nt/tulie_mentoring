import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import {
    BarChart3,
    Users,
    Calendar,
    Award,
    CheckCircle2,
    Clock,
    ArrowUpRight
} from "lucide-react";
import { redirect } from "next/navigation";
import { Progress } from "@/components/ui/progress";

export default async function AdminReportsPage() {
    const session = await auth();
    if ((session?.user as any).role !== "admin") redirect("/");

    // Aggregate metrics
    const [
        activeCycles,
        totalMeetings,
        completedGoals,
        totalAttendances,
        presentAttendances
    ] = await Promise.all([
        prisma.programCycle.count({ where: { status: "active" } }),
        prisma.meeting.count(),
        prisma.goal.count({ where: { status: "completed" } }),
        prisma.attendance.count(),
        prisma.attendance.count({ where: { status: "present" } }),
    ]);

    const attendanceRate = totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 100;

    return (
        <div className="space-y-10 pb-10">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-black">Báo cáo & Thống kê</h1>
                <p className="text-[#666] text-sm">Phân tích chuyên sâu về hiệu quả hoạt động của chương trình</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 space-y-3 stat-card-accent" hover>
                    <p className="text-xs font-medium text-[#666]">Tỉ lệ tham gia</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-[#0070f3]">{attendanceRate}%</h3>
                        <ArrowUpRight className="w-5 h-5 text-[#0070f3] mb-1" />
                    </div>
                    <Progress value={attendanceRate} size="xs" color="success" />
                </Card>
                <Card className="p-6 space-y-3 stat-card-accent" hover>
                    <p className="text-xs font-medium text-[#666]">Mục tiêu hoàn thành</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-[#7928ca]">{completedGoals}</h3>
                        <span className="text-xs font-medium text-[#999] mb-1">Mục tiêu</span>
                    </div>
                    <Progress value={65} size="xs" color="accent" />
                </Card>
                <Card className="p-6 space-y-3 stat-card-accent" hover>
                    <p className="text-xs font-medium text-[#666]">Buổi sinh hoạt</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-[#0070f3]">{totalMeetings}</h3>
                        <span className="text-xs font-medium text-[#999] mb-1">Buổi họp</span>
                    </div>
                    <Progress value={80} size="xs" color="success" />
                </Card>
                <Card className="p-6 space-y-3 stat-card-accent" hover>
                    <p className="text-xs font-medium text-[#666]">Chương trình chạy</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-[#f5a623]">{activeCycles}</h3>
                        <span className="text-xs font-medium text-[#999] mb-1">Chu kỳ</span>
                    </div>
                    <Progress value={100} size="xs" color="warning" />
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8">
                    <h3 className="text-lg font-semibold text-black mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Hiệu suất theo Chương trình
                    </h3>
                    <div className="space-y-6">
                        {[
                            { name: "Spring 2026", rate: 92, status: "Active" },
                            { name: "Autumn 2025", rate: 85, status: "Completed" },
                            { name: "Orientation 2025", rate: 100, status: "Completed" }
                        ].map(cycle => (
                            <div key={cycle.name} className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <span className="text-black">{cycle.name}</span>
                                    <span className="text-[#0070f3]">{cycle.rate}%</span>
                                </div>
                                <Progress value={cycle.rate} size="sm" color={cycle.rate === 100 ? "success" : "default"} />
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-8">
                    <h3 className="text-lg font-semibold text-black mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Mentees tiêu biểu
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-[8px] border border-[#eaeaea] bg-white hover:border-[#999] transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#f5a623]/10 flex items-center justify-center text-[#f5a623] font-semibold text-xs ring-2 ring-white ring-offset-2 ring-offset-[#f5a623]/5">#{i}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-black">Mentee Top Perform {i}</p>
                                        <p className="text-[10px] text-[#999] font-medium">Tiến độ 95%</p>
                                    </div>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-[#0070f3]" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

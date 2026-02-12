import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard } from "@/components/ui/card";
import { Users, UserCheck, Calendar, Bookmark, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
    const session = await auth();

    // Fetch real statistics
    const [
        totalUsers,
        activeMentors,
        activeMentees,
        totalMentorships,
        totalMeetings,
        totalGoals,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "mentor", isActive: true } }),
        prisma.user.count({ where: { role: "mentee", isActive: true } }),
        prisma.mentorship.count({ where: { status: "active" } }),
        prisma.meeting.count({ where: { status: "completed" } }),
        prisma.goal.count({ where: { status: "completed" } }),
    ]);

    const stats = [
        { title: "Tổng người dùng", value: totalUsers, icon: <Users />, color: "black" },
        { title: "Mentor hoạt động", value: activeMentors, icon: <UserCheck />, color: "black" },
        { title: "Mentees hoạt động", value: activeMentees, icon: <Users />, color: "black" },
        { title: "Cặp Mentoring", value: totalMentorships, icon: <Bookmark />, color: "black" },
    ];

    const secondaryStats = [
        { label: "Buổi họp hoàn thành", value: totalMeetings, icon: <Calendar />, trend: "+5", trendUp: true },
        { label: "Mục tiêu đạt được", value: totalGoals, icon: <TrendingUp />, trend: "85%", trendUp: true },
    ];

    return (
        <div className="space-y-10 pb-10">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-black tracking-tight">Tổng quan hệ thống</h1>
                <p className="text-[#666] text-sm">Chào mừng quay lại, {session?.user?.name || "Admin"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-black mb-8">Hoạt động gần đây</h3>
                    <div className="space-y-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-5 group">
                                <div className="w-10 h-10 rounded-full bg-[#fafafa] border border-[#eaeaea] flex items-center justify-center shrink-0 group-hover:border-black transition-all">
                                    <UserCheck className="w-5 h-5 text-[#666] group-hover:text-black" />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <p className="text-sm font-semibold text-black">Hệ thống gán mentor mới</p>
                                    <p className="text-sm text-[#666] leading-relaxed">Admin vừa tạo mentorship cho Program Cycle Spring 2026 giữa Mentor Nguyễn Văn A và 2 Mentees.</p>
                                    <p className="text-[12px] text-[#999] font-medium pt-1">2 giờ trước</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold text-black mb-8">Chỉ số hiệu quả</h3>
                    <div className="space-y-8">
                        {secondaryStats.map(stat => (
                            <div key={stat.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-[6px] bg-[#fafafa] border border-[#eaeaea] flex items-center justify-center text-[#999]">
                                        {stat.icon}
                                    </div>
                                    <span className="text-sm font-medium text-[#666]">{stat.label}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-black">{stat.value}</p>
                                    <span className="text-[12px] font-bold text-[#0070f3]">{stat.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

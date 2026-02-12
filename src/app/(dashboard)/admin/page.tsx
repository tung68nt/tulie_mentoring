import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard } from "@/components/ui/card";
import { Users, UserCheck, Calendar, Bookmark, TrendingUp, ArrowRight, Award } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRelative, getStatusLabel, getStatusColor } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboard() {
    const session = await auth();

    // Fetch real statistics and recent data
    const [
        totalUsers,
        activeMentors,
        activeMentees,
        totalMentorships,
        totalMeetings,
        totalGoals,
        recentMeetings,
        recentMentorships,
        recentNotifications,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "mentor", isActive: true } }),
        prisma.user.count({ where: { role: "mentee", isActive: true } }),
        prisma.mentorship.count({ where: { status: "active" } }),
        prisma.meeting.count({ where: { status: "completed" } }),
        prisma.goal.count({ where: { status: "completed" } }),
        prisma.meeting.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                creator: { select: { firstName: true, lastName: true, avatar: true } },
                mentorship: { include: { mentor: { select: { firstName: true, lastName: true } } } },
            },
        }),
        prisma.mentorship.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                mentor: { select: { firstName: true, lastName: true, avatar: true } },
                mentees: { include: { mentee: { select: { firstName: true, lastName: true } } } },
                programCycle: { select: { name: true } },
            },
        }),
        prisma.notification.findMany({
            where: { userId: session?.user?.id! },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
    ]);

    const stats = [
        { title: "Tổng người dùng", value: totalUsers, icon: <Users />, color: "black" as const },
        { title: "Mentor hoạt động", value: activeMentors, icon: <UserCheck />, color: "black" as const },
        { title: "Mentee hoạt động", value: activeMentees, icon: <Users />, color: "black" as const },
        { title: "Cặp Mentoring", value: totalMentorships, icon: <Bookmark />, color: "black" as const },
    ];

    return (
        <div className="space-y-12 pb-16 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-4xl font-black tracking-tightest text-black mb-1">Tổng quan hệ thống</h1>
                    <p className="text-sm font-medium text-[#888]">Chào mừng quay lại, <span className="text-black font-bold">{session?.user?.name || "Admin"}</span></p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="md" className="shadow-sm font-bold bg-[#fafafa]" asChild>
                        <Link href="/admin/users">Quản lý người dùng</Link>
                    </Button>
                    <Button size="md" className="shadow-lg shadow-black/10 font-bold" asChild>
                        <Link href="/admin/mentorships/new">Tạo Mentorship</Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <StatCard
                        key={stat.title}
                        {...stat}
                        trend={idx % 2 === 0 ? { value: 5 + idx, label: "tăng trưởng" } : undefined}
                    />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Recent Activities - Real Data */}
                <Card className="lg:col-span-8 bg-white shadow-xl shadow-black/[0.02]" padding="lg">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-bold text-black tracking-tight flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-black rounded-full" />
                            Hoạt động gần đây
                        </h3>
                        <Link href="/admin/reports" className="text-xs font-black text-[#888] hover:text-black transition-all flex items-center gap-1.5 bg-[#fafafa] px-3 py-1.5 rounded-full border border-[#eee]">
                            Xem tất cả báo cáo <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentMeetings.length === 0 && recentMentorships.length === 0 ? (
                        <EmptyState
                            icon={<TrendingUp className="w-8 h-8 text-[#ccc]" />}
                            title="Chưa có hoạt động nào"
                            description="Các hoạt động sẽ xuất hiện khi có dữ liệu mới trong hệ thống"
                            className="py-16"
                        />
                    ) : (
                        <div className="space-y-1">
                            {/* Recent Meetings */}
                            {recentMeetings.slice(0, 3).map((meeting) => (
                                <Link
                                    key={meeting.id}
                                    href={`/meetings/${meeting.id}`}
                                    className="flex items-center gap-5 p-4 rounded-2xl hover:bg-[#fafafa] transition-all group border border-transparent hover:border-[#eee] hover:shadow-lg hover:shadow-black/[0.02]"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-bold text-black truncate mb-1 group-hover:text-black transition-colors">{meeting.title}</p>
                                        <div className="flex items-center gap-2">
                                            <Avatar
                                                firstName={meeting.creator.firstName}
                                                lastName={meeting.creator.lastName}
                                                src={meeting.creator.avatar}
                                                size="xs"
                                            />
                                            <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider">
                                                {meeting.creator.firstName} · {meeting.mentorship.mentor.firstName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <Badge status={meeting.status} size="sm" className="mb-2" />
                                        <p className="text-[10px] font-black text-[#ccc] group-hover:text-[#999] transition-colors">{formatRelative(meeting.createdAt)}</p>
                                    </div>
                                </Link>
                            ))}

                            <div className="h-px bg-[#f0f0f0] my-4" />

                            {/* Recent Mentorships */}
                            {recentMentorships.slice(0, 2).map((ms) => (
                                <Link
                                    key={ms.id}
                                    href={`/admin/mentorships/${ms.id}`}
                                    className="flex items-center gap-5 p-4 rounded-2xl hover:bg-[#fafafa] transition-all group border border-transparent hover:border-[#eee] hover:shadow-lg hover:shadow-black/[0.02]"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#fafafa] border border-[#eee] text-[#999] flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white group-hover:border-black shadow-sm group-hover:shadow-lg transition-all">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-bold text-black truncate mb-1 group-hover:text-black transition-colors">
                                            {ms.mentor.firstName} ➔ {ms.mentees.length} Mentees
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default" className="text-[9px] font-black">{ms.programCycle?.name || "Program"}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <Badge status={ms.status} size="sm" className="mb-2" />
                                        <p className="text-[10px] font-black text-[#ccc] group-hover:text-[#999] transition-colors">{formatRelative(ms.createdAt)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Quick Stats Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-black text-white border-none shadow-2xl shadow-black/20" padding="lg">
                        <h3 className="text-lg font-bold mb-8 flex items-center gap-2 opacity-80">
                            <Award className="w-4 h-4 text-white" />
                            Chỉ số hiệu quả
                        </h3>
                        <div className="space-y-8">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-all">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold opacity-70 group-hover:opacity-100 transition-opacity">Họp hoàn thành</span>
                                </div>
                                <p className="text-3xl font-black">{totalMeetings}</p>
                            </div>

                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-all">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold opacity-70 group-hover:opacity-100 transition-opacity">Mục tiêu đạt được</span>
                                </div>
                                <p className="text-3xl font-black">{totalGoals}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#fafafa] border-none shadow-inner" padding="lg">
                        <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6 border-b border-[#eee] pb-4">Mentorship mới nhất</h3>
                        <div className="space-y-5">
                            {recentMentorships.slice(0, 3).map((ms) => (
                                <Link
                                    key={ms.id}
                                    href={`/admin/mentorships/${ms.id}`}
                                    className="flex items-center gap-4 group"
                                >
                                    <Avatar
                                        firstName={ms.mentor.firstName}
                                        lastName={ms.mentor.lastName}
                                        src={ms.mentor.avatar}
                                        size="sm"
                                        className="border-2 border-white shadow-sm ring-1 ring-black/5 group-hover:ring-black group-hover:scale-110 transition-all"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-black truncate group-hover:text-black transition-colors">
                                            {ms.mentor.firstName} {ms.mentor.lastName}
                                        </p>
                                        <p className="text-[10px] font-black text-[#aaa] uppercase tracking-tighter">{ms.mentees.length} mentees enrolled</p>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#ccc] group-hover:text-black group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

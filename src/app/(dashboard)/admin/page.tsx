import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard } from "@/components/ui/card";
import { Users, UserCheck, Calendar, Bookmark, TrendingUp, ArrowRight } from "lucide-react";
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
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-black">Tổng quan hệ thống</h1>
                    <p className="text-[#666] text-sm mt-1">Chào mừng quay lại, {session?.user?.name || "Admin"}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/users">Quản lý người dùng</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/admin/mentorships/new">Tạo Mentorship</Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Recent Activities - Real Data */}
                <Card className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-black">Hoạt động gần đây</h3>
                        <Link href="/admin/reports" className="text-xs text-[#666] hover:text-black transition-colors flex items-center gap-1">
                            Xem tất cả <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {recentMeetings.length === 0 && recentMentorships.length === 0 ? (
                        <EmptyState
                            icon={<TrendingUp className="w-5 h-5" />}
                            title="Chưa có hoạt động nào"
                            description="Các hoạt động sẽ xuất hiện khi có dữ liệu mới trong hệ thống"
                        />
                    ) : (
                        <div className="space-y-1">
                            {/* Recent Meetings */}
                            {recentMeetings.slice(0, 3).map((meeting) => (
                                <Link
                                    key={meeting.id}
                                    href={`/meetings/${meeting.id}`}
                                    className="flex items-center gap-4 px-3 py-3 rounded-md hover:bg-[#fafafa] transition-colors group"
                                >
                                    <div className="w-9 h-9 rounded-md bg-[#fafafa] border border-[#eaeaea] flex items-center justify-center shrink-0 group-hover:border-black/20 transition-all">
                                        <Calendar className="w-4 h-4 text-[#666]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-black truncate">{meeting.title}</p>
                                        <p className="text-xs text-[#999]">
                                            {meeting.creator.firstName} · {meeting.mentorship.mentor.firstName}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <Badge className={getStatusColor(meeting.status)} size="sm">
                                            {getStatusLabel(meeting.status)}
                                        </Badge>
                                        <p className="text-[10px] text-[#bbb] mt-1">{formatRelative(meeting.createdAt)}</p>
                                    </div>
                                </Link>
                            ))}

                            {/* Recent Mentorships */}
                            {recentMentorships.slice(0, 2).map((ms) => (
                                <Link
                                    key={ms.id}
                                    href={`/admin/mentorships/${ms.id}`}
                                    className="flex items-center gap-4 px-3 py-3 rounded-md hover:bg-[#fafafa] transition-colors group"
                                >
                                    <div className="w-9 h-9 rounded-md bg-[#fafafa] border border-[#eaeaea] flex items-center justify-center shrink-0 group-hover:border-black/20 transition-all">
                                        <Users className="w-4 h-4 text-[#666]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-black truncate">
                                            {ms.mentor.firstName} ➔ {ms.mentees.length} Mentees
                                        </p>
                                        <p className="text-xs text-[#999]">
                                            {ms.programCycle?.name || "Program"}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <Badge className={getStatusColor(ms.status)} size="sm">
                                            {getStatusLabel(ms.status)}
                                        </Badge>
                                        <p className="text-[10px] text-[#bbb] mt-1">{formatRelative(ms.createdAt)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Quick Stats Sidebar */}
                <Card className="lg:col-span-2">
                    <h3 className="text-base font-semibold text-black mb-6">Chỉ số hiệu quả</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-md bg-[#fafafa] border border-[#eaeaea] flex items-center justify-center text-[#999]">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-[#666]">Buổi họp hoàn thành</span>
                            </div>
                            <p className="text-lg font-semibold text-black">{totalMeetings}</p>
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-md bg-[#fafafa] border border-[#eaeaea] flex items-center justify-center text-[#999]">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-[#666]">Mục tiêu đạt được</span>
                            </div>
                            <p className="text-lg font-semibold text-black">{totalGoals}</p>
                        </div>

                        <div className="h-px bg-[#eaeaea]" />

                        <div className="space-y-3">
                            <p className="text-xs font-medium text-[#999]">Mentorship mới nhất</p>
                            {recentMentorships.slice(0, 3).map((ms) => (
                                <Link
                                    key={ms.id}
                                    href={`/admin/mentorships/${ms.id}`}
                                    className="flex items-center gap-3 py-1.5 hover:opacity-80 transition-opacity"
                                >
                                    <Avatar
                                        firstName={ms.mentor.firstName}
                                        lastName={ms.mentor.lastName}
                                        src={ms.mentor.avatar}
                                        size="xs"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-black truncate">
                                            {ms.mentor.firstName} {ms.mentor.lastName}
                                        </p>
                                        <p className="text-[10px] text-[#999]">{ms.mentees.length} mentees</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

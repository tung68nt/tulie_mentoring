import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard } from "@/components/ui/card";
import {
    Users,
    UserCheck,
    Calendar,
    Bookmark,
    FileText,
    BarChart,
    TrendingUp,
    ArrowRight
} from "lucide-react";
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
        <div className="space-y-8 pb-16 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
                    <p className="text-sm text-[#666] mt-1">Tổng quan hoạt động của {session?.user?.name || "Admin"}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="md" className="shadow-sm font-semibold bg-[#fafafa]" asChild>
                        <Link href="/admin/users">Quản lý người dùng</Link>
                    </Button>
                    <Button size="md" className="shadow-lg shadow-black/10 font-semibold" asChild>
                        <Link href="/admin/mentorships/new">Tạo Mentorship</Link>
                    </Button>
                </div>
            </div>

            {/* Stats Row - Single container with shared borders */}
            <div className="rounded-[12px] border border-[#eaeaea] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, idx) => (
                        <div
                            key={stat.title}
                            className={`p-6 ${idx < stats.length - 1 ? "border-b sm:border-b-0 sm:border-r border-[#eaeaea]" : ""} ${idx === 2 ? "sm:border-b lg:border-b-0" : ""}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-[11px] font-medium text-[#999]">{stat.title}</p>
                                    <p className="text-3xl font-bold text-black leading-none">{stat.value}</p>
                                    {/* Growth percentage removed as per feedback */}
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#fafafa] text-[#999] border border-[#eee]">
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Grid - Single container with shared borders */}
            <div className="rounded-[12px] border border-[#eaeaea] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Recent Activities - Left Panel */}
                    <div className="lg:col-span-8 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-semibold text-black flex items-center gap-2">
                                <span className="w-1 h-5 bg-black rounded-full" />
                                Hoạt động gần đây
                            </h3>
                            <Link href="/admin/reports" className="text-xs font-medium text-[#888] hover:text-black transition-all flex items-center gap-1.5 bg-[#fafafa] px-3 py-1.5 rounded-full border border-[#eee]">
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
                            <div className="space-y-0">
                                {/* Recent Meetings */}
                                {recentMeetings.slice(0, 3).map((meeting, idx) => (
                                    <div key={meeting.id}>
                                        {idx > 0 && <div className="h-px bg-[#eaeaea] ml-[68px]" />}
                                        <Link
                                            href={`/meetings/${meeting.id}`}
                                            className="flex items-center gap-5 py-4 hover:bg-[#fafafa] transition-all group -mx-2 px-2 rounded-xl"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-black truncate mb-0.5">{meeting.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <Avatar
                                                        firstName={meeting.creator.firstName}
                                                        lastName={meeting.creator.lastName}
                                                        src={meeting.creator.avatar}
                                                        size="xs"
                                                    />
                                                    <p className="text-[11px] font-medium text-[#aaa]">
                                                        {meeting.creator.firstName} {meeting.creator.lastName} · {meeting.mentorship.mentor.firstName}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <Badge status={meeting.status} size="sm" className="mb-1" />
                                                <p className="text-[10px] font-medium text-[#ccc]">{formatRelative(meeting.createdAt)}</p>
                                            </div>
                                        </Link>
                                    </div>
                                ))}

                                <div className="h-px bg-[#eaeaea] ml-[68px]" />

                                {/* Recent Mentorships */}
                                {recentMentorships.slice(0, 2).map((ms, idx) => (
                                    <div key={ms.id}>
                                        {idx > 0 && <div className="h-px bg-[#eaeaea] ml-[68px]" />}
                                        <Link
                                            href={`/admin/mentorships/${ms.id}`}
                                            className="flex items-center gap-5 py-4 hover:bg-[#fafafa] transition-all group -mx-2 px-2 rounded-xl"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-[#fafafa] border border-[#eee] text-[#999] flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white group-hover:border-black shadow-sm group-hover:shadow-lg transition-all">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-black truncate mb-0.5">
                                                    {ms.mentor.firstName} ➔ {ms.mentees.length} Mentees
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="default" className="text-[9px] font-medium">{ms.programCycle?.name || "Program"}</Badge>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <Badge status={ms.status} size="sm" className="mb-1" />
                                                <p className="text-[10px] font-medium text-[#ccc]">{formatRelative(ms.createdAt)}</p>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Sidebar - Right Panel */}
                    <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#eaeaea] p-8">
                        <h3 className="text-[11px] font-bold text-black uppercase tracking-wider mb-8 flex items-center gap-2">
                            <BarChart className="w-3.5 h-3.5" />
                            Chỉ số hiệu quả
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#666] border border-[#eaeaea] group-hover:border-[#ccc] transition-all">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-[#666] group-hover:text-black transition-colors">Họp hoàn thành</span>
                                </div>
                                <p className="text-xl font-bold text-black">{totalMeetings}</p>
                            </div>

                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#666] border border-[#eaeaea] group-hover:border-[#ccc] transition-all">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-[#666] group-hover:text-black transition-colors">Mục tiêu đạt được</span>
                                </div>
                                <p className="text-xl font-bold text-black">{totalGoals}</p>
                            </div>
                        </div>

                        <div className="h-px bg-[#eaeaea] my-6" />

                        <h3 className="text-[11px] font-bold text-black uppercase tracking-wider mb-5 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" />
                            Mentorship mới nhất
                        </h3>
                        <div className="space-y-0">
                            {recentMentorships.slice(0, 3).map((ms, idx) => (
                                <div key={ms.id}>
                                    {idx > 0 && <div className="h-px bg-[#eee] ml-12" />}
                                    <Link
                                        href={`/admin/mentorships/${ms.id}`}
                                        className="flex items-center gap-3 group py-3"
                                    >
                                        <Avatar
                                            firstName={ms.mentor.firstName}
                                            lastName={ms.mentor.lastName}
                                            src={ms.mentor.avatar}
                                            size="sm"
                                            className="border-2 border-white shadow-sm ring-1 ring-black/5 group-hover:ring-black group-hover:scale-110 transition-all"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-black truncate">
                                                {ms.mentor.firstName} {ms.mentor.lastName}
                                            </p>
                                            <p className="text-[10px] font-medium text-[#aaa]">{ms.mentees.length} mentees enrolled</p>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-[#ccc] group-hover:text-black group-hover:translate-x-1 transition-all" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React from "react";
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

import { redirect } from "next/navigation";

export default async function AdminDashboard() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        redirect("/login");
    }

    let stats = [
        { title: "Tổng người dùng", value: 0, icon: <Users />, color: "black" as const },
        { title: "Mentor hoạt động", value: 0, icon: <UserCheck />, color: "black" as const },
        { title: "Mentee hoạt động", value: 0, icon: <Users />, color: "black" as const },
        { title: "Cặp Mentoring", value: 0, icon: <Bookmark />, color: "black" as const },
    ];
    let serializedRecentMeetings: any[] = [];
    let serializedRecentMentorships: any[] = [];
    let serializedRecentNotifications: any[] = [];
    let totalUsers = 0;
    let activeMentors = 0;
    let activeMentees = 0;
    let totalMentorships = 0;
    let totalMeetings = 0;
    let totalGoals = 0;

    try {
        // Fetch real statistics and recent data
        const [
            usersCount,
            mentorsCount,
            menteesCount,
            mentorshipsCount,
            meetingsCount,
            goalsCount,
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
                where: { userId: session.user.id! },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
        ]);

        // Assign to outer variables
        totalUsers = usersCount;
        activeMentors = mentorsCount;
        activeMentees = menteesCount;
        totalMentorships = mentorshipsCount;
        totalMeetings = meetingsCount;
        totalGoals = goalsCount;

        // Serialize data to prevent "Server Component render" errors with Date objects
        serializedRecentMeetings = JSON.parse(JSON.stringify(recentMeetings || []));
        serializedRecentMentorships = JSON.parse(JSON.stringify(recentMentorships || []));
        serializedRecentNotifications = JSON.parse(JSON.stringify(recentNotifications || []));

        stats = [
            { title: "Tổng người dùng", value: totalUsers, icon: <Users />, color: "black" as const },
            { title: "Mentor hoạt động", value: activeMentors, icon: <UserCheck />, color: "black" as const },
            { title: "Mentee hoạt động", value: activeMentees, icon: <Users />, color: "black" as const },
            { title: "Cặp Mentoring", value: totalMentorships, icon: <Bookmark />, color: "black" as const },
        ];
    } catch (error: any) {
        console.error("Failed to fetch admin dashboard data:", error);
        return (
            <div className="p-8 border border-destructive/20 rounded-xl bg-destructive/5">
                <p className="text-destructive font-semibold mb-2">Đã có lỗi xảy ra khi tải dữ liệu:</p>
                <code className="text-xs bg-background p-2 rounded block overflow-auto whitespace-pre-wrap">
                    {error?.message || String(error)}
                    {"\n\nStack:\n" + (error?.stack || "No stack trace available")}
                </code>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground no-uppercase">Dashboard</h1>
                    <p className="text-sm text-muted-foreground/60 no-uppercase font-medium">Tổng quan hoạt động của {session?.user?.name || "Admin"}</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" size="default" className="shadow-none font-semibold bg-muted rounded-xl no-uppercase" asChild>
                        <Link href="/admin/users">Người dùng</Link>
                    </Button>
                    <Button size="default" className="shadow-none font-semibold rounded-xl no-uppercase" asChild>
                        <Link href="/admin/mentorships/new">Tạo Mentorship</Link>
                    </Button>
                </div>
            </div>

            {/* Stats Row - Single container with shared borders */}
            <div className="rounded-xl border border-border bg-background shadow-none overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, idx) => (
                        <div
                            key={stat.title}
                            className={`p-8 ${idx < stats.length - 1 ? "border-b sm:border-b-0 sm:border-r border-border" : ""} ${idx === 2 ? "sm:border-b lg:border-b-0" : ""} hover:bg-muted/30 transition-colors`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-[11px] font-semibold text-muted-foreground/60 no-uppercase tracking-normal">{stat.title}</p>
                                    <p className="text-3xl font-bold text-foreground tabular-nums leading-none tracking-tight">{stat.value}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50 text-foreground/40 border border-border shadow-none">
                                    {React.cloneElement(stat.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Grid - Single container with shared borders */}
            <div className="rounded-xl border border-border bg-background shadow-none overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Recent Activities - Left Panel */}
                    <div className="lg:col-span-8 p-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-semibold text-foreground flex items-center gap-3 no-uppercase">
                                <span className="w-1.5 h-6 bg-primary rounded-full" />
                                Hoạt động gần đây
                            </h3>
                            <Link href="/admin/reports" className="text-[11px] font-bold text-muted-foreground/60 hover:text-foreground transition-all flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl border border-border no-uppercase">
                                Tất cả báo cáo <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {serializedRecentMeetings.length === 0 && serializedRecentMentorships.length === 0 ? (
                            <EmptyState
                                icon={<TrendingUp className="w-8 h-8 text-muted-foreground/30" />}
                                title="Chưa có hoạt động nào"
                                description="Các hoạt động sẽ xuất hiện khi có dữ liệu mới trong hệ thống"
                                className="py-16 no-uppercase"
                            />
                        ) : (
                            <div className="space-y-0">
                                {/* Recent Meetings */}
                                {serializedRecentMeetings.slice(0, 3).map((meeting: any, idx: number) => (
                                    <div key={meeting.id}>
                                        {idx > 0 && <div className="h-px bg-border/60 ml-[68px]" />}
                                        <Link
                                            href={`/meetings/${meeting.id}`}
                                            className="flex items-center gap-6 py-5 hover:bg-muted/30 transition-all group -mx-2 px-4 rounded-xl"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-none group-hover:scale-105 transition-all duration-300">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate mb-1 no-uppercase">{meeting.title}</p>
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar
                                                        firstName={meeting.creator?.firstName}
                                                        lastName={meeting.creator?.lastName}
                                                        src={meeting.creator?.avatar}
                                                        size="xs"
                                                        className="ring-1 ring-border"
                                                    />
                                                    <p className="text-[11px] font-medium text-muted-foreground/60 no-uppercase">
                                                        {meeting.creator?.firstName} {meeting.creator?.lastName} · {meeting.mentorship?.mentor?.firstName}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 space-y-1">
                                                <Badge status={meeting.status} size="sm" />
                                                <p className="text-[10px] font-semibold text-muted-foreground/40 tabular-nums no-uppercase">{formatRelative(meeting.createdAt)}</p>
                                            </div>
                                        </Link>
                                    </div>
                                ))}

                                <div className="h-px bg-border/60 ml-[68px]" />

                                {/* Recent Mentorships */}
                                {serializedRecentMentorships.slice(0, 2).map((ms: any, idx: number) => (
                                    <div key={ms.id}>
                                        {idx > 0 && <div className="h-px bg-border/60 ml-[68px]" />}
                                        <Link
                                            href={`/admin/mentorships/${ms.id}`}
                                            className="flex items-center gap-6 py-5 hover:bg-muted/30 transition-all group -mx-2 px-4 rounded-xl"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-muted border border-border text-muted-foreground/60 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary shadow-none transition-all duration-300">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate mb-1 no-uppercase">
                                                    {ms.mentor?.firstName} ➔ {ms.mentees?.length || 0} Mentees
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-[9px] font-bold no-uppercase">{ms.programCycle?.name || "Program"}</Badge>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 space-y-1">
                                                <Badge status={ms.status} size="sm" />
                                                <p className="text-[10px] font-semibold text-muted-foreground/40 tabular-nums no-uppercase">{formatRelative(ms.createdAt)}</p>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Sidebar - Right Panel */}
                    <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border p-10 bg-muted/10">
                        <h3 className="text-[11px] font-bold text-muted-foreground/60 mb-8 flex items-center gap-2 no-uppercase tracking-wider">
                            <BarChart className="w-4 h-4" />
                            Hiệu quả hệ thống
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground/40 border border-border group-hover:border-foreground/20 group-hover:text-foreground/60 transition-all shadow-none">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-muted-foreground/60 group-hover:text-foreground transition-colors no-uppercase">Buổi họp</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground tabular-nums">{totalMeetings}</p>
                            </div>

                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground/40 border border-border group-hover:border-foreground/20 group-hover:text-foreground/60 transition-all shadow-none">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-muted-foreground/60 group-hover:text-foreground transition-colors no-uppercase">Mục tiêu</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground tabular-nums">{totalGoals}</p>
                            </div>
                        </div>

                        <div className="h-px bg-border/60 my-10" />

                        <h3 className="text-[11px] font-bold text-muted-foreground/60 mb-8 flex items-center gap-2 no-uppercase tracking-wider">
                            <Users className="w-4 h-4" />
                            Đào tạo mới nhất
                        </h3>
                        <div className="space-y-2">
                            {serializedRecentMentorships.slice(0, 3).map((ms: any) => (
                                <Link
                                    key={ms.id}
                                    href={`/admin/mentorships/${ms.id}`}
                                    className="flex items-center gap-4 group p-3 rounded-xl hover:bg-background transition-all"
                                >
                                    <Avatar
                                        firstName={ms.mentor?.firstName}
                                        lastName={ms.mentor?.lastName}
                                        src={ms.mentor?.avatar}
                                        size="sm"
                                        className="border-2 border-background shadow-none ring-1 ring-border group-hover:ring-primary group-hover:scale-105 transition-all"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate no-uppercase">
                                            {ms.mentor?.firstName} {ms.mentor?.lastName}
                                        </p>
                                        <p className="text-[10px] font-semibold text-muted-foreground/40 no-uppercase">{ms.mentees?.length || 0} mentees enrolled</p>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

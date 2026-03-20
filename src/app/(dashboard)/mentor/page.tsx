import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, Clock, Target, ArrowRight, PenLine, MessageSquare, Check, Eye } from "lucide-react";
import { MinutesManager } from "@/components/features/meetings/minutes-manager";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SystemClock, Countdown } from "@/components/ui/fomo-timer";

import { redirect } from "next/navigation";

export default async function MentorDashboard() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const userId = session.user.id;
    const role = (session.user as any).role;
    const isAdmin = role === "admin";

    // Admin sees all, mentor sees only theirs
    const mentorFilter = isAdmin ? {} : { mentorId: userId };
    const meetingFilter = isAdmin
        ? { status: "scheduled" }
        : { mentorship: { mentorId: userId }, status: "scheduled" };

    try {
        const allMeetingFilter = isAdmin
            ? {}
            : { mentorship: { mentorId: userId } };

        const [mentorships, upcomingMeetings, allMeetings, recentReflections] = await Promise.all([
            prisma.mentorship.findMany({
                where: mentorFilter,
                include: {
                    mentees: { include: { mentee: true } },
                    programCycle: true,
                    mentor: true,
                    goals: {
                        where: {
                            status: { not: "completed" },
                            dueDate: { not: null }
                        }
                    }
                }
            }),
            prisma.meeting.findMany({
                where: meetingFilter,
                orderBy: { scheduledAt: "asc" },
                take: 5
            }),
            prisma.meeting.findMany({
                where: allMeetingFilter,
                include: {
                    minutes: {
                        select: {
                            id: true,
                            status: true,
                            keyPoints: true,
                            agenda: true,
                            actionItems: true,
                            outcome: true,
                            submittedAt: true,
                            approvedAt: true,
                            author: { select: { firstName: true, lastName: true } },
                        }
                    },
                    mentorship: {
                        select: { id: true, mentor: { select: { firstName: true, lastName: true } } }
                    }
                },
                orderBy: { scheduledAt: "desc" },
            }),
            // Reflections from mentees for meetings in mentor's mentorships
            prisma.meeting.findMany({
                where: {
                    ...allMeetingFilter,
                    status: { in: ["scheduled", "completed"] },
                },
                include: {
                    sessionReflections: {
                        include: {
                            mentee: {
                                select: { id: true, firstName: true, lastName: true, avatar: true }
                            }
                        }
                    },
                    mentorship: {
                        include: {
                            mentees: {
                                include: {
                                    mentee: { select: { id: true, firstName: true, lastName: true, avatar: true } }
                                }
                            }
                        }
                    },
                    attendances: {
                        where: { status: "present" },
                        select: { userId: true }
                    }
                },
                orderBy: { scheduledAt: "desc" },
                take: 15,
            }),
        ]);

        const serializedMentorships = JSON.parse(JSON.stringify(mentorships || []));
        const serializedUpcomingMeetings = JSON.parse(JSON.stringify(upcomingMeetings || []));
        const serializedAllMeetings = JSON.parse(JSON.stringify(allMeetings || []));
        const serializedReflections = JSON.parse(JSON.stringify(recentReflections || []));

        // Calculate reflection stats
        const totalReflectionsExpected = serializedReflections.reduce((acc: number, m: any) => acc + (m.attendances?.length || 0), 0);
        const totalReflectionsSubmitted = serializedReflections.reduce((acc: number, m: any) => acc + (m.sessionReflections?.length || 0), 0);
        const reflectionRate = totalReflectionsExpected > 0 ? Math.round((totalReflectionsSubmitted / totalReflectionsExpected) * 100) : 0;

        const totalMentees = serializedMentorships.reduce((acc: number, m: any) => acc + m.mentees.length, 0);

        const stats = [
            { title: "Mentees", value: totalMentees, icon: <Users /> },
            { title: "Buổi họp sắp tới", value: serializedUpcomingMeetings.length, icon: <Calendar /> },
            { title: "Mentorship", value: serializedMentorships.length, icon: <CheckCircle /> },
            { title: "Thu hoạch", value: `${reflectionRate}%`, icon: <PenLine /> },
        ];

        return (
            <div className="space-y-8 pb-32 animate-fade-in">
                {isAdmin && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl text-xs text-muted-foreground/60 no-uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Chế độ Admin Preview — dữ liệu toàn hệ thống
                    </div>
                )}
                <div className="space-y-1">
                    <SystemClock />
                    <h1 className="text-2xl font-semibold text-foreground mt-4">Bảng điều khiển Mentor</h1>
                    <p className="text-sm text-muted-foreground mt-1">{isAdmin ? "Xem trước giao diện Mentor (tổng hợp dữ liệu toàn hệ thống)" : `Chào buổi sáng, ${session?.user?.name || "Mentor"}.`}</p>
                </div>

                {/* Unified Countdown Section */}
                <div className="flex flex-col gap-4 w-full">
                    <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" />
                        Theo dõi thời gian &amp; Deadline
                    </h3>

                    {(() => {
                        // Deduplicate program cycles
                        const seenCycles = new Set<string>();
                        const uniqueCycles = serializedMentorships
                            .filter((m: any) => m.programCycle?.endDate)
                            .filter((m: any) => {
                                if (seenCycles.has(m.programCycle.id)) return false;
                                seenCycles.add(m.programCycle.id);
                                return true;
                            });

                        // Collect all goal deadlines
                        const goalDeadlines = serializedMentorships.flatMap((m: any) =>
                            m.goals.map((g: any) => ({
                                ...g,
                                menteeName: m.mentees?.[0]?.mentee?.firstName + ' ' + m.mentees?.[0]?.mentee?.lastName
                            }))
                        )
                            .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                            .slice(0, 6);

                        // Calculate maxDays from the longest countdown for consistent bar scale
                        const now = new Date();
                        const allDates = [
                            ...uniqueCycles.map((m: any) => new Date(m.programCycle.endDate)),
                            ...goalDeadlines.map((g: any) => new Date(g.dueDate)),
                        ];
                        const globalMaxDays = Math.max(
                            30,
                            ...allDates.map(d => Math.max(0, Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))))
                        );

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {uniqueCycles.map((m: any) => (
                                    <Countdown
                                        key={`cycle-${m.programCycle.id}`}
                                        targetDate={m.programCycle.endDate}
                                        label={`Thời gian còn lại: ${m.programCycle.name}`}
                                        maxDays={globalMaxDays}
                                    />
                                ))}
                                {goalDeadlines.map((goal: any) => (
                                    <Countdown
                                        key={goal.id}
                                        targetDate={goal.dueDate}
                                        label={goal.title}
                                        subtitle={`Mentee: ${goal.menteeName}`}
                                        maxDays={globalMaxDays}
                                    />
                                ))}
                            </div>
                        );
                    })()}

                    {serializedMentorships.length === 0 && (
                        <div className="py-4 text-center text-xs text-muted-foreground">
                            Chưa có chương trình hoạt động
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>

                {/* Minutes Management */}
                <MinutesManager meetings={serializedAllMeetings} />

                {/* Reflection / Harvest Tracking - Compact */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <PenLine className="w-4 h-4 text-purple-500" />
                            Theo dõi Thu hoạch Mentoring
                        </h3>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/reflections">
                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                Xem tất cả
                            </Link>
                        </Button>
                    </div>

                    {serializedReflections.length === 0 ? (
                        <Card className="p-6 text-center">
                            <PenLine className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Chưa có buổi họp nào để theo dõi thu hoạch.</p>
                        </Card>
                    ) : (
                        <Card className="p-0 overflow-hidden">
                            <div className="divide-y divide-border/30">
                                {serializedReflections.slice(0, 8).map((meeting: any) => {
                                    const mentees = meeting.mentorship?.mentees || [];
                                    const reflectionMap = new Map<string, any>(
                                        (meeting.sessionReflections || []).map((r: any) => [r.menteeId, r])
                                    );
                                    const relevantMentees = mentees;
                                    if (relevantMentees.length === 0) return null;

                                    const submittedCount = relevantMentees.filter((mt: any) => reflectionMap.has(mt.mentee.id)).length;
                                    const allSubmitted = submittedCount === relevantMentees.length;
                                    const confirmedCount = relevantMentees.filter((mt: any) => reflectionMap.get(mt.mentee.id)?.mentorConfirmed).length;

                                    return (
                                        <div key={meeting.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                                            {/* Date badge - compact */}
                                            <div className="w-9 h-9 rounded-md bg-purple-500/10 flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[8px] font-bold text-purple-600 leading-none">{formatDate(meeting.scheduledAt, "MMM")}</span>
                                                <span className="text-xs font-bold text-purple-600 leading-none mt-0.5">{formatDate(meeting.scheduledAt, "dd")}</span>
                                            </div>
                                            {/* Meeting info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {formatDate(meeting.scheduledAt, "HH:mm")} · {submittedCount}/{relevantMentees.length} đã nộp
                                                </p>
                                            </div>
                                            {/* Mentee avatars inline */}
                                            <div className="flex items-center -space-x-1.5 shrink-0">
                                                {relevantMentees.slice(0, 4).map((mt: any) => {
                                                    const ref = reflectionMap.get(mt.mentee.id);
                                                    const hasSubmitted = !!ref;
                                                    return (
                                                        <div key={mt.mentee.id} className={`relative ring-2 ring-background rounded-full ${!hasSubmitted ? 'opacity-40' : ''}`}>
                                                            <Avatar
                                                                firstName={mt.mentee.firstName}
                                                                lastName={mt.mentee.lastName}
                                                                src={mt.mentee.avatar}
                                                                size="xs"
                                                            />
                                                            {ref?.mentorConfirmed && (
                                                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-background" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {relevantMentees.length > 4 && (
                                                    <span className="text-[10px] text-muted-foreground ml-2">+{relevantMentees.length - 4}</span>
                                                )}
                                            </div>
                                            {/* Status badge */}
                                            <div className="shrink-0">
                                                {allSubmitted ? (
                                                    confirmedCount === relevantMentees.length ? (
                                                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10">
                                                            <Check className="w-3 h-3" />
                                                            Xong
                                                        </span>
                                                    ) : (
                                                        <Badge className="bg-purple-500/10 text-purple-600 border-purple-200/50 text-[10px] px-1.5 py-0">
                                                            Chờ duyệt
                                                        </Badge>
                                                    )
                                                ) : (
                                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-200/50 text-[10px] px-1.5 py-0">
                                                        Chờ {relevantMentees.length - submittedCount} bài
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {serializedReflections.length > 8 && (
                                <div className="border-t border-border/30 px-4 py-2 text-center">
                                    <Link href="/reflections" className="text-xs text-primary font-medium hover:underline">
                                        Xem thêm {serializedReflections.length - 8} buổi →
                                    </Link>
                                </div>
                            )}
                        </Card>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold text-foreground">Danh sách Mentees</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {serializedMentorships.flatMap((m: any) => m.mentees).map((mt: any) => (
                                    <Link 
                                        key={mt.id}
                                        href={`/admin/mentorships/${mt.mentorshipId}`}
                                        className="group relative flex flex-col items-center p-5 rounded-xl border border-border/40 bg-card hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        
                                        <div className="relative mb-3">
                                            <Avatar
                                                firstName={mt.mentee?.firstName}
                                                lastName={mt.mentee?.lastName}
                                                src={mt.mentee?.avatar}
                                                size="lg"
                                            />
                                        </div>
                                        <p className="text-sm font-semibold text-foreground text-center truncate w-full">
                                            {mt.mentee?.firstName} {mt.mentee?.lastName}
                                        </p>
                                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium mt-1.5 px-2 py-0.5 rounded-full ${
                                            mt.status === "active"
                                                ? "text-emerald-600 bg-emerald-500/10"
                                                : "text-muted-foreground bg-muted"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                mt.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/40"
                                            }`} />
                                            {mt.status === "active" ? "Đang tham gia" : "Không hoạt động"}
                                        </span>
                                        <span className="text-[11px] text-primary font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            Xem hồ sơ
                                            <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Lịch họp sắp tới</h3>
                        <div className="space-y-4">
                            {serializedUpcomingMeetings.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-10 text-center border border-dashed rounded-xl bg-muted/20">Chưa có lịch họp nào.</p>
                            ) : (
                                serializedUpcomingMeetings.map((meeting: any) => (
                                    <div key={meeting.id} className="flex gap-5 p-5 rounded-xl border border-border bg-background group hover:border-foreground/20 transition-all shadow-none">
                                        <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex flex-col items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold leading-none no-uppercase">{formatDate(meeting.scheduledAt, "MMM")}</span>
                                            <span className="text-lg font-bold leading-none mt-1">{formatDate(meeting.scheduledAt, "dd")}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <p className="text-sm font-semibold text-foreground truncate">{meeting.title}</p>
                                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatDate(meeting.scheduledAt, "HH:mm")}
                                                </div>
                                                <Badge status={meeting.status} size="sm" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <Button className="w-full mt-4" variant="outline" asChild>
                                <Link href="/calendar">Xem tất cả lịch trình</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch mentor dashboard data:", error);
        return (
            <div className="p-8 border border-destructive/20 rounded-xl bg-destructive/5">
                <p className="text-destructive font-semibold mb-2">Đã có lỗi xảy ra khi tải dữ liệu:</p>
                <code className="text-xs bg-background p-2 rounded block overflow-auto whitespace-pre-wrap">
                    {error instanceof Error ? error.message : String(error)}
                </code>
            </div>
        );
    }
}

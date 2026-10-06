import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, Clock, Target, ArrowRight, PenLine, MessageSquare, Check, Eye } from "lucide-react";
import { MinutesManager } from "@/components/features/meetings/minutes-manager";
import { ReflectionTracker } from "@/components/features/reflections/reflection-tracker";
import { DeadlineTracker } from "@/components/features/mentorships/deadline-tracker";
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
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const meetingFilter = isAdmin
        ? { status: "scheduled", scheduledAt: { gte: now } }
        : { mentorship: { mentorId: userId }, status: "scheduled", scheduledAt: { gte: now } };

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
                include: {
                    mentorship: {
                        select: {
                            mentees: {
                                include: {
                                    mentee: { select: { id: true, firstName: true, lastName: true, avatar: true } }
                                }
                            }
                        }
                    }
                },
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
                        select: { 
                            id: true, 
                            mentor: { select: { firstName: true, lastName: true } },
                            mentees: {
                                include: {
                                    mentee: { select: { id: true, firstName: true, lastName: true, avatar: true } }
                                }
                            }
                        }
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
                    <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                        <Target className="w-3.5 h-3.5" />
                        Theo dõi thời gian &amp; Deadline
                    </h3>

                    <DeadlineTracker mentorships={serializedMentorships} />
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
                            <PenLine className="w-4 h-4 text-foreground/70" />
                            Theo dõi Thu hoạch Mentoring
                        </h3>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/reflections">
                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                Xem tất cả
                            </Link>
                        </Button>
                    </div>

                    <ReflectionTracker reflections={serializedReflections} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold text-foreground">Danh sách Mentees</h3>
                            <div className="space-y-3">
                                {serializedMentorships.flatMap((m: any) => m.mentees).map((mt: any) => (
                                    <Link 
                                        key={mt.id}
                                        href={`/mentees/${mt.mentorshipId}`}
                                        className="group flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                                    >
                                        <Avatar
                                            firstName={mt.mentee?.firstName}
                                            lastName={mt.mentee?.lastName}
                                            src={mt.mentee?.avatar}
                                            size="md"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {mt.mentee?.firstName} {mt.mentee?.lastName}
                                            </p>
                                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium mt-1 ${
                                                mt.status === "active"
                                                    ? "text-blue-600"
                                                    : "text-muted-foreground"
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    mt.status === "active" ? "bg-blue-500" : "bg-muted-foreground/40"
                                                }`} />
                                                {mt.status === "active" ? "Đang theo học" : "Không hoạt động"}
                                            </span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
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
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            <p className="text-sm font-semibold text-foreground">
                                                {meeting.sessionNumber ? `Buổi #${meeting.sessionNumber}: ` : ""}{meeting.title}
                                            </p>
                                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatDate(meeting.scheduledAt, "HH:mm")} • {formatDate(meeting.scheduledAt, "EEEE, dd/MM/yyyy")}
                                                </div>
                                                <Badge status={meeting.status} size="sm" />
                                            </div>
                                            {meeting.mentorship?.mentees?.length > 0 && (
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Users className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {meeting.mentorship.mentees.map((mt: any) => (
                                                            <div key={mt.mentee?.id} className="flex items-center gap-1.5">
                                                                <Avatar
                                                                    firstName={mt.mentee?.firstName}
                                                                    lastName={mt.mentee?.lastName}
                                                                    src={mt.mentee?.avatar}
                                                                    size="xs"
                                                                />
                                                                <span className="text-xs font-medium text-foreground">
                                                                    {mt.mentee?.firstName} {mt.mentee?.lastName}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
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

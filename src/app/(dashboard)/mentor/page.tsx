import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    const mentorFilter = isAdmin ? { status: "active" as const } : { mentorId: userId, status: "active" as const };
    const meetingFilter = isAdmin
        ? { status: "scheduled" as const }
        : { mentorship: { mentorId: userId }, status: "scheduled" as const };

    try {
        const [mentorships, upcomingMeetings] = await Promise.all([
            prisma.mentorship.findMany({
                where: mentorFilter,
                include: {
                    mentees: { include: { mentee: true } },
                    programCycle: true,
                    mentor: true,
                }
            }),
            prisma.meeting.findMany({
                where: meetingFilter,
                orderBy: { scheduledAt: "asc" },
                take: 5
            })
        ]);

        const serializedMentorships = JSON.parse(JSON.stringify(mentorships || []));
        const serializedUpcomingMeetings = JSON.parse(JSON.stringify(upcomingMeetings || []));

        const totalMentees = serializedMentorships.reduce((acc: number, m: any) => acc + m.mentees.length, 0);

        const stats = [
            { title: "Mentees", value: totalMentees, icon: <Users /> },
            { title: "Buổi họp sắp tới", value: serializedUpcomingMeetings.length, icon: <Calendar /> },
            { title: "Mentorship", value: serializedMentorships.length, icon: <CheckCircle /> },
        ];

        return (
            <div className="space-y-8 pb-10 animate-fade-in">
                {isAdmin && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Bạn đang xem ở chế độ Admin Preview — dữ liệu hiển thị toàn bộ hệ thống
                    </div>
                )}
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Bảng điều khiển Mentor</h1>
                    <p className="text-sm text-muted-foreground mt-1">{isAdmin ? "Xem trước giao diện Mentor (tổng hợp dữ liệu toàn hệ thống)" : `Chào buổi sáng, ${session?.user?.name || "Mentor"}.`}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Danh sách Mentees</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {serializedMentorships.flatMap((m: any) => m.mentees).map((mt: any) => (
                                <Card key={mt.id} className="p-6 flex items-center justify-between group" hover>
                                    <div className="flex items-center gap-4">
                                        <Avatar
                                            firstName={mt.mentee?.firstName}
                                            lastName={mt.mentee?.lastName}
                                            src={mt.mentee?.avatar}
                                            size="md"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate leading-tight mb-1">
                                                {mt.mentee?.firstName} {mt.mentee?.lastName}
                                            </p>
                                            <p className="text-[11px] font-medium text-muted-foreground">{mt.status}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/admin/mentorships/${mt.mentorshipId}`}>Hồ sơ</Link>
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Lịch họp sắp tới</h3>
                        <div className="space-y-4">
                            {serializedUpcomingMeetings.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Chưa có lịch họp nào.</p>
                            ) : (
                                serializedUpcomingMeetings.map((meeting: any) => (
                                    <div key={meeting.id} className="flex gap-5 p-5 rounded-[8px] border border-border bg-card group hover:border-foreground/20 transition-all">
                                        <div className="w-12 h-12 rounded-[6px] bg-primary text-primary-foreground flex flex-col items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold leading-none">{formatDate(meeting.scheduledAt, "MMM")}</span>
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
            <div className="p-8 text-center">
                <p className="text-muted-foreground">Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.</p>
            </div>
        );
    }
}

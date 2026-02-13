import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MentorDashboard() {
    const session = await auth();
    const userId = session?.user?.id;

    // Fetch real mentor stats
    const [mentorships, upcomingMeetings] = await Promise.all([
        prisma.mentorship.findMany({
            where: { mentorId: userId, status: "active" },
            include: {
                mentees: { include: { mentee: true } },
                programCycle: true,
            }
        }),
        prisma.meeting.findMany({
            where: { mentorship: { mentorId: userId }, status: "scheduled" },
            orderBy: { scheduledAt: "asc" },
            take: 3
        })
    ]);

    const totalMentees = mentorships.reduce((acc, m) => acc + m.mentees.length, 0);

    const stats = [
        { title: "Mentees của tôi", value: totalMentees, icon: <Users /> },
        { title: "Buổi họp sắp tới", value: upcomingMeetings.length, icon: <Calendar /> },
        { title: "Hoàn thành", value: 12, icon: <CheckCircle /> }, // Placeholder for now or calculate from actual meetings
    ];

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-black">Bảng điều khiển Mentor</h1>
                <p className="text-sm text-[#666] mt-1">Chào buổi sáng, {session?.user?.name || "Mentor"}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold tracking-tight text-black">Danh sách Mentees</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mentorships.flatMap(m => m.mentees).map((mt) => (
                            <Card key={mt.id} className="p-6 flex items-center justify-between group" hover>
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        firstName={mt.mentee.firstName}
                                        lastName={mt.mentee.lastName}
                                        src={mt.mentee.avatar}
                                        size="md"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-black truncate leading-tight mb-1">
                                            {mt.mentee.firstName} {mt.mentee.lastName}
                                        </p>
                                        <p className="text-[11px] font-medium text-[#999]">{mt.status}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/admin/mentorships/${mt.mentorshipId}`}>Hồ sơ</Link>
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <h3 className="text-lg font-semibold text-black">Lịch họp sắp tới</h3>
                    <div className="space-y-4">
                        {upcomingMeetings.length === 0 ? (
                            <p className="text-sm text-[#999] italic">Chưa có lịch họp nào.</p>
                        ) : (
                            upcomingMeetings.map((meeting) => (
                                <div key={meeting.id} className="flex gap-5 p-5 rounded-[8px] border border-[#eaeaea] bg-white group hover:border-black transition-all">
                                    <div className="w-12 h-12 rounded-[6px] bg-black text-white flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold leading-none">{formatDate(meeting.scheduledAt, "MMM")}</span>
                                        <span className="text-lg font-bold leading-none mt-1">{formatDate(meeting.scheduledAt, "dd")}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <p className="text-sm font-semibold text-black truncate">{meeting.title}</p>
                                        <div className="flex items-center gap-3 text-[11px] text-[#666] font-medium">
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
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard } from "@/components/ui/card";
import { Target, Calendar, CheckCircle, Zap } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MenteeDashboard() {
    const session = await auth();
    const userId = session?.user?.id;

    // Fetch mentee stats
    const [mentorship, goals, upcomingMeetings] = await Promise.all([
        prisma.mentorship.findFirst({
            where: { mentees: { some: { menteeId: userId } }, status: "active" },
            include: { mentor: true, programCycle: true }
        }),
        prisma.goal.findMany({
            where: { mentorship: { mentees: { some: { menteeId: userId } } } },
        }),
        prisma.meeting.findMany({
            where: { mentorship: { mentees: { some: { menteeId: userId } } }, status: "scheduled" },
            orderBy: { scheduledAt: "asc" },
            take: 3
        })
    ]);

    const stats = [
        { title: "Mục tiêu", value: goals.length, icon: <Target />, color: "black" },
        { title: "Sắp tới", value: upcomingMeetings.length, icon: <Calendar />, color: "black" },
        { title: "Tỉ lệ đạt", value: "65%", icon: <CheckCircle />, color: "black" },
    ];

    return (
        <div className="space-y-10 pb-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-black">Bảng điều khiển Mentee</h1>
                <p className="text-[#666] text-sm">Chào mừng bạn trở lại, {session?.user?.name || "Mentee"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Mentor Profile */}
                    {mentorship && (
                        <Card className="bg-black text-white border-none p-10 overflow-hidden relative group">
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                <Avatar
                                    firstName={mentorship.mentor.firstName}
                                    lastName={mentorship.mentor.lastName}
                                    src={mentorship.mentor.avatar}
                                    size="xl"
                                    className="w-24 h-24 border-[#333]"
                                />
                                <div className="text-center md:text-left space-y-4 flex-1">
                                    <div>
                                        <span className="text-[12px] font-semibold text-[#888] leading-none mb-1 block">Mentor của tôi</span>
                                        <h3 className="text-2xl font-bold text-white">{mentorship.mentor.firstName} {mentorship.mentor.lastName}</h3>
                                    </div>
                                    <p className="text-sm text-[#888] line-clamp-2 max-w-lg leading-relaxed">{mentorship.mentor.bio || "No bio available."}</p>
                                    <Button variant="outline" className="text-white border-[#333] hover:border-white hover:bg-transparent" asChild>
                                        <Link href={`/admin/mentorships/${mentorship.id}`}>Hồ sơ & Trao đổi</Link>
                                    </Button>
                                </div>
                            </div>
                            <Zap className="absolute -top-10 -right-10 w-40 h-40 text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                        </Card>
                    )}

                    {/* Goal Progress */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-black">Tiến độ mục tiêu</h3>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/goals">Tất cả</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {goals.slice(0, 4).map(goal => (
                                <Card key={goal.id} className="p-5 space-y-4" hover>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-black truncate leading-tight flex-1 pr-4">{goal.title}</p>
                                        <span className="text-[12px] font-bold text-[#666]">{goal.currentValue}%</span>
                                    </div>
                                    <Progress value={goal.currentValue} size="xs" color="default" />
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Upcoming Meetings */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-black">Các buổi họp sắp tới</h3>
                    <div className="space-y-4">
                        {upcomingMeetings.length === 0 ? (
                            <p className="text-sm text-[#999] italic">Hiện tại bạn không có lịch họp.</p>
                        ) : (
                            upcomingMeetings.map(meeting => (
                                <div key={meeting.id} className="p-4 rounded-[8px] border border-[#eaeaea] flex items-center gap-5 hover:border-black transition-all bg-white group">
                                    <div className="w-12 h-12 rounded-[6px] bg-[#fafafa] border border-[#eaeaea] flex items-center justify-center text-[#999] group-hover:bg-black group-hover:text-white transition-colors">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-black truncate leading-tight mb-1">{meeting.title}</p>
                                        <p className="text-[12px] text-[#666] font-medium">{formatDate(meeting.scheduledAt, "dd/MM HH:mm")}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <Button className="w-full" variant="outline" asChild>
                            <Link href="/calendar">Lịch trình chi tiết</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

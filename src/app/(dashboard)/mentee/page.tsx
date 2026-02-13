import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target, Calendar, CheckCircle, Zap } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MenteeDashboard() {
    const session = await auth();
    const userId = session?.user?.id;
    const role = (session?.user as any).role;
    const isAdmin = role === "admin";

    // Admin sees first active mentorship + all goals; mentee sees only theirs
    const menteeFilter = isAdmin ? {} : { menteeId: userId };

    const [mentorship, goals, upcomingMeetings] = await Promise.all([
        prisma.mentorship.findFirst({
            where: isAdmin ? { status: "active" } : { mentees: { some: { menteeId: userId } }, status: "active" },
            include: { mentor: true, programCycle: true }
        }),
        prisma.goal.findMany({
            where: isAdmin ? {} : { mentorship: { mentees: { some: { menteeId: userId } } } },
            take: 20,
        }),
        prisma.meeting.findMany({
            where: isAdmin ? { status: "scheduled" } : { mentorship: { mentees: { some: { menteeId: userId } } }, status: "scheduled" },
            orderBy: { scheduledAt: "asc" },
            take: 5
        })
    ]);

    const completedGoals = goals.filter(g => g.currentValue >= 100).length;
    const completionRate = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

    const stats = [
        { title: "Mục tiêu", value: goals.length, icon: <Target /> },
        { title: "Sắp tới", value: upcomingMeetings.length, icon: <Calendar /> },
        { title: "Tỉ lệ đạt", value: `${completionRate}%`, icon: <CheckCircle /> },
    ];

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            {isAdmin && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#fafafa] border border-[#eaeaea] rounded-lg text-xs text-[#666]">
                    <span className="w-2 h-2 rounded-full bg-[#0070f3]" />
                    Bạn đang xem ở chế độ Admin Preview — dữ liệu hiển thị toàn bộ hệ thống
                </div>
            )}
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-black">Bảng điều khiển Mentee</h1>
                <p className="text-sm text-[#666] mt-1">{isAdmin ? "Xem trước giao diện Mentee (tổng hợp dữ liệu toàn hệ thống)" : `Chào mừng bạn trở lại, ${session?.user?.name || "Mentee"}.`}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-12">
                    {/* Mentor Profile */}
                    {mentorship && (
                        <Card className="bg-black text-white border-none p-10 overflow-hidden relative group" padding="none">
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <Avatar
                                    firstName={mentorship.mentor.firstName}
                                    lastName={mentorship.mentor.lastName}
                                    src={mentorship.mentor.avatar}
                                    size="xl"
                                    className="w-24 h-24 border-[#333] shadow-lg"
                                />
                                <div className="text-center md:text-left space-y-5 flex-1">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-medium text-[#888] leading-none mb-2 block">Mentor của tôi</span>
                                        <h3 className="text-3xl font-bold text-white">{mentorship.mentor.firstName} {mentorship.mentor.lastName}</h3>
                                    </div>
                                    <p className="text-sm text-[#888] line-clamp-2 max-w-lg leading-relaxed font-medium">{mentorship.mentor.bio || "No bio available."}</p>
                                    <Button variant="outline" className="text-white border-[#333] hover:border-white hover:bg-white hover:text-black transition-all duration-300" asChild>
                                        <Link href={`/admin/mentorships/${mentorship.id}`}>Hồ sơ & Trao đổi</Link>
                                    </Button>
                                </div>
                            </div>
                            <Zap className="absolute -top-10 -right-10 w-48 h-48 text-white/5 opacity-40 group-hover:scale-110 transition-transform duration-700 ease-out" />
                        </Card>
                    )}

                    {/* Goal Progress */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-black">Tiến độ mục tiêu</h3>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/goals">Xem tất cả</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {goals.slice(0, 4).map(goal => (
                                <Card key={goal.id} className="p-6 space-y-5" hover>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-black truncate leading-tight flex-1 pr-4">{goal.title}</p>
                                        <span className="text-xs font-bold text-[#666]">{goal.currentValue}%</span>
                                    </div>
                                    <Progress value={goal.currentValue} size="sm" color="default" />
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Upcoming Meetings */}
                <div className="space-y-8">
                    <h3 className="text-lg font-semibold text-black">Lịch họp sắp tới</h3>
                    <div className="space-y-4">
                        {upcomingMeetings.length === 0 ? (
                            <p className="text-sm text-[#999] italic">Hiện tại bạn không có lịch họp.</p>
                        ) : (
                            upcomingMeetings.map(meeting => (
                                <div key={meeting.id} className="p-5 rounded-[8px] border border-[#eaeaea] flex items-center gap-5 hover:border-black transition-all bg-white group">
                                    <div className="w-12 h-12 rounded-[6px] bg-[#fafafa] border border-[#eaeaea] flex items-center justify-center text-[#999] group-hover:bg-black group-hover:text-white transition-all duration-200">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <p className="text-sm font-semibold text-black truncate">{meeting.title}</p>
                                        <p className="text-[11px] text-[#999] font-medium">{formatDate(meeting.scheduledAt, "dd/MM · HH:mm")}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <Button className="w-full mt-4" variant="outline" asChild>
                            <Link href="/calendar">Lịch trình chi tiết</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

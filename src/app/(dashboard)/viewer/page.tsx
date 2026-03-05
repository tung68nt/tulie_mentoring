import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Award, CheckCircle2, ArrowUpRight, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function ViewerDashboard() {
    const session = await auth();
    if (!session?.user || !["admin", "viewer"].includes((session.user as any).role)) {
        redirect("/login");
    }

    try {
        // Aggregate real metrics for the entire program
        const [
            activeCycles,
            totalMeetings,
            completedGoals,
            totalGoals,
            totalAttendances,
            presentAttendances,
            mentorships,
            recentMeetings,
        ] = await Promise.all([
            prisma.programCycle.count({ where: { status: "active" } }),
            prisma.meeting.count({ where: { status: "completed" } }),
            prisma.goal.count({ where: { status: "completed" } }),
            prisma.goal.count(),
            prisma.attendance.count({
                where: {
                    meeting: { status: "completed" }
                }
            }),
            prisma.attendance.count({
                where: {
                    status: "present",
                    meeting: { status: "completed" }
                }
            }),
            prisma.mentorship.findMany({
                where: { status: "active" },
                include: {
                    mentor: true,
                    mentees: { include: { mentee: true } },
                    programCycle: true,
                },
                take: 6,
                orderBy: { createdAt: "desc" }
            }),
            prisma.meeting.findMany({
                orderBy: { scheduledAt: "desc" },
                take: 5,
                include: {
                    mentorship: {
                        include: {
                            mentor: true
                        }
                    }
                }
            })
        ]);

        const attendanceRate = totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 0;
        const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        return (
            <div className="space-y-8 animate-fade-in pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground">Giám sát Chương trình</h1>
                        <p className="text-sm text-muted-foreground mt-1 text-bold">Chào mừng Thầy/Cô. Đây là tổng quan hoạt động và tiến độ của toàn bộ chương trình.</p>
                    </div>
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/reports" className="block transition-transform active:scale-95">
                        <StatCard
                            title="Tỉ lệ hiện diện"
                            value={`${attendanceRate}%`}
                            icon={<Users className="w-5 h-5 text-blue-500" />}
                            subtitle="Trung bình các buổi sinh hoạt"
                            className="bg-blue-50/10 border-blue-500/10 hover:border-blue-500/30 transition-all cursor-pointer"
                        />
                    </Link>
                    <Link href="/reports" className="block transition-transform active:scale-95">
                        <StatCard
                            title="Mục tiêu hoàn thành"
                            value={`${goalCompletionRate}%`}
                            icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                            subtitle={`${completedGoals}/${totalGoals} mục tiêu đã xong`}
                            className="bg-emerald-50/10 border-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer"
                        />
                    </Link>
                    <Link href="/admin/mentorships" className="block transition-transform active:scale-95">
                        <StatCard
                            title="Tổng buổi sinh hoạt"
                            value={totalMeetings}
                            icon={<Calendar className="w-5 h-5 text-amber-500" />}
                            subtitle="Buổi họp đã được tổ chức"
                            className="bg-amber-50/10 border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer"
                        />
                    </Link>
                    <Link href="/reports" className="block transition-transform active:scale-95">
                        <StatCard
                            title="Đợt mentoring"
                            value={activeCycles}
                            icon={<BarChart3 className="w-5 h-5 text-purple-500" />}
                            subtitle="Chương trình đang hoạt động"
                            className="bg-purple-50/10 border-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer"
                        />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Active Mentorships */}
                    <Card className="lg:col-span-12" padding="lg">
                        <CardHeader className="flex flex-row items-center justify-between mb-6">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Theo dõi Mentorship gần đây
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/mentees">Xem tất cả <ArrowRight className="ml-2 w-4 h-4" /></Link>
                            </Button>
                        </CardHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mentorships.map((m) => (
                                <div key={m.id} className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-all flex flex-col justify-between h-full shadow-none">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                firstName={m.mentor.firstName ?? ""}
                                                lastName={m.mentor.lastName ?? ""}
                                                src={m.mentor.avatar || undefined}
                                                size="sm"
                                            />
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground leading-none">Mentor</p>
                                                <p className="text-sm font-semibold">{m.mentor.firstName} {m.mentor.lastName}</p>
                                            </div>
                                        </div>
                                        <Badge status={m.status} size="sm" />
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {m.mentees.map(mt => (
                                            <div key={mt.mentee.id} className="flex items-center gap-2 pr-3 py-1 bg-muted rounded-full">
                                                <Avatar
                                                    firstName={mt.mentee.firstName ?? ""}
                                                    lastName={mt.mentee.lastName ?? ""}
                                                    src={mt.mentee.avatar || undefined}
                                                    size="xs"
                                                />
                                                <span className="text-[10px] font-bold text-foreground">{mt.mentee.firstName} {mt.mentee.lastName}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                                        <div className="text-[10px] font-bold text-muted-foreground no-uppercase opacity-80">
                                            {m.programCycle.name}
                                        </div>
                                        <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2 shadow-none hover:bg-primary/5 hover:text-primary transition-colors">
                                            <Link href={`/admin/mentorships/${m.id}`}>Chi tiết</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Recent Meetings */}
                    <Card className="lg:col-span-8" padding="lg">
                        <CardHeader className="mb-6">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Hoạt động sinh hoạt mới nhất
                            </CardTitle>
                        </CardHeader>
                        <div className="space-y-4">
                            {recentMeetings.map((meeting) => (
                                <div key={meeting.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors shadow-none">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-primary leading-none no-uppercase">{formatDate(meeting.scheduledAt, "MMM")}</span>
                                        <span className="text-base font-bold text-primary leading-none mt-1">{formatDate(meeting.scheduledAt, "dd")}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">{meeting.title}</p>
                                        <p className="text-xs text-muted-foreground">Mentor: {meeting.mentorship.mentor.firstName} {meeting.mentorship.mentor.lastName}</p>
                                    </div>
                                    <Badge status={meeting.status} size="sm" />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Quick Info / Legend */}
                    <Card className="lg:col-span-4 bg-primary/5 border-primary/10" padding="lg">
                        <CardHeader className="mb-4">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 no-uppercase tracking-wide">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                Ghi chú vai trò
                            </CardTitle>
                        </CardHeader>
                        <div className="space-y-4 text-xs font-medium text-muted-foreground leading-relaxed">
                            <p>
                                Vai trò <span className="text-primary font-bold">Viewer</span> dành cho Ban cố vấn & Giảng viên của Khoa.
                            </p>
                            <p>
                                Thầy/Cô có quyền xem toàn bộ hoạt động, tiến độ mục tiêu, và hồ sơ của tất cả sinh viên trong các đợt Mentoring.
                            </p>
                            <ul className="space-y-2 list-disc pl-4 mt-2">
                                <li>Xem báo cáo thống kê định kỳ</li>
                                <li>Kiểm tra tình hình điểm danh (attendance)</li>
                                <li>Theo dõi lộ trình mục tiêu (milestones)</li>
                                <li>Đọc các bài thu hoạch, sổ tay sinh viên</li>
                            </ul>
                        </div>
                    </Card>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch viewer dashboard data:", error);
        return (
            <div className="p-8 border border-destructive/20 rounded-xl bg-destructive/5 text-center">
                <p className="text-destructive font-semibold">Đã có lỗi xảy ra khi tải dữ liệu dành cho Viewer.</p>
            </div>
        );
    }
}

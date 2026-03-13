import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
    Calendar, Users, Target, MessageSquare, ArrowLeft, Clock,
    MapPin, Video, CheckCircle2, ChevronRight
} from "lucide-react";

export default async function MenteeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user) {
        redirect("/login");
    }

    const { id: mentorshipId } = await params;
    const userId = session.user.id;

    try {
        const mentorship = await prisma.mentorship.findUnique({
            where: { id: mentorshipId },
            include: {
                mentor: { include: { mentorProfile: true } },
                mentees: {
                    include: {
                        mentee: { include: { menteeProfile: true } }
                    }
                },
                programCycle: true,
                meetings: {
                    orderBy: { scheduledAt: "desc" },
                    include: {
                        _count: { select: { attendances: true } }
                    }
                },
                goals: {
                    orderBy: { createdAt: "desc" },
                    include: { creator: true }
                },
                feedbacks: {
                    orderBy: { createdAt: "desc" },
                    include: { fromUser: true, toUser: true }
                },
            }
        });

        if (!mentorship) {
            notFound();
        }

        // Security: mentor can only see their own mentorships
        if (role === "mentor" && mentorship.mentorId !== userId) {
            redirect("/mentees");
        }

        const data = JSON.parse(JSON.stringify(mentorship));

        return (
            <div className="space-y-8 pb-10 animate-fade-in">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/mentees">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-semibold text-foreground">Chi tiết Mentorship</h1>
                            <Badge status={data.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {data.programCycle?.name} • {formatDate(data.programCycle?.startDate)} - {formatDate(data.programCycle?.endDate)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Mentees */}
                        <Card padding="lg" className="border-border shadow-none">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Mentees ({data.mentees.length})
                                </CardTitle>
                            </CardHeader>
                            <div className="space-y-4">
                                {data.mentees.map((m: any) => (
                                    <div key={m.menteeId} className="flex items-center gap-3">
                                        <Avatar
                                            firstName={m.mentee.firstName}
                                            lastName={m.mentee.lastName}
                                            src={m.mentee.avatar}
                                            size="md"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {m.mentee.firstName} {m.mentee.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {m.mentee.menteeProfile?.major} • Năm {m.mentee.menteeProfile?.year}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Program Info */}
                        <Card padding="lg" className="bg-muted/30 border-border/50 shadow-none">
                            <h4 className="text-sm font-semibold mb-4">Thông tin chương trình</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-xs text-muted-foreground">Kỳ:</span>
                                    <span className="font-semibold">{data.programCycle?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-muted-foreground">Trạng thái:</span>
                                    <Badge status={data.programCycle?.status} size="sm" />
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-muted-foreground">Hình thức:</span>
                                    <span className="font-semibold capitalize">{data.type?.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <p className="text-xs font-semibold text-primary mb-1">Buổi họp</p>
                                <p className="text-2xl font-semibold text-foreground leading-none">{data.meetings.length}</p>
                            </div>
                            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                                <p className="text-xs font-semibold text-emerald-600 mb-1">Mục tiêu</p>
                                <p className="text-2xl font-semibold text-foreground leading-none">{data.goals.length}</p>
                            </div>
                            <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                                <p className="text-xs font-semibold text-amber-600 mb-1">Phản hồi</p>
                                <p className="text-2xl font-semibold text-foreground leading-none">{data.feedbacks.length}</p>
                            </div>
                        </div>

                        {/* Meetings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" /> Lịch sử các buổi họp
                            </h3>
                            {data.meetings.length === 0 ? (
                                <div className="py-12 text-center border border-dashed border-border rounded-xl">
                                    <Calendar className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">Chưa có buổi họp nào</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.meetings.map((meeting: any) => (
                                        <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="block group">
                                            <Card hover padding="none" className="overflow-hidden">
                                                <div className="p-4 flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center shrink-0 border border-border">
                                                        <span className="text-[10px] font-semibold text-muted-foreground leading-none">
                                                            {formatDate(meeting.scheduledAt, "MMM")}
                                                        </span>
                                                        <span className="text-lg font-semibold text-foreground leading-none mt-1">
                                                            {formatDate(meeting.scheduledAt, "dd")}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{meeting.title}</h4>
                                                            <Badge status={meeting.status} size="sm" />
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {formatDate(meeting.scheduledAt, "HH:mm")} ({meeting.duration} phút)
                                                            </div>
                                                            {meeting.type === "online" ? (
                                                                <div className="flex items-center gap-1">
                                                                    <Video className="w-3.5 h-3.5" /> Trực tuyến
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin className="w-3.5 h-3.5" /> {meeting.location || "Offline"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-muted-foreground/30 self-center group-hover:text-primary transition-colors" />
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Goals */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Target className="w-5 h-5 text-emerald-500" /> Mục tiêu phát triển
                            </h3>
                            {data.goals.length === 0 ? (
                                <div className="py-12 text-center border border-dashed border-border rounded-xl">
                                    <Target className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">Chưa có mục tiêu nào</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.goals.map((goal: any) => (
                                        <Card key={goal.id} padding="lg">
                                            <div className="flex items-start justify-between mb-3">
                                                <Badge status={goal.status} size="sm" />
                                                <span className="text-[10px] font-medium text-muted-foreground">{goal.category}</span>
                                            </div>
                                            <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">{goal.title}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">{goal.description}</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-foreground">{Math.round((goal.currentValue / (goal.targetValue || 100)) * 100)}%</span>
                                                    <span className="text-muted-foreground">{goal.currentValue}/{goal.targetValue} {goal.unit || ""}</span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-emerald-500 h-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, Math.round((goal.currentValue / (goal.targetValue || 100)) * 100))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Feedback */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-amber-500" /> Phản hồi & Đánh giá
                            </h3>
                            {data.feedbacks.length === 0 ? (
                                <div className="py-12 text-center border border-dashed border-border rounded-xl">
                                    <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">Chưa có phản hồi nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.feedbacks.map((fb: any) => (
                                        <Card key={fb.id} padding="lg" className="bg-muted/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                                    <span>{fb.fromUser.firstName} {fb.fromUser.lastName}</span>
                                                    <ArrowLeft className="w-3 h-3 text-muted-foreground rotate-180" />
                                                    <span>{fb.toUser.firstName} {fb.toUser.lastName}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <CheckCircle2
                                                            key={i}
                                                            className={`w-3 h-3 ${i < (fb.rating || 0) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground leading-relaxed">"{fb.content}"</p>
                                            <p className="text-[10px] text-muted-foreground mt-3">
                                                {formatDate(fb.createdAt, "PPP")}
                                            </p>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch mentorship details:", error);
        return (
            <div className="p-8 border border-destructive/20 rounded-xl bg-destructive/5">
                <p className="text-destructive font-semibold mb-2">Đã có lỗi xảy ra:</p>
                <code className="text-xs bg-background p-2 rounded block overflow-auto whitespace-pre-wrap">
                    {error instanceof Error ? error.message : String(error)}
                </code>
            </div>
        );
    }
}

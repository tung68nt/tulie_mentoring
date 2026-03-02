import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
    Calendar,
    Users,
    Target,
    MessageSquare,
    ArrowLeft,
    Clock,
    MapPin,
    Video,
    CheckCircle2,
    TrendingUp,
    ChevronRight,
    Users2
} from "lucide-react";

export default async function MentorshipDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || !["admin", "viewer"].includes((session.user as any).role)) {
        redirect("/login");
    }

    const { id: mentorshipId } = await params;

    try {
        const mentorship = await prisma.mentorship.findUnique({
            where: { id: mentorshipId },
            include: {
                mentor: {
                    include: {
                        mentorProfile: true
                    }
                },
                mentees: {
                    include: {
                        mentee: {
                            include: {
                                menteeProfile: true
                            }
                        }
                    }
                },
                programCycle: true,
                meetings: {
                    orderBy: { scheduledAt: "desc" },
                    include: {
                        _count: {
                            select: {
                                attendances: true,
                            }
                        }
                    }
                },
                goals: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        creator: true
                    }
                },
                feedbacks: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        fromUser: true,
                        toUser: true
                    }
                }
            }
        });

        if (!mentorship) {
            notFound();
        }

        const serializedMentorship = JSON.parse(JSON.stringify(mentorship));

        return (
            <div className="space-y-8 pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/admin/mentorships">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-semibold text-foreground">Chi tiết Mentorship</h1>
                                <Badge status={serializedMentorship.status} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {serializedMentorship.programCycle.name} • {formatDate(serializedMentorship.startDate)} - {formatDate(serializedMentorship.endDate)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: People & Overview */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Mentor Card */}
                        <Card padding="lg" className="border-none shadow-sm ring-1 ring-border">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Users2 className="w-4 h-4" /> Mentor
                                </CardTitle>
                            </CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar
                                    firstName={serializedMentorship.mentor.firstName}
                                    lastName={serializedMentorship.mentor.lastName}
                                    src={serializedMentorship.mentor.avatar}
                                    size="lg"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {serializedMentorship.mentor.firstName} {serializedMentorship.mentor.lastName}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {serializedMentorship.mentor.mentorProfile?.jobTitle || "Mentor"}
                                    </p>
                                    <p className="text-xs text-muted-foreground/80">
                                        {serializedMentorship.mentor.mentorProfile?.company}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Mentees Card */}
                        <Card padding="lg" className="border-none shadow-sm ring-1 ring-border">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Mentees ({serializedMentorship.mentees.length})
                                </CardTitle>
                            </CardHeader>
                            <div className="space-y-4">
                                {serializedMentorship.mentees.map((m: any) => (
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
                        <Card padding="lg" className="bg-muted/30 border-none shadow-none ring-1 ring-border/50">
                            <h4 className="text-sm font-semibold mb-4">Thông tin chương trình</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground uppercase text-xs font-bold tracking-tight">Kỳ:</span>
                                    <span className="font-semibold">{serializedMentorship.programCycle.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground uppercase text-xs font-bold tracking-tight">Trạng thái:</span>
                                    <Badge status={serializedMentorship.programCycle.status} size="sm" />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground uppercase text-xs font-bold tracking-tight">Hình thức:</span>
                                    <span className="font-semibold capitalize">{serializedMentorship.type.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Activities, Goals, Feedback */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Buổi họp</p>
                                <p className="text-2xl font-bold text-foreground leading-none">{serializedMentorship.meetings.length}</p>
                            </div>
                            <div className="bg-success/5 p-4 rounded-2xl border border-success/10">
                                <p className="text-xs font-bold text-success mb-1 uppercase tracking-wider">Mục tiêu</p>
                                <p className="text-2xl font-bold text-foreground leading-none">{serializedMentorship.goals.length}</p>
                            </div>
                            <div className="bg-warning/5 p-4 rounded-2xl border border-warning/10">
                                <p className="text-xs font-bold text-warning mb-1 uppercase tracking-wider">Phản hồi</p>
                                <p className="text-2xl font-bold text-foreground leading-none">{serializedMentorship.feedbacks.length}</p>
                            </div>
                        </div>

                        {/* Meetings */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" /> Lịch sử các buổi họp
                                </h3>
                            </div>
                            {serializedMentorship.meetings.length === 0 ? (
                                <Card className="py-12 border-dashed border-2 flex flex-col items-center justify-center text-center opacity-70">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-3 font-bold no-uppercase">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">Chưa có buổi họp nào được ghi nhận</p>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {serializedMentorship.meetings.map((meeting: any) => (
                                        <Card key={meeting.id} hover padding="none" className="overflow-hidden">
                                            <div className="p-4 flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center shrink-0 border border-border">
                                                    <span className="text-[10px] font-bold text-muted-foreground leading-none no-uppercase">
                                                        {formatDate(meeting.scheduledAt, "MMM")}
                                                    </span>
                                                    <span className="text-lg font-bold text-foreground leading-none mt-1">
                                                        {formatDate(meeting.scheduledAt, "dd")}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <h4 className="text-sm font-semibold text-foreground truncate">{meeting.title}</h4>
                                                        <Badge status={meeting.status} size="sm" />
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
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
                                                <ChevronRight className="w-5 h-5 text-muted-foreground/30 self-center" />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Goals */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Target className="w-5 h-5 text-success" /> Mục tiêu phát triển
                            </h3>
                            {serializedMentorship.goals.length === 0 ? (
                                <Card className="py-12 border-dashed border-2 flex flex-col items-center justify-center text-center opacity-70">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-3 font-bold no-uppercase">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">Chưa có mục tiêu nào được thiết lập</p>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {serializedMentorship.goals.map((goal: any) => (
                                        <Card key={goal.id} padding="lg">
                                            <div className="flex items-start justify-between mb-3">
                                                <Badge status={goal.status} size="sm" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">
                                                    {goal.category}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-foreground mb-1 line-clamp-1">{goal.title}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">{goal.description}</p>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-foreground">{Math.round((goal.currentValue / (goal.targetValue || 100)) * 100)}% Hoàn thành</span>
                                                    <span className="text-muted-foreground font-medium">
                                                        {goal.currentValue}/{goal.targetValue} {goal.unit || ""}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-success h-full transition-all duration-500"
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
                                <MessageSquare className="w-5 h-5 text-warning" /> Phản hồi & Đánh giá
                            </h3>
                            {serializedMentorship.feedbacks.length === 0 ? (
                                <Card className="py-12 border-dashed border-2 flex flex-col items-center justify-center text-center opacity-70 font-bold no-uppercase">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-3">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">Chưa có phản hồi nào</p>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {serializedMentorship.feedbacks.map((fb: any) => (
                                        <Card key={fb.id} padding="lg" className="bg-muted/10 group-hover:bg-muted/20 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-foreground">
                                                        {fb.fromUser.firstName} {fb.fromUser.lastName}
                                                    </span>
                                                    <ArrowLeft className="w-3 h-3 text-muted-foreground rotate-180" />
                                                    <span className="text-xs font-bold text-foreground">
                                                        {fb.toUser.firstName} {fb.toUser.lastName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <CheckCircle2
                                                            key={i}
                                                            className={`w-3 h-3 ${i < (fb.rating || 0) ? "text-warning fill-warning" : "text-muted-foreground/30"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground italic leading-relaxed">
                                                "{fb.content}"
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-3 font-bold uppercase tracking-tight">
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
                <p className="text-destructive font-semibold mb-2">Đã có lỗi xảy ra khi tải dữ liệu:</p>
                <code className="text-xs bg-background p-2 rounded block overflow-auto whitespace-pre-wrap">
                    {error instanceof Error ? error.message : String(error)}
                </code>
            </div>
        );
    }
}

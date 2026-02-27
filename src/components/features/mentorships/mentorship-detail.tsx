"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
    Plus,
    History,
    Check,
    Calendar,
    Target,
    User as UserIcon,
    Briefcase,
    GraduationCap,
    Clock,
    ChevronRight
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { confirmGoal } from "@/lib/actions/goal";
import { confirmReflection } from "@/lib/actions/reflection";

interface MentorshipDetailProps {
    mentorship: any;
    userRole: string;
}

export function MentorshipDetailView({ mentorship, userRole }: MentorshipDetailProps) {
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Tổng quan", icon: <UserIcon className="w-4 h-4" /> },
        { id: "meetings", label: "Cuộc họp", icon: <Calendar className="w-4 h-4" /> },
        { id: "goals", label: "Mục tiêu", icon: <Target className="w-4 h-4" /> },
        { id: "reflections", label: "Nhật ký thu hoạch", icon: <History className="w-4 h-4" /> },
    ];

    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleConfirmGoal = async (id: string) => {
        setIsLoading(id);
        try {
            await confirmGoal(id);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(null);
        }
    };

    const handleConfirmReflection = async (id: string) => {
        setIsLoading(id);
        try {
            await confirmReflection(id);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge status={mentorship.status} />
                        <span className="text-sm text-muted-foreground font-medium">{mentorship.programCycle.name}</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        {mentorship.type === "one_on_one" ? "Cặp Mentoring 1:1" : "Nhóm Mentoring"}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild>
                        <Link href="/calendar">
                            <Calendar className="w-4 h-4 mr-2" />
                            Lịch hoạt động
                        </Link>
                    </Button>
                    {(userRole === "admin" || userRole === "mentor") && (
                        <Button asChild>
                            <Link href={`/meetings/new?mentorshipId=${mentorship.id}`}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tạo cuộc họp
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList variant="line" className="mb-6">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === "overview" && (
                        <>
                            {/* Mentor Card */}
                            <Card>
                                <div className="flex items-start gap-4">
                                    <Avatar
                                        firstName={mentorship.mentor.firstName}
                                        lastName={mentorship.mentor.lastName}
                                        src={mentorship.mentor.avatar}
                                        size="xl"
                                    />
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-foreground">
                                                Mentor: {mentorship.mentor.firstName} {mentorship.mentor.lastName}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{mentorship.mentor.bio || "No bio available."}</p>
                                        <div className="flex flex-wrap gap-4 mt-3">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                <span>{mentorship.mentor.mentorProfile?.company || "Professional"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <GraduationCap className="w-3.5 h-3.5" />
                                                <span>
                                                    {(() => {
                                                        const exp = mentorship.mentor.mentorProfile?.expertise;
                                                        if (!exp) return "Expertise";
                                                        try {
                                                            const parsed = typeof exp === 'string' ? JSON.parse(exp) : exp;
                                                            return Array.isArray(parsed) ? parsed.join(", ") : parsed;
                                                        } catch (e) {
                                                            return exp;
                                                        }
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Mentees Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">Danh sách Mentees</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mentorship.mentees.map((mt: any) => (
                                        <Card key={mt.id} className="p-4" hover>
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    firstName={mt.mentee.firstName}
                                                    lastName={mt.mentee.lastName}
                                                    src={mt.mentee.avatar}
                                                    size="md"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-foreground truncate">
                                                        {mt.mentee.firstName} {mt.mentee.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {mt.mentee.menteeProfile?.major || "Student"} - Năm {mt.mentee.menteeProfile?.year || "1"}
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "meetings" && (
                        <Card>
                            <h3 className="text-lg font-semibold text-foreground mb-6">Lịch sử cuộc họp gần đây</h3>
                            <div className="space-y-4">
                                {mentorship.meetings.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">Chưa có cuộc họp nào được ghi lại.</p>
                                ) : (
                                    mentorship.meetings.map((meeting: any) => (
                                        <div key={meeting.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-md bg-primary flex flex-col items-center justify-center text-primary-foreground">
                                                    <span className="text-[10px] font-bold leading-none">{formatDate(meeting.scheduledAt, "MMM")}</span>
                                                    <span className="text-sm font-bold leading-none mt-0.5">{formatDate(meeting.scheduledAt, "dd")}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{meeting.title}</p>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDate(meeting.scheduledAt, "HH:mm")}
                                                        </span>
                                                        {/* Removed empty Badge causing render crash */}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/meetings/${meeting.id}`}>Biên bản</Link>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    )}

                    {activeTab === "goals" && (
                        <Card>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-foreground">Mục tiêu đào tạo</h3>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/goals">
                                        <Plus className="w-3 h-3 mr-1.5" />
                                        Thêm mục tiêu
                                    </Link>
                                </Button>
                            </div>
                            <div className="space-y-6">
                                {mentorship.goals.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">Chưa có mục tiêu nào được thiết lập.</p>
                                ) : (
                                    mentorship.goals.map((goal: any) => (
                                        <div key={goal.id} className="space-y-3 p-4 rounded-xl border border-border/50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{goal.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-medium text-muted-foreground">{goal.category}</span>
                                                        {goal.mentorConfirmed && (
                                                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 text-[9px] h-4">Đã xác nhận</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {userRole === "mentor" && !goal.mentorConfirmed && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-[11px] rounded-lg"
                                                            onClick={() => handleConfirmGoal(goal.id)}
                                                            isLoading={isLoading === goal.id}
                                                        >
                                                            <Check className="w-3 h-3 mr-1" />
                                                            Xác nhận
                                                        </Button>
                                                    )}
                                                    <span className="text-xs font-medium text-muted-foreground">{goal.currentValue}/{goal.targetValue || 100}%</span>
                                                </div>
                                            </div>
                                            <Progress value={goal.currentValue} max={goal.targetValue || 100} size="sm" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    )}

                    {activeTab === "reflections" && (
                        <Card>
                            <h3 className="text-lg font-semibold text-foreground mb-6">Nhật ký thu hoạch từ Mentee</h3>
                            <div className="space-y-4">
                                {mentorship.sessionReflections.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">Chưa có nhật ký thu hoạch nào.</p>
                                ) : (
                                    mentorship.sessionReflections.map((ref: any) => (
                                        <div key={ref.id} className="p-4 rounded-xl border border-border/50 space-y-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-muted-foreground/40 tracking-wider">
                                                        {formatDate(ref.createdAt)}
                                                    </p>
                                                    <h4 className="font-semibold text-foreground text-sm leading-snug">
                                                        {ref.meeting?.title}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {ref.mentorConfirmed && (
                                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 text-[10px]">Đã xác nhận</Badge>
                                                    )}
                                                    {userRole === "mentor" && !ref.mentorConfirmed && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 rounded-lg"
                                                            onClick={() => handleConfirmReflection(ref.id)}
                                                            isLoading={isLoading === ref.id}
                                                        >
                                                            <Check className="w-3.5 h-3.5 mr-1.5" />
                                                            Xác nhận đọc
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-border/5">
                                                <p className="text-[13px] text-muted-foreground italic line-clamp-2">
                                                    Nội dung đã được ghi nhận...
                                                </p>
                                                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" asChild>
                                                    <Link href="/reflections">Xem chi tiết</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <h4 className="text-sm font-semibold text-foreground mb-4">Thông tin chung</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Ngày bắt đầu</span>
                                <span className="font-medium text-foreground">{formatDate(mentorship.startDate)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Ngày kết thúc</span>
                                <span className="font-medium text-foreground">{formatDate(mentorship.endDate)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Thời gian còn lại</span>
                                <span className="font-medium text-primary">6 tháng</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-primary text-primary-foreground border-none">
                        <h4 className="text-sm font-semibold mb-4 opacity-70">Hiệu suất</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs opacity-70">Số buổi họp</span>
                                <span className="text-lg font-bold">{mentorship.meetings.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs opacity-70">Tỉ lệ tham gia</span>
                                <span className="text-lg font-bold">100%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs opacity-70">Mục tiêu đạt được</span>
                                <span className="text-lg font-bold">45%</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

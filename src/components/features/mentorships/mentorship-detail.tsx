"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
    Calendar,
    Target,
    User as UserIcon,
    Briefcase,
    GraduationCap,
    Clock,
    ChevronRight,
    Plus
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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
    ];

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
                                        <div key={meeting.id} className="flex items-center justify-between p-4 rounded-[8px] border border-border hover:bg-muted transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-[6px] bg-black flex flex-col items-center justify-center text-white">
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
                                                        <Badge variant="outline" size="sm" />
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
                                        <div key={goal.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-foreground">{goal.title}</p>
                                                <span className="text-xs font-medium text-muted-foreground">{goal.currentValue}/{goal.targetValue || 100}%</span>
                                            </div>
                                            <Progress value={goal.currentValue} max={goal.targetValue || 100} size="sm" />
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

                    <Card className="bg-black text-white border-none">
                        <h4 className="text-sm font-semibold mb-4 opacity-70">Thống kê nhanh</h4>
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

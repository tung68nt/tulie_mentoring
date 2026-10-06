"use client";

import { JourneyStats } from "@/lib/actions/journey";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Award,
    CalendarCheck,
    FileText,
    HelpCircle,
    BookOpen,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Flame,
    Sparkles,
    Check,
    X,
} from "lucide-react";

interface MenteeJourneyLogProps {
    stats: JourneyStats;
    title?: string;
    description?: string;
    showMentorTips?: boolean;
}

export function MenteeJourneyLog({
    stats,
    title = "Nhật ký hành trình & Mức độ gắn kết",
    description = "Toàn bộ thông số đo lường mức độ chuyên cần, tập trung và nhiệt tình tham gia chương trình",
    showMentorTips = true,
}: MenteeJourneyLogProps) {
    // Màu sắc & huy hiệu dựa trên điểm
    const getScoreBadgeColor = (score: number) => {
        if (score >= 90) return "bg-emerald-600 text-white";
        if (score >= 75) return "bg-blue-600 text-white";
        if (score >= 60) return "bg-amber-600 text-white";
        return "bg-rose-600 text-white";
    };

    return (
        <Card className="p-6 md:p-8 rounded-2xl border-border bg-card/60 backdrop-blur-md shadow-sm space-y-6">
            {/* Header with Title and Overall Score */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Flame className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl">{description}</p>
                </div>

                {/* Overall Score Badge */}
                <div className="flex items-center gap-4 bg-muted/30 p-3.5 rounded-2xl border border-border">
                    <div className={`w-14 h-14 rounded-2xl ${getScoreBadgeColor(stats.engagementScore)} flex flex-col items-center justify-center shadow-xs shrink-0`}>
                        <span className="text-xl font-black leading-none">{stats.engagementScore}</span>
                        <span className="text-[9px] font-bold opacity-80 uppercase tracking-tighter">/ 100</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">Chỉ số nhiệt tình:</span>
                            <Badge className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stats.levelColor}`}>
                                {stats.levelLabel}
                            </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {stats.engagementScore >= 80
                                ? "Rất chủ động, hoàn thành mọi hoạt động xuất sắc."
                                : stats.engagementScore >= 60
                                ? "Tham gia đều đặn, có tinh thần học hỏi tốt."
                                : "Cần tăng cường tham gia các buổi họp và nộp bài đúng hạn."}
                        </p>
                    </div>
                </div>
            </div>

            {/* 5 Pillar Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* 1. Điểm danh & Họp */}
                <div className="p-4 rounded-xl bg-background border border-border/80 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                            <CalendarCheck className="w-3.5 h-3.5 text-blue-500" />
                            Chuyên cần
                        </span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {stats.attendance.attendanceRate}%
                        </span>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-foreground">
                            {stats.attendance.presentCount}
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                                /{stats.attendance.totalMeetings || 0} buổi
                            </span>
                        </p>
                        <div className="mt-2 space-y-1">
                            <Progress value={stats.attendance.attendanceRate} className="h-1.5 bg-blue-100 dark:bg-blue-950" />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                                <span>Face-ID: {stats.attendance.faceVerifiedCount}</span>
                                <span>Nghỉ có phép: {stats.attendance.absentWithReasonCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Báo cáo & Thu hoạch */}
                <div className="p-4 rounded-xl bg-background border border-border/80 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-purple-500" />
                            Thu hoạch & Nhật ký
                        </span>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                            {stats.reflections.totalReports} bài
                        </span>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-foreground">
                            {stats.reflections.submittedCount}
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                                thu hoạch họp
                            </span>
                        </p>
                        <div className="mt-2 space-y-1">
                            <Progress
                                value={Math.min(100, (stats.reflections.totalReports / Math.max(1, stats.attendance.totalMeetings * 2)) * 100)}
                                className="h-1.5 bg-purple-100 dark:bg-purple-950"
                            />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                                <span>Nhật ký ngày: {stats.reflections.dailyDiariesCount}</span>
                                <span className="text-purple-600 font-medium">Chăm chỉ</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Bài tập thực hành */}
                <div className="p-4 rounded-xl bg-background border border-border/80 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                            Bài tập thực hành
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.assignments.submissionRate}%
                        </span>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-foreground">
                            {stats.assignments.submittedCount}
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                                /{stats.assignments.totalAssigned} bài
                            </span>
                        </p>
                        <div className="mt-2 space-y-1">
                            <Progress value={stats.assignments.submissionRate} className="h-1.5 bg-emerald-100 dark:bg-emerald-950" />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                                <span>Điểm TB:</span>
                                <span className="font-bold text-emerald-600">
                                    {stats.assignments.averageScore !== null ? `${stats.assignments.averageScore}/100` : "Chưa chấm"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Câu hỏi đặt cho Mentor */}
                <div className="p-4 rounded-xl bg-background border border-border/80 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                            Hỏi đáp với Mentor
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            Chủ động
                        </span>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-foreground">
                            {stats.questions.askedToMentorCount}
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                                câu hỏi RSVP
                            </span>
                        </p>
                        <div className="mt-2 space-y-1">
                            <Progress
                                value={Math.min(100, stats.questions.askedToMentorCount * 25)}
                                className="h-1.5 bg-amber-100 dark:bg-amber-950"
                            />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                                <span>Đặt câu hỏi trước</span>
                                <span className="text-amber-600 font-medium">Chuẩn bị kỹ</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Khảo sát & DISC */}
                <div className="p-4 rounded-xl bg-background border border-border/80 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            Khảo sát & DISC
                        </span>
                        {stats.onboarding.isComplete ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] px-1.5">
                                Đạt chuẩn
                            </Badge>
                        ) : (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] px-1.5">
                                Thiếu
                            </Badge>
                        )}
                    </div>
                    <div>
                        <p className="text-xl font-bold text-foreground flex items-center gap-1.5">
                            {stats.onboarding.personalityType ? (
                                <>
                                    Nhóm <span className="text-indigo-600">{stats.onboarding.personalityType}</span>
                                </>
                            ) : (
                                <span className="text-sm font-medium text-muted-foreground">Chưa làm test</span>
                            )}
                        </p>
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                {stats.onboarding.isComplete ? (
                                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                ) : (
                                    <X className="w-3 h-3 text-rose-500 shrink-0" />
                                )}
                                <span>Hồ sơ năng lực & định hướng</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                {stats.onboarding.hasPortraitPhoto ? (
                                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                ) : (
                                    <X className="w-3 h-3 text-rose-500 shrink-0" />
                                )}
                                <span>Ảnh chân dung Face Check-in</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assessment & Advice */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-foreground">
                            Đánh giá mức độ chuyên cần & nỗ lực
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {stats.engagementScore >= 85
                                ? "Bạn đang thể hiện tinh thần tham gia tuyệt vời! Hãy duy trì phong độ làm bài tập và tích cực trao đổi cùng Mentor."
                                : stats.engagementScore >= 65
                                ? "Tiến độ tham gia của bạn đang khá ổn định. Đừng quên nộp đầy đủ bài tập và chuẩn bị câu hỏi trước mỗi buổi họp nhé."
                                : "Hãy chủ động hơn trong việc tham gia các buổi meeting định kỳ, gửi bài thu hoạch và hoàn tất các bài tập được giao."}
                        </p>
                    </div>
                </div>

                {showMentorTips && (
                    <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground bg-background px-3 py-1.5 rounded-lg border border-border">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        <span>Chỉ số được cập nhật tự động sau mỗi phiên làm việc</span>
                    </div>
                )}
            </div>
        </Card>
    );
}

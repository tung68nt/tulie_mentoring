"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
    BookOpen,
    Plus,
    Calendar,
    Clock,
    Upload,
    Github,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Star,
    Send,
    Loader2,
    ChevronDown,
    ChevronUp,
    FileText,
} from "lucide-react";
import { createMeetingAssignment, submitAssignment, gradeAssignment } from "@/lib/actions/assignment";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import { FileViewerModal, FileItem } from "@/components/ui/file-viewer-modal";

interface Submission {
    id: string;
    menteeId: string;
    content?: string | null;
    attachmentUrls?: string | null;
    githubUrl?: string | null;
    submittedAt: string | Date;
    score?: number | null;
    mentorFeedback?: string | null;
    status: string;
    mentee?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        avatar?: string | null;
        email?: string | null;
    };
}

interface Assignment {
    id: string;
    meetingId: string;
    title: string;
    description?: string | null;
    dueDate?: string | Date | null;
    maxScore: number;
    attachmentUrls?: string | null;
    createdAt: string | Date;
    submissions: Submission[];
}

interface MeetingAssignmentSectionProps {
    meetingId: string;
    isMentor: boolean;
    currentUserId: string;
    assignments: Assignment[];
}

export function MeetingAssignmentSection({
    meetingId,
    isMentor,
    currentUserId,
    assignments = [],
}: MeetingAssignmentSectionProps) {
    const [isPending, startTransition] = useTransition();

    // Mentor create form state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [newMaxScore, setNewMaxScore] = useState(100);
    const [newAttachments, setNewAttachments] = useState("");

    // Mentee submission form state (keyed by assignmentId)
    const [activeSubmitId, setActiveSubmitId] = useState<string | null>(null);
    const [submitContent, setSubmitContent] = useState("");
    const [submitGithub, setSubmitGithub] = useState("");
    const [submitFileUrl, setSubmitFileUrl] = useState("");

    // Mentor grading state (keyed by submissionId)
    const [gradingSubId, setGradingSubId] = useState<string | null>(null);
    const [gradeScore, setGradeScore] = useState<number>(100);
    const [gradeFeedback, setGradeFeedback] = useState("");
    const [viewingFile, setViewingFile] = useState<FileItem | null>(null);

    // Handle Create Assignment
    const handleCreateAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            toast.error("Vui lòng nhập tiêu đề bài tập");
            return;
        }

        startTransition(async () => {
            try {
                await createMeetingAssignment({
                    meetingId,
                    title: newTitle,
                    description: newDesc,
                    dueDate: newDueDate || undefined,
                    maxScore: Number(newMaxScore) || 100,
                    attachmentUrls: newAttachments || undefined,
                });
                toast.success("Đã giao bài tập thành công!");
                setShowCreateForm(false);
                setNewTitle("");
                setNewDesc("");
                setNewDueDate("");
                setNewAttachments("");
            } catch (err: any) {
                toast.error(err.message || "Lỗi khi giao bài tập");
            }
        });
    };

    // Handle Mentee Submit Assignment
    const handleSubmitWork = (assignmentId: string) => {
        if (!submitContent.trim() && !submitGithub.trim() && !submitFileUrl.trim()) {
            toast.error("Vui lòng nhập nội dung, link GitHub hoặc file bài làm");
            return;
        }

        startTransition(async () => {
            try {
                await submitAssignment({
                    assignmentId,
                    content: submitContent,
                    githubUrl: submitGithub,
                    attachmentUrls: submitFileUrl,
                });
                toast.success("Nộp bài tập thành công!");
                setActiveSubmitId(null);
                setSubmitContent("");
                setSubmitGithub("");
                setSubmitFileUrl("");
            } catch (err: any) {
                toast.error(err.message || "Lỗi khi nộp bài");
            }
        });
    };

    // Handle Mentor Grade Submission
    const handleGradeSubmission = (submissionId: string) => {
        startTransition(async () => {
            try {
                await gradeAssignment({
                    submissionId,
                    score: Number(gradeScore),
                    mentorFeedback: gradeFeedback,
                });
                toast.success("Đã chấm điểm và gửi phản hồi cho Mentee!");
                setGradingSubId(null);
                setGradeFeedback("");
            } catch (err: any) {
                toast.error(err.message || "Lỗi khi chấm điểm");
            }
        });
    };

    return (
        <Card className="p-6 border-border bg-card shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Bài tập & Thực hành sau buổi họp
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {isMentor
                                ? "Giao bài tập, đặt lịch nhận bài và chấm điểm cho mentee"
                                : "Nộp bài tập thực hành để Mentor đánh giá và góp ý tiến độ"}
                        </p>
                    </div>
                </div>

                {isMentor && (
                    <Button
                        size="sm"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="rounded-xl h-8 px-3 text-xs font-semibold gap-1.5 shadow-xs shrink-0 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showCreateForm ? "Đóng form" : "Giao bài tập mới"}</span>
                    </Button>
                )}
            </div>

            {/* FORM GIAO BÀI TẬP (MENTOR) */}
            {isMentor && showCreateForm && (
                <form
                    onSubmit={handleCreateAssignment}
                    className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3.5 animate-in fade-in-50 duration-200"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            Giao bài tập / Thực hành mới
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Tiêu đề bài tập *</label>
                            <Input
                                placeholder="Ví dụ: Thiết kế Database & Hoàn thiện luồng Auth"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="h-8 text-xs bg-background"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Hạn nộp bài (Deadline)</label>
                            <Input
                                type="datetime-local"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                className="h-8 text-xs bg-background"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Mô tả yêu cầu bài tập</label>
                        <Textarea
                            placeholder="Mô tả cụ thể các tiêu chí cần hoàn thành, yêu cầu kỹ thuật, tài liệu tham khảo..."
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="text-xs min-h-[75px] bg-background"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Link tài liệu / Đề bài đính kèm</label>
                            <Input
                                placeholder="https://drive.google.com/... hoặc link Notion"
                                value={newAttachments}
                                onChange={(e) => setNewAttachments(e.target.value)}
                                className="h-8 text-xs bg-background"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Thang điểm tối đa</label>
                            <Input
                                type="number"
                                value={newMaxScore}
                                onChange={(e) => setNewMaxScore(Number(e.target.value))}
                                className="h-8 text-xs bg-background"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCreateForm(false)}
                            className="h-8 text-xs"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isPending}
                            className="h-8 px-4 text-xs font-semibold gap-1.5"
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>Phát hành bài tập</span>
                        </Button>
                    </div>
                </form>
            )}

            {/* DANH SÁCH BÀI TẬP */}
            {assignments.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">Chưa có bài tập nào cho buổi meeting này</p>
                    <p>Mentor sẽ giao bài tập thực hành sau khi buổi học kết thúc</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {assignments.map((assignment) => {
                        // Mentee's submission for this assignment
                        const mySubmission = assignment.submissions.find(
                            (s) => s.menteeId === currentUserId
                        );

                        return (
                            <div
                                key={assignment.id}
                                className="p-4 rounded-xl border border-border bg-card space-y-3.5"
                            >
                                {/* Assignment Meta */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-sm font-semibold text-foreground">
                                                {assignment.title}
                                            </h4>
                                            <Badge variant="outline" className="text-[10px] bg-muted">
                                                Điểm tối đa: {assignment.maxScore}
                                            </Badge>
                                        </div>

                                        {assignment.dueDate && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                                <span>Hạn nộp: {formatDate(assignment.dueDate, "HH:mm - dd/MM/yyyy")}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Mentee Status Badge */}
                                    {!isMentor && (
                                        <div>
                                            {mySubmission ? (
                                                mySubmission.score !== null ? (
                                                    <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-xs">
                                                        ★ Đã chấm: {mySubmission.score}/{assignment.maxScore} điểm
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-blue-500/15 text-blue-600 border border-blue-500/30 text-xs">
                                                        ✓ Đã nộp (Chờ chấm điểm)
                                                    </Badge>
                                                )
                                            ) : (
                                                <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30 text-xs">
                                                    ⏳ Chưa nộp bài
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {assignment.description && (
                                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/50">
                                        {assignment.description}
                                    </p>
                                )}

                                {assignment.attachmentUrls && (
                                    <div className="flex items-center gap-2 pt-1 text-xs">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setViewingFile({
                                                title: `Tài liệu: ${assignment.title}`,
                                                linkUrl: assignment.attachmentUrls,
                                                fileUrl: assignment.attachmentUrls,
                                                type: "document",
                                                category: "Đề bài thực hành",
                                            })}
                                            className="h-7 text-xs rounded-xl font-medium gap-1.5"
                                        >
                                            <FileText className="w-3.5 h-3.5 text-primary" />
                                            <span>Xem tài liệu / Đề bài chi tiết</span>
                                        </Button>
                                    </div>
                                )}

                                {/* MENTEE VIEW: FORM NỘP BÀI */}
                                {!isMentor && (
                                    <div className="pt-2 border-t border-border/60 space-y-2">
                                        {mySubmission && mySubmission.score !== null && mySubmission.mentorFeedback && (
                                            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs space-y-1">
                                                <p className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                    Nhận xét từ Mentor:
                                                </p>
                                                <p className="text-foreground leading-relaxed italic">
                                                    "{mySubmission.mentorFeedback}"
                                                </p>
                                            </div>
                                        )}

                                        {activeSubmitId === assignment.id ? (
                                            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3.5 animate-in fade-in-50">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-foreground">
                                                        Nội dung bài làm / Báo cáo kết quả:
                                                    </label>
                                                    <Textarea
                                                        placeholder="Mô tả kết quả thực hành, các tính năng đã làm được, khó khăn gặp phải..."
                                                        value={submitContent}
                                                        onChange={(e) => setSubmitContent(e.target.value)}
                                                        className="text-xs min-h-[70px] bg-background"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                                        <Github className="w-3 h-3" />
                                                        Link GitHub Repository / PR (Nếu có):
                                                    </label>
                                                    <Input
                                                        placeholder="https://github.com/..."
                                                        value={submitGithub}
                                                        onChange={(e) => setSubmitGithub(e.target.value)}
                                                        className="h-8 text-xs bg-background"
                                                    />
                                                </div>

                                                <FileUploadZone
                                                    label="Tệp đính kèm bài nộp / Link Google Drive, Figma"
                                                    description="Hỗ trợ PDF, DOCX, ZIP hoặc dán link Google Drive/Figma"
                                                    onFileSelected={(info) => {
                                                        if (info) {
                                                            setSubmitFileUrl(info.isCloudLink ? (info.linkUrl || "") : (info.dataUrl || ""));
                                                        } else {
                                                            setSubmitFileUrl("");
                                                        }
                                                    }}
                                                    currentFile={submitFileUrl ? {
                                                        name: "Tệp đính kèm bài nộp",
                                                        linkUrl: submitFileUrl,
                                                        dataUrl: submitFileUrl,
                                                        isCloudLink: submitFileUrl.startsWith("http")
                                                    } : null}
                                                />

                                                <div className="flex justify-end gap-2 pt-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setActiveSubmitId(null)}
                                                        className="h-7 text-xs"
                                                    >
                                                        Đóng
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSubmitWork(assignment.id)}
                                                        disabled={isPending}
                                                        className="h-7 px-3 text-xs font-semibold gap-1"
                                                    >
                                                        {isPending ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Send className="w-3 h-3" />
                                                        )}
                                                        <span>Xác nhận nộp bài</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-muted-foreground">
                                                    {mySubmission
                                                        ? `Đã nộp vào: ${formatDate(mySubmission.submittedAt, "HH:mm - dd/MM/yyyy")}`
                                                        : "Chưa nộp bài tập"}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant={mySubmission ? "outline" : "default"}
                                                    onClick={() => {
                                                        setActiveSubmitId(assignment.id);
                                                        setSubmitContent(mySubmission?.content || "");
                                                        setSubmitGithub(mySubmission?.githubUrl || "");
                                                        setSubmitFileUrl(mySubmission?.attachmentUrls || "");
                                                    }}
                                                    className="h-7 px-3 text-xs font-semibold gap-1"
                                                >
                                                    <Upload className="w-3 h-3" />
                                                    <span>{mySubmission ? "Cập nhật bài nộp" : "Nộp bài ngay"}</span>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* MENTOR VIEW: THEO DÕI & CHẤM ĐIỂM CẢ NHÓM */}
                                {isMentor && (
                                    <div className="pt-2 border-t border-border/60 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-foreground">
                                                Tiến độ nộp bài của nhóm: {assignment.submissions.length} bài đã nộp
                                            </span>
                                        </div>

                                        <div className="space-y-2 pt-1 divide-y divide-border/40">
                                            {assignment.submissions.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic py-2">
                                                    Chưa có mentee nào nộp bài
                                                </p>
                                            ) : (
                                                assignment.submissions.map((sub) => (
                                                    <div key={sub.id} className="pt-2.5 pb-1 space-y-2">
                                                        <div className="flex items-start justify-between gap-2 text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar
                                                                    firstName={sub.mentee?.firstName || undefined}
                                                                    lastName={sub.mentee?.lastName || undefined}
                                                                    src={sub.mentee?.avatar || undefined}
                                                                    size="sm"
                                                                />
                                                                <div>
                                                                    <p className="font-semibold text-foreground">
                                                                        {sub.mentee?.firstName} {sub.mentee?.lastName}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground">
                                                                        Nộp lúc: {formatDate(sub.submittedAt, "HH:mm - dd/MM")}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {sub.score !== null ? (
                                                                    <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-xs">
                                                                        {sub.score}/{assignment.maxScore} điểm
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/10">
                                                                        Chờ chấm
                                                                    </Badge>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setGradingSubId(gradingSubId === sub.id ? null : sub.id);
                                                                        setGradeScore(sub.score || 100);
                                                                        setGradeFeedback(sub.mentorFeedback || "");
                                                                    }}
                                                                    className="h-6 px-2 text-xs text-primary"
                                                                >
                                                                    {gradingSubId === sub.id ? "Đóng" : "Chấm bài"}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Submission details */}
                                                        {sub.content && (
                                                            <p className="text-xs text-foreground bg-muted/30 p-2 rounded-md border border-border/50">
                                                                {sub.content}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center gap-3 text-xs">
                                                            {sub.githubUrl && (
                                                                <a
                                                                    href={sub.githubUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1 text-primary hover:underline text-[11px]"
                                                                >
                                                                    <Github className="w-3 h-3" />
                                                                    <span>Repository GitHub</span>
                                                                </a>
                                                            )}
                                                            {sub.attachmentUrls && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setViewingFile({
                                                                        title: `Bài nộp: ${sub.mentee?.firstName || ""} ${sub.mentee?.lastName || ""}`,
                                                                        linkUrl: sub.attachmentUrls,
                                                                        fileUrl: sub.attachmentUrls,
                                                                        type: "submission",
                                                                        category: "Bài tập thực hành",
                                                                        uploadedBy: sub.mentee,
                                                                        createdAt: sub.submittedAt,
                                                                    })}
                                                                    className="h-6 px-1.5 text-[11px] text-primary hover:underline gap-1"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                    <span>Xem tệp bài nộp</span>
                                                                </Button>
                                                            )}
                                                        </div>

                                                        {/* Form chấm điểm */}
                                                        {gradingSubId === sub.id && (
                                                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2 mt-2">
                                                                <div className="flex items-center gap-2">
                                                                    <label className="text-xs font-semibold text-foreground">
                                                                        Điểm số (Tối đa {assignment.maxScore}):
                                                                    </label>
                                                                    <Input
                                                                        type="number"
                                                                        max={assignment.maxScore}
                                                                        value={gradeScore}
                                                                        onChange={(e) => setGradeScore(Number(e.target.value))}
                                                                        className="w-20 h-7 text-xs bg-background"
                                                                    />
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <label className="text-xs font-semibold text-foreground">
                                                                        Nhận xét & Góp ý cho Mentee:
                                                                    </label>
                                                                    <Textarea
                                                                        placeholder="Nhận xét ưu điểm, những chỗ cần cải thiện, cách tối ưu code..."
                                                                        value={gradeFeedback}
                                                                        onChange={(e) => setGradeFeedback(e.target.value)}
                                                                        className="text-xs min-h-[60px] bg-background"
                                                                    />
                                                                </div>

                                                                <div className="flex justify-end gap-2 pt-1">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => setGradingSubId(null)}
                                                                        className="h-7 text-xs"
                                                                    >
                                                                        Hủy
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleGradeSubmission(sub.id)}
                                                                        disabled={isPending}
                                                                        className="h-7 px-3 text-xs font-semibold"
                                                                    >
                                                                        {isPending ? "Đang lưu..." : "Lưu kết quả chấm"}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* File Viewer Modal for assignments and submissions */}
            <FileViewerModal
                file={viewingFile}
                isOpen={!!viewingFile}
                onClose={() => setViewingFile(null)}
            />
        </Card>
    );
}

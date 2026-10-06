"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
    FileText, Link2, FormInput, Plus, Upload, CheckCircle2,
    Clock, XCircle, AlertCircle, ExternalLink, Trash2, PenLine
} from "lucide-react";
import { toast } from "sonner";
import { createProcedure, submitProcedure, reviewSubmission, deleteProcedure } from "@/lib/actions/procedure";
import { formatDate } from "@/lib/utils";

interface ProceduresListProps {
    procedures: any[];
    role: string;
    userId: string;
}

const typeIcons: Record<string, any> = {
    file: FileText,
    form: FormInput,
    link: Link2,
};

const statusLabels: Record<string, { label: string; icon: any; color: string }> = {
    pending: { label: "Chưa nộp", icon: Clock, color: "text-amber-500" },
    submitted: { label: "Đã nộp", icon: Upload, color: "text-blue-500" },
    approved: { label: "Đã duyệt", icon: CheckCircle2, color: "text-emerald-500" },
    rejected: { label: "Từ chối", icon: XCircle, color: "text-red-500" },
};

function CreateProcedureModal() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "file" as "file" | "form" | "link",
        fileUrl: "",
        targetRole: "mentee" as "mentee" | "mentor" | "both",
        isRequired: true,
        deadline: "",
    });

    const handleCreate = async () => {
        if (!form.title) { toast.error("Tên thủ tục là bắt buộc"); return; }
        setIsLoading(true);
        try {
            await createProcedure(form);
            toast.success("Đã tạo thủ tục thành công");
            setOpen(false);
            setForm({ title: "", description: "", type: "file", fileUrl: "", targetRole: "mentee", isRequired: true, deadline: "" });
        } catch {
            toast.error("Lỗi khi tạo thủ tục");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Thêm thủ tục</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Thêm thủ tục mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <div>
                        <Label>Tên thủ tục *</Label>
                        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ví dụ: Nộp đơn cam kết" className="mt-1" />
                    </div>
                    <div>
                        <Label>Mô tả</Label>
                        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chi tiết yêu cầu..." className="mt-1" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Loại</Label>
                            <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="file">📄 Nộp file</SelectItem>
                                    <SelectItem value="link">🔗 Link</SelectItem>
                                    <SelectItem value="form">📝 Biểu mẫu</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Đối tượng</Label>
                            <Select value={form.targetRole} onValueChange={(v: any) => setForm({ ...form, targetRole: v })}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mentee">Mentee</SelectItem>
                                    <SelectItem value="mentor">Mentor</SelectItem>
                                    <SelectItem value="both">Cả hai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {(form.type === "file" || form.type === "link") && (
                        <div>
                            <Label>{form.type === "link" ? "Link URL" : "File mẫu (URL)"}</Label>
                            <Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." className="mt-1" />
                        </div>
                    )}
                    <div>
                        <Label>Hạn nộp</Label>
                        <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="mt-1" />
                    </div>
                </div>
                <DialogFooter className="gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
                    <Button onClick={handleCreate} disabled={isLoading}>
                        {isLoading ? "Đang tạo..." : "Tạo thủ tục"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SubmitDialog({ procedure, existingSubmission }: { procedure: any; existingSubmission: any }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fileUrl, setFileUrl] = useState(existingSubmission?.fileUrl || "");
    const [note, setNote] = useState(existingSubmission?.note || "");

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await submitProcedure(procedure.id, { fileUrl, note });
            toast.success("Đã nộp thành công!");
            setOpen(false);
        } catch {
            toast.error("Lỗi khi nộp");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant={existingSubmission ? "outline" : "default"} className="gap-1.5">
                    {existingSubmission ? <PenLine className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                    {existingSubmission ? (existingSubmission.status === "submitted" ? "Sửa bài nộp" : "Sửa bản nháp") : "Nộp bài"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Nộp: {procedure.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    {procedure.description && (
                        <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{procedure.description}</p>
                    )}
                    {procedure.type !== "form" && (
                        <div>
                            <Label>{procedure.type === "link" ? "Link nộp bài" : "URL file đã nộp"}</Label>
                            <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." className="mt-1" />
                        </div>
                    )}
                    <div>
                        <Label>Ghi chú</Label>
                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú thêm (nếu có)..." className="mt-1" rows={2} />
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Đang nộp..." : "Xác nhận nộp"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ReviewDialog({ submission }: { submission: any }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reviewNote, setReviewNote] = useState("");

    const handleReview = async (status: "approved" | "rejected") => {
        setIsLoading(true);
        try {
            await reviewSubmission(submission.id, { status, reviewNote });
            toast.success(status === "approved" ? "Đã duyệt" : "Đã từ chối");
            setOpen(false);
        } catch {
            toast.error("Lỗi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                    <CheckCircle2 className="w-3 h-3" /> Duyệt
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Phê duyệt bài nộp</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    {submission.fileUrl && (
                        <a href={submission.fileUrl} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <ExternalLink className="w-3.5 h-3.5" /> {submission.fileUrl}
                        </a>
                    )}
                    {submission.note && (
                        <p className="text-sm bg-muted/30 p-3 rounded-lg">{submission.note}</p>
                    )}
                    <div>
                        <Label>Nhận xét</Label>
                        <Textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Nhận xét cho sinh viên..." className="mt-1" rows={2} />
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="destructive" onClick={() => handleReview("rejected")} disabled={isLoading}>Từ chối</Button>
                    <Button onClick={() => handleReview("approved")} disabled={isLoading}>Duyệt</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ProceduresList({ procedures, role, userId }: ProceduresListProps) {
    const isAdmin = ["admin", "manager", "facilitator", "program_manager"].includes(role);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteProcedure(id);
            toast.success("Đã xoá thủ tục");
        } catch {
            toast.error("Lỗi khi xoá");
        } finally {
            setDeletingId(null);
        }
    };

    if (procedures.length === 0) {
        return (
            <EmptyState
                icon={<FileText className="w-5 h-5" />}
                title="Chưa có thủ tục nào"
                description={isAdmin ? "Nhấn \"Thêm thủ tục\" để tạo yêu cầu mới." : "Không có thủ tục nào cần hoàn thành."}
                action={isAdmin ? <CreateProcedureModal /> : undefined}
            />
        );
    }

    return (
        <div className="space-y-6">
            {isAdmin && (
                <div className="flex justify-end">
                    <CreateProcedureModal />
                </div>
            )}

            <div className="space-y-4">
                {procedures.map((proc: any) => {
                    const TypeIcon = typeIcons[proc.type] || FileText;
                    const userSubmission = proc.submissions?.find((s: any) => s.userId === userId);
                    const submissionStatus = userSubmission ? statusLabels[userSubmission.status] : statusLabels.pending;
                    const StatusIcon = submissionStatus.icon;

                    return (
                        <Card key={proc.id} className="p-5 border-border/60 shadow-none">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <TypeIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-foreground">{proc.title}</h3>
                                            {proc.isRequired && (
                                                <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">BẮT BUỘC</span>
                                            )}
                                            <span className="text-[10px] font-medium text-muted-foreground/60 capitalize">
                                                {proc.targetRole === "both" ? "Mentor & Mentee" : proc.targetRole}
                                            </span>
                                        </div>
                                        {proc.description && (
                                            <p className="text-sm text-muted-foreground/80 line-clamp-2">{proc.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground/60 pt-1">
                                            {proc.deadline && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Hạn: {formatDate(proc.deadline)}
                                                </span>
                                            )}
                                            {proc.fileUrl && (
                                                <a href={proc.fileUrl} target="_blank" rel="noopener" className="flex items-center gap-1 text-primary hover:underline">
                                                    <ExternalLink className="w-3 h-3" /> {proc.type === "link" ? "Mở link" : "File mẫu"}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {!isAdmin && (
                                        <>
                                            <div className={`flex items-center gap-1.5 text-xs font-medium ${submissionStatus.color}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {submissionStatus.label}
                                            </div>
                                            {userSubmission?.status !== "approved" && (
                                                <SubmitDialog procedure={proc} existingSubmission={userSubmission} />
                                            )}
                                        </>
                                    )}

                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(proc.id)}
                                            disabled={deletingId === proc.id}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Admin: show submissions */}
                            {isAdmin && proc.submissions?.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border/30">
                                    <p className="text-xs font-bold text-muted-foreground/60 mb-2">
                                        Bài nộp ({proc.submissions.length})
                                    </p>
                                    <div className="space-y-2">
                                        {proc.submissions.map((sub: any) => {
                                            const subStatus = statusLabels[sub.status] || statusLabels.pending;
                                            const SubIcon = subStatus.icon;
                                            return (
                                                <div key={sub.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/20">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className={`flex items-center gap-1 text-xs font-medium ${subStatus.color}`}>
                                                            <SubIcon className="w-3 h-3" />
                                                            {subStatus.label}
                                                        </div>
                                                        {sub.submittedAt && (
                                                            <span className="text-[10px] text-muted-foreground/50">
                                                                {formatDate(sub.submittedAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {sub.status === "submitted" && (
                                                        <ReviewDialog submission={sub} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

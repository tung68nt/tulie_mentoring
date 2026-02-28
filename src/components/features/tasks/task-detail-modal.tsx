"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Paperclip, MessageSquare, Send, CheckCircle2, Circle, Plus, Trash2, ListChecks } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { updateTask } from "@/lib/actions/task";
import { useSession } from "next-auth/react";
import { formatDate, cn } from "@/lib/utils";

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string | null;
    startDate?: string | null;
    actualStartDate?: string | null;
    actualCompletedAt?: string | null;
    column: string;
    description?: string | null;
    attachments?: string | null;
    comments?: string | null;
    checklist?: string | null;
    completedPercentage?: number;
}

interface TaskDetailModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedTask: Task) => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onUpdate }: TaskDetailModalProps) {
    const { data: session } = useSession();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [actualStartDate, setActualStartDate] = useState("");
    const [actualCompletedAt, setActualCompletedAt] = useState("");
    const [comments, setComments] = useState<any[]>([]);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [checklist, setChecklist] = useState<any[]>([]);
    const [completedPercentage, setCompletedPercentage] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [newChecklistItem, setNewChecklistItem] = useState("");
    const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
    const [newAttachmentName, setNewAttachmentName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setCompletedPercentage(task.completedPercentage || 0);

            const formatDateForInput = (dateString?: string | null) => {
                if (!dateString) return "";
                const date = new Date(dateString);
                return date.toISOString().split("T")[0];
            };

            setDueDate(formatDateForInput(task.dueDate));
            setStartDate(formatDateForInput(task.startDate));
            setActualStartDate(formatDateForInput(task.actualStartDate));
            setActualCompletedAt(formatDateForInput(task.actualCompletedAt));

            try {
                setComments(task.comments ? JSON.parse(task.comments) : []);
            } catch (e) {
                setComments([]);
            }

            try {
                setAttachments(task.attachments ? JSON.parse(task.attachments) : []);
            } catch (e) {
                setAttachments([]);
            }

            try {
                setChecklist(task.checklist ? JSON.parse(task.checklist) : []);
            } catch (e) {
                setChecklist([]);
            }
        }
    }, [task]);

    if (!task) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await updateTask(task.id, {
                title,
                description,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                startDate: startDate ? new Date(startDate).toISOString() : null,
                actualStartDate: actualStartDate ? new Date(actualStartDate).toISOString() : null,
                actualCompletedAt: actualCompletedAt ? new Date(actualCompletedAt).toISOString() : null,
                comments: JSON.stringify(comments),
                attachments: JSON.stringify(attachments),
                checklist: JSON.stringify(checklist),
                completedPercentage: completedPercentage
            });
            onUpdate(updated);
            onClose();
        } catch (error) {
            console.error("Failed to update task:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const calculatePercentage = (items: any[]) => {
        if (items.length === 0) return completedPercentage; // Keep manually set or default
        const completed = items.filter(item => item.isCompleted).length;
        return Math.round((completed / items.length) * 100);
    };

    const handleAddChecklistItem = () => {
        if (!newChecklistItem.trim()) return;
        const newItem = {
            id: Date.now().toString(),
            title: newChecklistItem,
            isCompleted: false
        };
        const updatedChecklist = [...checklist, newItem];
        setChecklist(updatedChecklist);
        setCompletedPercentage(calculatePercentage(updatedChecklist));
        setNewChecklistItem("");
    };

    const toggleChecklistItem = (id: string) => {
        const updatedChecklist = checklist.map(item =>
            item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
        );
        setChecklist(updatedChecklist);
        setCompletedPercentage(calculatePercentage(updatedChecklist));
    };

    const removeChecklistItem = (id: string) => {
        const updatedChecklist = checklist.filter(item => item.id !== id);
        setChecklist(updatedChecklist);
        setCompletedPercentage(calculatePercentage(updatedChecklist));
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const comment = {
            id: Date.now().toString(),
            text: newComment,
            authorId: session?.user?.id || "unknown",
            authorName: session?.user?.name || "User",
            createdAt: new Date().toISOString()
        };
        setComments([...comments, comment]);
        setNewComment("");
    };

    const handleAddAttachment = () => {
        if (!newAttachmentUrl.trim() || !newAttachmentName.trim()) return;
        const attachment = {
            id: Date.now().toString(),
            name: newAttachmentName,
            url: newAttachmentUrl,
        };
        setAttachments([...attachments, attachment]);
        setNewAttachmentName("");
        setNewAttachmentUrl("");
    };

    const handleRemoveAttachment = (id: string) => {
        setAttachments(attachments.filter(a => a.id !== id));
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Chi tiết công việc</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Tiêu đề</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-base font-medium h-10"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dates Group 1 */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider px-1">Ngày bắt đầu dự kiến</label>
                                <div className="flex items-center gap-2 group">
                                    <Calendar className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="h-9 text-sm flex-1 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider px-1">Ngày bắt đầu thực tế</label>
                                <div className="flex items-center gap-2 group">
                                    <Clock className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="date"
                                        value={actualStartDate}
                                        onChange={(e) => setActualStartDate(e.target.value)}
                                        className="h-9 text-sm flex-1 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dates Group 2 */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider px-1">Hạn chót dự kiến</label>
                                <div className="flex items-center gap-2 group">
                                    <Calendar className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="h-9 text-sm flex-1 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider px-1">Ngày hoàn thành thực tế</label>
                                <div className="flex items-center gap-2 group">
                                    <CheckCircle2 className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="date"
                                        value={actualCompletedAt}
                                        onChange={(e) => setActualCompletedAt(e.target.value)}
                                        className="h-9 text-sm flex-1 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-3 bg-muted/30 p-4 rounded-2xl border border-border/40">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">Tiến độ hoàn thành</label>
                            <span className="text-sm font-bold text-primary">{completedPercentage}%</span>
                        </div>
                        <Progress value={completedPercentage} className="h-2" />
                        {checklist.length === 0 && (
                            <div className="flex items-center gap-3 pt-2">
                                <span className="text-[11px] font-medium text-muted-foreground">Tự chỉnh %:</span>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={completedPercentage}
                                    onChange={(e) => setCompletedPercentage(Number(e.target.value))}
                                    className="h-7 w-16 text-xs text-center rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    {/* Checklist */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ListChecks className="w-4 h-4 text-primary" />
                                <label className="text-xs font-semibold text-foreground">Danh sách việc cần làm (Checklist)</label>
                            </div>
                            {checklist.length > 0 && (
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    {checklist.filter(i => i.isCompleted).length}/{checklist.length}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {checklist.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 group bg-muted/20 p-2 rounded-xl border border-transparent hover:border-border/60 transition-all">
                                    <button
                                        onClick={() => toggleChecklistItem(item.id)}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {item.isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500/10" />
                                        ) : (
                                            <Circle className="w-5 h-5" />
                                        )}
                                    </button>
                                    <span className={cn(
                                        "text-sm flex-1 transition-all",
                                        item.isCompleted ? "text-muted-foreground line-through" : "text-foreground font-medium"
                                    )}>
                                        {item.title}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeChecklistItem(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {checklist.length === 0 && (
                                <p className="text-xs text-muted-foreground italic bg-muted/40 p-3 rounded-xl border border-dashed text-center">
                                    Chưa có mục checklist nào. Hãy thêm các đầu việc con để tự động tính % hoàn thành.
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2 items-center">
                            <Input
                                placeholder="Thêm việc cần làm..."
                                value={newChecklistItem}
                                onChange={(e) => setNewChecklistItem(e.target.value)}
                                className="h-9 text-sm flex-1 rounded-xl"
                                onKeyDown={(e) => e.key === "Enter" && handleAddChecklistItem()}
                            />
                            <Button size="sm" className="h-9 px-3 rounded-xl gap-2" onClick={handleAddChecklistItem} disabled={!newChecklistItem.trim()}>
                                <Plus className="w-4 h-4" />
                                Thêm
                            </Button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Mô tả chi tiết</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Thêm mô tả công việc của bạn ở đây..."
                            className="min-h-[100px] text-sm resize-none"
                        />
                    </div>

                    {/* Attachments */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                            <label className="text-xs font-semibold text-muted-foreground">Tệp & Liên kết đính kèm</label>
                        </div>

                        {attachments.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {attachments.map(att => (
                                    <div key={att.id} className="flex items-center justify-between p-2 rounded-md border text-sm group">
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[400px]">
                                            {att.name}
                                        </a>
                                        <Button variant="ghost" size="sm" className="h-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleRemoveAttachment(att.id)}>
                                            Xóa
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 items-start mt-2">
                            <Input
                                placeholder="Tên liên kết..."
                                value={newAttachmentName}
                                onChange={(e) => setNewAttachmentName(e.target.value)}
                                className="h-8 text-sm flex-1"
                            />
                            <Input
                                placeholder="https://..."
                                value={newAttachmentUrl}
                                onChange={(e) => setNewAttachmentUrl(e.target.value)}
                                className="h-8 text-sm flex-[2]"
                            />
                            <Button size="sm" className="h-8 shrink-0" onClick={handleAddAttachment} disabled={!newAttachmentName.trim() || !newAttachmentUrl.trim()}>
                                Thêm
                            </Button>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <label className="text-xs font-semibold text-muted-foreground">Bình luận</label>
                        </div>

                        <div className="flex flex-col gap-3">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex flex-col gap-1 bg-muted/40 p-3 rounded-lg text-sm">
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground/80">{comment.authorName}</span>
                                        <span>{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-foreground/90">{comment.text}</p>
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <p className="text-xs text-muted-foreground italic">Chưa có bình luận nào.</p>
                            )}
                        </div>

                        <div className="flex gap-2 items-start mt-2">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Viết bình luận hoặc feedback..."
                                className="min-h-[60px] text-sm resize-none"
                            />
                            <Button size="icon" className="shrink-0" onClick={handleAddComment} disabled={!newComment.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

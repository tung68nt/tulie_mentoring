"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Paperclip, MessageSquare, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateTask } from "@/lib/actions/task";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string | null;
    column: string;
    description?: string | null;
    attachments?: string | null;
    comments?: string | null;
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
    const [comments, setComments] = useState<any[]>([]);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
    const [newAttachmentName, setNewAttachmentName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");

            if (task.dueDate) {
                // simple yyyy-mm-dd format for input type="date"
                const date = new Date(task.dueDate);
                setDueDate(date.toISOString().split("T")[0]);
            } else {
                setDueDate("");
            }

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
                comments: JSON.stringify(comments),
                attachments: JSON.stringify(attachments)
            });
            onUpdate(updated);
            onClose();
        } catch (error) {
            console.error("Failed to update task:", error);
        } finally {
            setIsSaving(false);
        }
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

                    <div className="grid grid-cols-2 gap-4">
                        {/* Status / Priority */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground">Trạng thái & Độ ưu tiên</label>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="h-8">
                                    {task.status === "todo" ? "Cần làm" : task.status === "doing" ? "Đang làm" : task.status === "review" ? "Đang xem xét" : "Hoàn thành"}
                                </Badge>
                                <Badge variant="secondary" className="h-8">
                                    {task.priority === "high" ? "Cao" : task.priority === "medium" ? "Trung bình" : "Thấp"}
                                </Badge>
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground">Hạn chót (Deadline)</label>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="h-8 text-sm flex-1"
                                />
                            </div>
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

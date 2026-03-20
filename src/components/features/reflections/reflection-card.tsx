"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Trash2, CheckCircle2, Eye } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { deleteReflection } from "@/lib/actions/reflection";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { blocksToText } from "@/components/ui/block-editor";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ReflectionCardProps {
    reflection: any;
    userRole: string;
}

export function ReflectionCard({ reflection, userRole }: ReflectionCardProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa bài thu hoạch này?")) return;
        setIsLoading(true);
        try {
            await deleteReflection(reflection.id);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const contentText = reflection.content
        ? (reflection.content.startsWith('[') ? blocksToText(reflection.content) : reflection.content)
        : "Chưa có nội dung ghi chép.";

    return (
        <Dialog>
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors group">
                {/* Date badge */}
                <div className="w-9 h-9 rounded-md bg-purple-500/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold text-purple-600 leading-none">
                        {formatDate(reflection.createdAt, "MMM")}
                    </span>
                    <span className="text-xs font-bold text-purple-600 leading-none mt-0.5">
                        {formatDate(reflection.createdAt, "dd")}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                            {reflection.meeting?.title}
                        </p>
                        {reflection.mentorConfirmed && (
                            <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-200/50 text-[9px] rounded px-1.5 py-0 font-semibold shrink-0">
                                Đã xác nhận
                            </Badge>
                        )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {contentText.substring(0, 120)}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                            <Eye className="w-3.5 h-3.5" />
                        </Button>
                    </DialogTrigger>
                    {!(userRole === "mentee" && reflection.mentorConfirmed) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            disabled={isLoading}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            <DialogContent className="max-w-2xl rounded-2xl border border-border/60 p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-8 bg-muted/20 border-b border-border/40">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md tracking-wider">
                                {formatDate(reflection.createdAt).toUpperCase()}
                            </span>
                            {reflection.mentorConfirmed && (
                                <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-200/50 text-[10px] rounded-md font-bold px-2 py-0.5">Đã xác nhận bởi Mentor</Badge>
                            )}
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-xl font-bold tracking-tight text-foreground leading-tight no-uppercase">
                                {reflection.meeting?.title}
                            </DialogTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground/70 font-medium italic">
                                <span>Buổi hướng dẫn cùng:</span>
                                <span className="text-foreground/80 font-bold not-italic font-sans">{reflection.meeting?.mentorship?.mentor?.firstName} {reflection.meeting?.mentorship?.mentor?.lastName}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-card/50">
                    <div className="prose prose-slate max-w-none">
                        <div className="whitespace-pre-wrap text-[15px] text-foreground/90 leading-relaxed font-medium">
                            {reflection.content && reflection.content.startsWith('[') ? (
                                <div className="space-y-3">
                                    {blocksToText(reflection.content).split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            ) : (
                                reflection.content || "Chưa có nội dung ghi chép."
                            )}
                        </div>
                    </div>

                    {reflection.todoItems && reflection.todoItems.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-border/40 space-y-3">
                            <h5 className="text-sm font-bold text-foreground no-uppercase">Các hành động cần triển khai (Action Items)</h5>
                            <ul className="space-y-2">
                                {reflection.todoItems.map((todo: any) => (
                                    <li key={todo.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/10">
                                        <CheckCircle2 className={cn("w-4 h-4 mt-0.5", todo.status === "done" ? "text-green-500" : "text-muted-foreground/30")} />
                                        <span className={cn("text-[13px] font-medium", todo.status === "done" ? "text-muted-foreground line-through" : "text-foreground/80")}>
                                            {todo.title}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

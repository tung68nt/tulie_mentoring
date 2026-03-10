"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Trash2, CheckCircle2 } from "lucide-react";
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

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="p-6 rounded-lg border border-border/60 transition-all group overflow-hidden relative bg-card shadow-none hover:border-primary/40 cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 flex items-center gap-1">
                        {reflection.mentorConfirmed && (
                            <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-200/50 text-[10px] rounded-md font-semibold">Đã xác nhận</Badge>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            {!(userRole === "mentee" && reflection.mentorConfirmed) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/5 rounded-md"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete();
                                    }}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                            <History className="w-4 h-4 text-muted-foreground/30 mr-1" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold text-muted-foreground/40">
                                    {formatDate(reflection.createdAt)}
                                </span>
                            </div>
                            <h4 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors pr-8">
                                {reflection.meeting?.title}
                            </h4>
                            <p className="text-[12px] text-muted-foreground/60">
                                Mentor: {reflection.meeting?.mentorship?.mentor?.firstName} {reflection.meeting?.mentorship?.mentor?.lastName}
                            </p>
                        </div>
                        <div className="pt-2 border-t border-border/10">
                            <p className="text-[13px] text-muted-foreground line-clamp-3 leading-relaxed">
                                {reflection.content ? (
                                    reflection.content.startsWith('[')
                                        ? blocksToText(reflection.content)
                                        : reflection.content
                                ) : "Chưa có nội dung ghi chép."}
                            </p>
                        </div>
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl border border-border/60 p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-10 bg-muted/20 border-b border-border/40">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md tracking-wider">
                                {formatDate(reflection.createdAt).toUpperCase()}
                            </span>
                            {reflection.mentorConfirmed && (
                                <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-200/50 text-[10px] rounded-md font-bold px-2 py-0.5">Đã xác nhận bởi Mentor</Badge>
                            )}
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-3xl font-extrabold tracking-tight text-foreground leading-tight no-uppercase">
                                {reflection.meeting?.title}
                            </DialogTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground/70 font-medium italic">
                                <span>Buổi hướng dẫn cùng:</span>
                                <span className="text-foreground/80 font-bold not-italic font-sans">{reflection.meeting?.mentorship?.mentor?.firstName} {reflection.meeting?.mentorship?.mentor?.lastName}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>
                <div className="p-10 max-h-[65vh] overflow-y-auto custom-scrollbar bg-card/50">
                    <div className="prose prose-slate max-w-none">
                        <div className="whitespace-pre-wrap text-[16px] text-foreground/90 leading-relaxed font-medium">
                            {reflection.content && reflection.content.startsWith('[') ? (
                                <div className="space-y-4">
                                    {blocksToText(reflection.content).split('\n').filter(l => l.trim()).map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            ) : (
                                reflection.content || "Chưa có nội dung ghi chép."
                            )}
                        </div>
                    </div>

                    {reflection.todoItems && reflection.todoItems.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-border/40 space-y-4">
                            <h5 className="text-sm font-bold text-foreground no-uppercase">Các hành động cần triển khai (Action Items)</h5>
                            <ul className="space-y-3">
                                {reflection.todoItems.map((todo: any) => (
                                    <li key={todo.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/10">
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

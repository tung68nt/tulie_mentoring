"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format, eachDayOfInterval, parseISO, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { BookText, CheckCircle2, Circle, Edit3, Save, X } from "lucide-react";
import { saveDailyLog } from "@/lib/actions/report";
import { toast } from "sonner";

interface DailyDiaryProps {
    startDate: string;
    endDate: string;
    diaryMap: Record<string, { id: string; content: string; title: string }>;
}

export function DailyDiary({ startDate, endDate, diaryMap }: DailyDiaryProps) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = eachDayOfInterval({ start, end }).reverse(); // Most recent first

    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = (dateStr: string, existingContent: string) => {
        setEditingDate(dateStr);
        setContent(existingContent);
    };

    const handleSave = async () => {
        if (!editingDate) return;
        setIsSaving(true);
        try {
            await saveDailyLog(editingDate, content);
            toast.success("Nhật ký đã được lưu");
            setEditingDate(null);
            setContent("");
        } catch (error) {
            toast.error("Không thể lưu nhật ký");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="p-0 overflow-hidden shadow-none border-border/60 bg-background/50 backdrop-blur-sm">
            <div className="p-6 border-b border-border/40 bg-muted/20">
                <div className="flex items-center gap-2">
                    <BookText className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-foreground">Nhật ký hành trình</h3>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                    Ghi lại những cập nhật và bài học của bạn mỗi ngày trong chương trình.
                </p>
            </div>

            <div className="divide-y divide-border/40 max-h-[600px] overflow-y-auto custom-scrollbar">
                {days.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const diary = diaryMap[dateStr];
                    const isEditing = editingDate === dateStr;
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div key={dateStr} className={cn(
                            "p-5 transition-colors duration-200",
                            isToday && "bg-purple-500/5"
                        )}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-1.5",
                                        diary ? "bg-green-500" : "bg-muted-foreground/30"
                                    )} />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {format(day, "eeee, dd/MM/yyyy", { locale: vi })}
                                            {isToday && <span className="ml-2 text-[10px] text-purple-600 font-bold bg-purple-100 px-1.5 py-0.5 rounded tracking-normal italic">Hôm nay</span>}
                                        </p>
                                    </div>
                                </div>
                                {!isEditing && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(dateStr, diary?.content || "")}
                                        className="h-8 px-2 text-muted-foreground hover:text-purple-600 hover:bg-purple-50"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                                        <span className="text-xs">{diary ? "Sửa" : "Cập nhật"}</span>
                                    </Button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                                    <Textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Hôm nay bạn đã làm gì? Có bài học nào đáng nhớ không?"
                                        className="min-h-[120px] text-sm resize-none focus-visible:ring-purple-500 bg-background border-border/80"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingDate(null)}
                                            className="h-8 text-xs"
                                        >
                                            <X className="w-3.5 h-3.5 mr-1.5" />
                                            Hủy
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSave}
                                            disabled={isSaving || !content.trim()}
                                            className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            <Save className="w-3.5 h-3.5 mr-1.5" />
                                            {isSaving ? "Đang lưu..." : "Lưu nhật ký"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                diary && (
                                    <div className="mt-2 ml-5 p-3 rounded-lg bg-muted/30 border border-border/40">
                                        <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                            {diary.content}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

// Add these styles to your globals.css if needed
// .custom-scrollbar::-webkit-scrollbar { width: 4px; }
// .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
// .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

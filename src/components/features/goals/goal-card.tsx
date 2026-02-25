"use client";

import { useState } from "react";
import { updateGoalProgress, deleteGoal } from "@/lib/actions/goal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    MoreVertical,
    Trash2,
    Plus,
    History,
    CheckCircle2,
    AlertCircle,
    Check
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { confirmGoal } from "@/lib/actions/goal";

interface GoalCardProps {
    goal: any;
    userRole: string;
}

export function GoalCard({ goal, userRole }: GoalCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [newValue, setNewValue] = useState(goal.currentValue);
    const [note, setNote] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            await updateGoalProgress(goal.id, newValue, note);
            setIsUpdating(false);
            setNote("");
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await confirmGoal(goal.id);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Bạn có chắc chắn muốn xóa mục tiêu này?")) {
            await deleteGoal(goal.id);
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case "high": return "text-destructive bg-destructive/5";
            case "medium": return "text-amber-500 bg-amber-500/5";
            default: return "text-primary bg-primary/5";
        }
    };

    return (
        <Card className="group overflow-hidden rounded-lg border border-border/60 bg-background shadow-none transition-all">
            <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${getPriorityColor(goal.priority)}`}>
                                {goal.priority}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                {goal.category}
                            </span>
                            {goal.mentorConfirmed && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-green-500/10 text-green-600 border border-green-200">
                                    Đã xác nhận
                                </span>
                            )}
                        </div>
                        <h4 className="text-base font-semibold text-foreground leading-tight">{goal.title}</h4>
                    </div>
                    {(userRole === "admin" || goal.creatorId === goal.creatorId) && (
                        <div className="flex items-center gap-1">
                            {userRole === "mentor" && !goal.mentorConfirmed && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleConfirm}
                                    isLoading={isLoading}
                                    className="h-8 rounded-md border-primary/20 text-primary hover:bg-primary/5 mr-2 text-[11px] font-semibold"
                                >
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                    Xác nhận
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
                                <History className="w-4 h-4" />
                            </Button>
                            {/* Deletion restriction for confirmed goals */}
                            {!(userRole === "mentee" && goal.mentorConfirmed) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDelete}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/5"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground">Tiến độ</span>
                        <span className="text-foreground">{goal.currentValue}%</span>
                    </div>
                    <Progress value={goal.currentValue} size="sm" color={goal.currentValue === 100 ? "success" : "default"} />
                </div>

                {goal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{goal.description}</p>
                )}

                {goal.dueDate && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Hạn chót: {formatDate(goal.dueDate)}</span>
                    </div>
                )}

                {!isUpdating ? (
                    <Button
                        variant="outline"
                        className="w-full h-10 rounded-lg font-semibold text-[13px] border-border/60 hover:bg-muted"
                        onClick={() => setIsUpdating(true)}
                        disabled={goal.status === "completed"}
                    >
                        {goal.status === "completed" ? "Đã hoàn thành" : "Cập nhật tiến độ"}
                    </Button>
                ) : (
                    <div className="bg-muted/10 p-4 rounded-lg space-y-3 border border-border/40 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Tiến độ mới (%)"
                                type="number"
                                value={newValue}
                                onChange={(e) => setNewValue(Number(e.target.value))}
                                className="h-9 text-xs rounded-md"
                            />
                            <div className="flex items-end pb-1">
                                <div className="flex items-center gap-2 w-full">
                                    <Button variant="ghost" size="sm" className="flex-1 h-9 rounded-md text-[11px]" onClick={() => setIsUpdating(false)}>Hủy</Button>
                                    <Button size="sm" className="flex-1 h-9 rounded-md text-[11px]" onClick={handleUpdate} isLoading={isLoading}>Lưu</Button>
                                </div>
                            </div>
                        </div>
                        <textarea
                            className="w-full p-2.5 text-xs border border-border/60 rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-all"
                            placeholder="Ghi chú tiến độ (tùy chọn)..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                        />
                    </div>
                )}

                {showHistory && goal.progressNotes.length > 0 && (
                    <div className="border-t border-border pt-4 mt-2 space-y-3 animate-in fade-in">
                        <h5 className="text-[10px] font-medium text-muted-foreground">Lịch sử cập nhật</h5>
                        {goal.progressNotes.map((note: any) => (
                            <div key={note.id} className="flex gap-3">
                                <div className="w-1 h-auto bg-border rounded-full shrink-0" />
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-semibold text-foreground">{note.value}%</span>
                                        <span className="text-[10px] text-muted-foreground">{formatDate(note.createdAt, "dd/MM HH:mm")}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-tight">{note.note}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}

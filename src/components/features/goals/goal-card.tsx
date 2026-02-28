/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { updateGoalProgress, deleteGoal } from "@/lib/actions/goal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {
    Trash2,
    History,
    CheckCircle2,
    AlertCircle
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
        <Card className="group overflow-hidden rounded-xl border border-border/60 bg-background hover:shadow-md transition-all">
            <div className="p-5 flex flex-col lg:flex-row gap-6">
                {/* Left Section: Details */}
                <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${getPriorityColor(goal.priority)}`}>
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
                        <h4 className="text-lg font-bold text-foreground leading-tight">{goal.title}</h4>
                    </div>

                    {goal.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/40">
                            {goal.description}
                        </p>
                    )}

                    {goal.dueDate && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 w-fit px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                            <AlertCircle className="w-4 h-4" />
                            <span>Hạn chót: {formatDate(goal.dueDate)}</span>
                        </div>
                    )}
                </div>

                {/* Right Section: Progress & Actions */}
                <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border pt-5 lg:pt-0 lg:pl-6 shrink-0 flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-muted-foreground">Tiến độ</span>
                                <span className="text-foreground text-xl">{goal.currentValue}%</span>
                            </div>
                            <Progress value={goal.currentValue} className="h-2.5" color={goal.currentValue === 100 ? "success" : "default"} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                {(userRole === "admin" || goal.creatorId === goal.creatorId) && (
                                    <>
                                        <Button
                                            variant={showHistory ? "secondary" : "ghost"}
                                            size="sm"
                                            className="h-8 px-2 text-muted-foreground"
                                            onClick={() => setShowHistory(!showHistory)}
                                        >
                                            <History className="w-4 h-4 mr-1.5" />
                                            Lịch sử
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {userRole === "mentor" && !goal.mentorConfirmed && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleConfirm}
                                        isLoading={isLoading}
                                        className="h-8 px-2 text-[11px] font-semibold text-primary hover:bg-primary/5"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        Xác nhận
                                    </Button>
                                )}

                                {!(userRole === "mentee" && goal.mentorConfirmed) && (userRole === "admin" || goal.creatorId === goal.creatorId) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDelete}
                                        className="h-8 w-8 px-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        {!isUpdating ? (
                            <Button
                                variant={goal.status === "completed" ? "secondary" : "default"}
                                className="w-full h-11 rounded-xl font-semibold text-[13px] hover:shadow-md transition-all shadow-sm"
                                onClick={() => setIsUpdating(true)}
                                disabled={goal.status === "completed"}
                            >
                                {goal.status === "completed" ? "Đã hoàn thành" : "Cập nhật tiến độ"}
                            </Button>
                        ) : (
                            <div className="bg-muted/30 p-4 rounded-xl space-y-3 border border-border/80 animate-in fade-in zoom-in-95">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={newValue}
                                        onChange={(e) => setNewValue(Number(e.target.value))}
                                        className="h-9 text-sm font-semibold text-center w-full"
                                        placeholder="Nhập tiến độ mới"
                                    />
                                    <span className="text-sm font-bold">%</span>
                                </div>
                                <textarea
                                    className="w-full p-2.5 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring text-foreground resize-none"
                                    placeholder="Ghi chú cập nhật..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={2}
                                />
                                <div className="flex items-center gap-2 w-full pt-1.5">
                                    <Button variant="outline" size="sm" className="flex-1 h-9 rounded-lg font-medium" onClick={() => setIsUpdating(false)}>Hủy</Button>
                                    <Button size="sm" className="flex-1 h-9 rounded-lg font-medium shadow-sm" onClick={handleUpdate} isLoading={isLoading}>Lưu</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* History List Expansion */}
            {showHistory && goal.progressNotes.length > 0 && (
                <div className="border-t border-border bg-muted/10 p-5 lg:px-6 animate-in slide-in-from-top-2">
                    <h5 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                        <History className="w-4 h-4" /> Lịch sử cập nhật tiến độ
                    </h5>
                    <div className="space-y-3">
                        {goal.progressNotes.map((note: any) => (
                            <div key={note.id} className="flex gap-4 items-start">
                                <div className="w-1.5 h-full rounded-full bg-primary/20 shrink-0 self-stretch min-h-[30px]" />
                                <div className="space-y-1.5 flex-1 bg-background p-3.5 rounded-lg border border-border/60 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-primary">{note.value}%</span>
                                        <span className="text-xs text-muted-foreground font-medium">{formatDate(note.createdAt, "dd/MM/yyyy HH:mm")}</span>
                                    </div>
                                    {note.note && <p className="text-sm text-foreground leading-relaxed italic">&quot;{note.note}&quot;</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}

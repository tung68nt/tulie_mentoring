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
    AlertCircle
} from "lucide-react";
import { formatDate } from "@/lib/utils";

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

    const handleDelete = async () => {
        if (confirm("Bạn có chắc chắn muốn xóa mục tiêu này?")) {
            await deleteGoal(goal.id);
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case "high": return "text-red-600 bg-red-50";
            case "medium": return "text-amber-600 bg-amber-50";
            default: return "text-blue-600 bg-blue-50";
        }
    };

    return (
        <Card className="group overflow-hidden">
            <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getPriorityColor(goal.priority)}`}>
                                {goal.priority}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                {goal.category}
                            </span>
                        </div>
                        <h4 className="text-base font-bold text-gray-900 leading-tight">{goal.title}</h4>
                    </div>
                    {(userRole === "admin" || goal.creatorId === goal.creatorId) && (
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
                                <History className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-400">Tiến độ</span>
                        <span className="text-gray-900">{goal.currentValue}%</span>
                    </div>
                    <Progress value={goal.currentValue} size="sm" color={goal.currentValue === 100 ? "success" : "default"} />
                </div>

                {goal.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{goal.description}</p>
                )}

                {goal.dueDate && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Hạn chót: {formatDate(goal.dueDate)}</span>
                    </div>
                )}

                {!isUpdating ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setIsUpdating(true)}
                        disabled={goal.status === "completed"}
                    >
                        {goal.status === "completed" ? "Đã hoàn thành" : "Cập nhật tiến độ"}
                    </Button>
                ) : (
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Tiến độ mới (%)"
                                type="number"
                                value={newValue}
                                onChange={(e) => setNewValue(Number(e.target.value))}
                            />
                            <div className="flex items-end pb-1.5">
                                <div className="flex items-center gap-2 w-full">
                                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => setIsUpdating(false)}>Hủy</Button>
                                    <Button size="sm" className="flex-1" onClick={handleUpdate} isLoading={isLoading}>Lưu</Button>
                                </div>
                            </div>
                        </div>
                        <textarea
                            className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                            placeholder="Ghi chú tiến độ (tùy chọn)..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                        />
                    </div>
                )}

                {showHistory && goal.progressNotes.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 mt-2 space-y-3 animate-in fade-in">
                        <h5 className="text-[10px] font-bold text-gray-400">Lịch sử cập nhật</h5>
                        {goal.progressNotes.map((note: any) => (
                            <div key={note.id} className="flex gap-3">
                                <div className="w-1 h-auto bg-gray-200 rounded-full shrink-0" />
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-900">{note.value}%</span>
                                        <span className="text-[10px] text-gray-400">{formatDate(note.createdAt, "dd/MM HH:mm")}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-tight">{note.note}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}

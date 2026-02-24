"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { updateTaskStatus, deleteTask } from "@/lib/actions/task";
import { formatDate } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    column: string;
}

interface KanbanBoardProps {
    initialTasks: Task[];
}

const COLUMNS = [
    { id: "todo", title: "Cần làm", color: "bg-muted/50" },
    { id: "doing", title: "Đang làm", color: "bg-primary/5" },
    { id: "review", title: "Đang xem xét", color: "bg-warning/5" },
    { id: "done", title: "Hoàn thành", color: "bg-success/5" },
];

const PRIORITY_COLORS: Record<string, string> = {
    high: "text-destructive bg-destructive/10",
    medium: "text-warning bg-warning/10",
    low: "text-success bg-success/10",
};

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
    const [tasks, setTasks] = useState(initialTasks);

    const moveTask = async (taskId: string, newStatus: string) => {
        try {
            const updatedTask = await updateTaskStatus(taskId, newStatus);
            setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
        } catch (error) {
            console.error("Failed to move task:", error);
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
        try {
            await deleteTask(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start overflow-x-auto pb-4">
            {COLUMNS.map(column => (
                <div key={column.id} className="flex flex-col gap-4 min-w-[280px]">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{column.title}</h3>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">
                                {tasks.filter(t => (t.column || t.status) === column.id).length}
                            </span>
                        </div>
                    </div>

                    <div className={cn("flex flex-col gap-3 p-3 rounded-2xl border border-border/50 min-h-[500px]", column.color)}>
                        {tasks
                            .filter(task => (task.column || task.status) === column.id)
                            .map(task => (
                                <Card key={task.id} className="p-4 rounded-xl border-border/40 shadow shadow-black/5 hover:shadow-md transition-all group animate-in fade-in slide-in-from-top-2">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <Badge className={cn("text-[8px] font-bold px-1.5 h-4", PRIORITY_COLORS[task.priority])}>
                                                {task.priority.toUpperCase()}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    {COLUMNS.filter(c => c.id !== column.id).map(c => (
                                                        <DropdownMenuItem key={c.id} onClick={() => moveTask(task.id, c.id)} className="text-[12px]">
                                                            Chuyển sang {c.title}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-[12px] text-destructive">
                                                        Xóa công việc
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <p className="text-[13px] font-medium text-foreground leading-snug">{task.title}</p>

                                        {task.dueDate && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(task.dueDate)}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex -space-x-1.5">
                                                <div className="w-5 h-5 rounded-full border border-background bg-secondary flex items-center justify-center">
                                                    <span className="text-[8px] font-bold">ME</span>
                                                </div>
                                            </div>
                                            {task.status === "done" ? (
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-muted-foreground/30" />
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-muted-foreground h-9 font-medium text-[12px] rounded-xl border border-dashed border-border/20 hover:bg-muted/50 hover:border-border/50"
                        >
                            <Plus className="w-3.5 h-3.5 mr-2" />
                            Thêm công việc
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}

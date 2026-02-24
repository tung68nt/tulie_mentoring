"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Calendar, CheckCircle2, Clock } from "lucide-react";
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

                    <div className={cn("flex flex-col gap-4 p-4 rounded-[2rem] border border-border/40 min-h-[600px] shadow-inner", column.color)}>
                        {tasks
                            .filter(task => (task.column || task.status) === column.id)
                            .map(task => (
                                <Card key={task.id} className="p-5 rounded-3xl border-border/40 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group animate-in fade-in slide-in-from-top-2 hover:-translate-y-1">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <Badge className={cn("text-[8px] font-bold px-2 h-4.5 rounded-full ring-1 ring-inset ring-foreground/5 shadow-none", PRIORITY_COLORS[task.priority])}>
                                                {task.priority.toUpperCase()}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-muted/50">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl border-border/40 shadow-2xl p-1.5 min-w-[160px]">
                                                    {COLUMNS.filter(c => c.id !== column.id).map(c => (
                                                        <DropdownMenuItem key={c.id} onClick={() => moveTask(task.id, c.id)} className="text-[12px] rounded-xl px-3 py-2">
                                                            Chuyển sang {c.title}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-[12px] rounded-xl px-3 py-2 text-destructive hover:bg-destructive/5">
                                                        Xóa công việc
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <p className="text-[13.5px] font-semibold text-foreground leading-snug tracking-tight no-uppercase">{task.title}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center gap-3">
                                                {task.dueDate && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider">
                                                        <Calendar className="w-3.5 h-3.5 opacity-40" />
                                                        {formatDate(task.dueDate)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full border border-border bg-muted/50 flex items-center justify-center shadow-sm">
                                                    <span className="text-[8px] font-bold text-muted-foreground">ME</span>
                                                </div>
                                                {task.status === "done" ? (
                                                    <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
                                                ) : (
                                                    <Clock className="w-4.5 h-4.5 text-muted-foreground/20" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-muted-foreground/40 h-11 font-bold text-[11px] uppercase tracking-widest rounded-2xl border border-dashed border-border/30 hover:bg-background/80 hover:border-border/60 transition-all px-4"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm việc mới
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}

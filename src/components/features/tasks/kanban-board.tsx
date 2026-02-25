"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MoreHorizontal, Calendar, CheckCircle2, Clock, X } from "lucide-react";
import { updateTaskStatus, deleteTask, createTask } from "@/lib/actions/task";
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
    { id: "todo", title: "Cần làm", color: "bg-muted/30" },
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
    const [addingTo, setAddingTo] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (addingTo && inputRef.current) {
            inputRef.current.focus();
        }
    }, [addingTo]);

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

    const handleQuickAdd = async (columnId: string) => {
        if (!newTitle.trim()) return;
        setIsCreating(true);
        try {
            const task = await createTask({ title: newTitle.trim() });
            if (columnId !== "todo") {
                const movedTask = await updateTaskStatus(task.id, columnId);
                setTasks(prev => [...prev, movedTask]);
            } else {
                setTasks(prev => [...prev, task]);
            }
            setNewTitle("");
            setAddingTo(null);
        } catch (error) {
            console.error("Failed to create task:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
            {COLUMNS.map(column => (
                <div key={column.id} className="flex flex-col gap-3 min-w-[280px] w-[280px] shrink-0 lg:flex-1 lg:w-auto lg:min-w-0">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                            <span className="text-[10px] font-medium px-2 py-0.5 bg-muted rounded-full text-muted-foreground border border-border">
                                {tasks.filter(t => (t.column || t.status) === column.id).length}
                            </span>
                        </div>
                    </div>

                    <div className={cn("flex flex-col gap-3 p-3 rounded-xl border border-border/60 min-h-[400px]", column.color)}>
                        {tasks
                            .filter(task => (task.column || task.status) === column.id)
                            .map(task => (
                                <Card key={task.id} className="p-4 rounded-lg border-border/40 hover:border-border transition-all duration-200 group bg-background shadow-none">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <Badge variant="outline" className={cn("text-[9px] font-semibold px-2 h-4.5 rounded-md", PRIORITY_COLORS[task.priority])}>
                                                {task.priority}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all rounded-md">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-lg border-border/40 shadow-none p-1 min-w-[160px]">
                                                    {COLUMNS.filter(c => c.id !== column.id).map(c => (
                                                        <DropdownMenuItem key={c.id} onClick={() => moveTask(task.id, c.id)} className="text-xs rounded-md">
                                                            Chuyển sang {c.title}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-xs rounded-md text-destructive">
                                                        Xóa công việc
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <p className="text-[13px] font-medium text-foreground leading-snug">{task.title}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center gap-3">
                                                {task.dueDate && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                                                        {formatDate(task.dueDate)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {task.status === "done" ? (
                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                ) : (
                                                    <Clock className="w-4 h-4 text-muted-foreground/30" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                        {/* Quick add form */}
                        {addingTo === column.id ? (
                            <div className="space-y-2">
                                <Input
                                    ref={inputRef}
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề..."
                                    className="h-9 text-sm rounded-lg"
                                    disabled={isCreating}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleQuickAdd(column.id);
                                        if (e.key === "Escape") { setAddingTo(null); setNewTitle(""); }
                                    }}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="h-8 rounded-lg text-xs flex-1"
                                        onClick={() => handleQuickAdd(column.id)}
                                        disabled={isCreating || !newTitle.trim()}
                                    >
                                        {isCreating ? "Đang tạo..." : "Thêm"}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-lg p-0"
                                        onClick={() => { setAddingTo(null); setNewTitle(""); }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-muted-foreground/60 h-9 text-[11px] rounded-lg border border-dashed border-border/50 hover:bg-background/80 hover:border-border transition-all px-3"
                                onClick={() => { setAddingTo(column.id); setNewTitle(""); }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm việc mới
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

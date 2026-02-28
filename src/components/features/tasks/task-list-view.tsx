"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar, MoreHorizontal, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { updateTaskStatus, deleteTask } from "@/lib/actions/task";
import { TaskDetailModal } from "./task-detail-modal";
import { Task } from "./kanban-board";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface TaskListViewProps {
    initialTasks: Task[];
}

const PRIORITY_COLORS: Record<string, string> = {
    high: "text-destructive bg-destructive/10 ring-destructive/20",
    medium: "text-warning bg-warning/10 ring-warning/20",
    low: "text-success bg-success/10 ring-success/20",
};

const STATUS_LABELS: Record<string, string> = {
    todo: "Cần làm",
    doing: "Đang làm",
    review: "Xem xét",
    done: "Hoàn thành",
};

export function TaskListView({ initialTasks }: TaskListViewProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks as Task[]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        setTasks(initialTasks as Task[]);
    }, [initialTasks]);

    async function handleStatusChange(taskId: string, newStatus: string) {
        try {
            const updated = await updateTaskStatus(taskId, newStatus);
            setTasks(tasks.map(t => t.id === taskId ? updated : t));
        } catch (error) {
            console.error(error);
        }
    }

    async function handleDelete(taskId: string) {
        if (!confirm("Xác nhận xóa công việc?")) return;
        try {
            await deleteTask(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden transition-all bg-background">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent border-border/60">
                        <TableHead className="w-[48px]"></TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground py-4">Công việc</TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground">Tiến độ</TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground">Thực tế</TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground">Trạng thái</TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground text-center">Độ ưu tiên</TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground">Hạn chót</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="group hover:bg-muted/30 border-border/60 transition-colors cursor-pointer"
                        >
                            <TableCell className="py-3">
                                {task.status === "done" ? (
                                    <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
                                ) : (
                                    <Circle className="w-4.5 h-4.5 text-muted-foreground/40" />
                                )}
                            </TableCell>
                            <TableCell className="py-3">
                                <div className="space-y-1">
                                    <div className="font-semibold text-[13.5px] text-foreground">{task.title}</div>
                                    {task.startDate && (
                                        <div className="text-[10px] text-muted-foreground/60">Bắt đầu: {formatDate(task.startDate)}</div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1 w-24">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground/80">
                                        <span>{task.completedPercentage || 0}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${task.completedPercentage || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-0.5 min-w-[120px]">
                                    {task.actualStartDate ? (
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                            S: {formatDate(task.actualStartDate)}
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-muted-foreground/30">Chưa bắt đầu</div>
                                    )}
                                    {task.actualCompletedAt && (
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                            F: {formatDate(task.actualCompletedAt)}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="rounded-md px-2 py-0 h-5 text-[10px] font-medium bg-muted/20 border-border/60">
                                    {STATUS_LABELS[task.status]}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge className={cn("rounded-md px-2 py-0 h-5 text-[10px] font-medium border-transparent shadow-none", PRIORITY_COLORS[task.priority])}>
                                    {task.priority}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {task.dueDate ? (
                                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium opacity-80">
                                        <Calendar className="w-3 h-3 opacity-60" />
                                        {formatDate(task.dueDate)}
                                    </div>
                                ) : (
                                    <span className="text-[12px] text-muted-foreground opacity-30">—</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-lg border-border/60 shadow-none p-1 min-w-[140px]">
                                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                            <DropdownMenuItem key={val} onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, val); }} className="text-[12px] rounded-md px-2.5 py-1.5 focus:bg-accent cursor-pointer">
                                                {label}
                                            </DropdownMenuItem>
                                        ))}
                                        <div className="h-px bg-border/60 my-1 mx-1" />
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} className="text-[12px] rounded-md px-2.5 py-1.5 text-destructive focus:bg-destructive/10 cursor-pointer">
                                            Xóa công việc
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {tasks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="h-32 text-center">
                                <p className="text-sm text-muted-foreground opacity-60 font-medium">Không có công việc nào.</p>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <TaskDetailModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={(updatedTask) => setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))}
            />
        </div>
    );
}

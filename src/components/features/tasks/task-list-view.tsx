"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar, MoreHorizontal, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { updateTaskStatus, deleteTask } from "@/lib/actions/task";
import { useState } from "react";

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
}

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
    const [tasks, setTasks] = useState(initialTasks);

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
                        <TableHead className="text-[11px] font-semibold text-muted-foreground">Trạng thái</TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground">Độ ưu tiên</TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground">Hạn chót</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow key={task.id} className="group hover:bg-muted/30 border-border/60 transition-colors">
                            <TableCell className="py-3">
                                {task.status === "done" ? (
                                    <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
                                ) : (
                                    <Circle className="w-4.5 h-4.5 text-muted-foreground/40" />
                                )}
                            </TableCell>
                            <TableCell className="font-medium text-[13.5px] text-foreground py-3">
                                {task.title}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="rounded-md px-2 py-0 h-5 text-[10px] font-medium bg-muted/20 border-border/60">
                                    {STATUS_LABELS[task.status]}
                                </Badge>
                            </TableCell>
                            <TableCell>
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
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-lg border-border/60 shadow-none p-1 min-w-[140px]">
                                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                            <DropdownMenuItem key={val} onClick={() => handleStatusChange(task.id, val)} className="text-[12px] rounded-md px-2.5 py-1.5 focus:bg-accent cursor-pointer">
                                                {label}
                                            </DropdownMenuItem>
                                        ))}
                                        <div className="h-px bg-border/60 my-1 mx-1" />
                                        <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-[12px] rounded-md px-2.5 py-1.5 text-destructive focus:bg-destructive/10 cursor-pointer">
                                            Xóa công việc
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {tasks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                                <p className="text-sm text-muted-foreground opacity-60 font-medium">Không có công việc nào.</p>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

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
        <div className="rounded-[2rem] border border-border/40 bg-card/50 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/40">
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-widest py-5">Công việc</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-widest">Trạng thái</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-widest">Độ ưu tiên</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-widest">Hạn chót</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow key={task.id} className="group hover:bg-muted/20 border-border/40 transition-colors">
                            <TableCell className="py-4">
                                {task.status === "done" ? (
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground/30" />
                                )}
                            </TableCell>
                            <TableCell className="font-semibold text-[14px] text-foreground py-4">
                                {task.title}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase bg-background">
                                    {STATUS_LABELS[task.status]}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge className={cn("rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset shadow-none", PRIORITY_COLORS[task.priority])}>
                                    {task.priority}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {task.dueDate ? (
                                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground/60 font-medium">
                                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                                        {formatDate(task.dueDate)}
                                    </div>
                                ) : (
                                    <span className="text-[12px] text-muted-foreground/30">—</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-2xl border-border/40 shadow-2xl p-1.5 overflow-hidden">
                                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                            <DropdownMenuItem key={val} onClick={() => handleStatusChange(task.id, val)} className="text-[12px] rounded-xl px-3 py-2">
                                                {label}
                                            </DropdownMenuItem>
                                        ))}
                                        <div className="h-px bg-border/40 my-1 mx-1" />
                                        <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-[12px] rounded-xl px-3 py-2 text-destructive hover:bg-destructive/5">
                                            Xóa công việc
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {tasks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-40 text-center">
                                <p className="text-sm text-muted-foreground/50 font-medium italic">Không có công việc nào.</p>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

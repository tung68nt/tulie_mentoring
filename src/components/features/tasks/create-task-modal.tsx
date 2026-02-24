"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { todoSchema, type TaskInput } from "@/lib/validators";
import { createTask } from "@/lib/actions/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

export function CreateTaskModal({ onTaskCreated }: { onTaskCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskInput>({
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        resolver: zodResolver(todoSchema) as any,
        defaultValues: {
            priority: "medium",
            status: "todo",
            column: "todo",
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } as any
    });

    const onSubmit = async (data: TaskInput) => {
        setIsSubmitting(true);
        try {
            await createTask({
                title: data.title,
                priority: data.priority,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                reflectionId: data.reflectionId || undefined,
            });
            reset();
            setOpen(false);
            if (onTaskCreated) onTaskCreated();
        } catch (error) {
            console.error("Failed to create task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-2xl shadow-xl shadow-primary/10 h-12 px-8 font-bold text-[13px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95">
                    <Plus className="w-5 h-5 mr-2" />
                    Giao việc mới
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden ring-1 ring-border/5">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-2xl font-bold no-uppercase tracking-tight">Thêm công việc mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="title" className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em] px-1">Tiêu đề công việc</Label>
                            <Input
                                id="title"
                                placeholder="Cần hoàn thành việc gì..."
                                {...register("title")}
                                className="h-14 rounded-2xl border-border/40 bg-muted/20 px-5 font-medium placeholder:text-muted-foreground/30 focus:border-primary/20 transition-all"
                            />
                            {errors.title && <p className="text-[10px] font-bold text-destructive/70 px-1">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em] px-1">Độ ưu tiên</Label>
                                <Select
                                    defaultValue="medium"
                                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                    onValueChange={(val) => setValue("priority", val as any)}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl border-border/40 bg-muted/20 px-5">
                                        <SelectValue placeholder="Chọn..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                                        <SelectItem value="low" className="rounded-xl">Thấp</SelectItem>
                                        <SelectItem value="medium" className="rounded-xl">Trung bình</SelectItem>
                                        <SelectItem value="high" className="rounded-xl">Cao</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="dueDate" className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em] px-1">Hạn chót</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    {...register("dueDate")}
                                    className="h-12 rounded-2xl border-border/40 bg-muted/20 px-5 font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 rounded-2xl font-bold text-[14px] shadow-xl shadow-primary/10 transition-all hover:opacity-90 active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác nhận tạo việc"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

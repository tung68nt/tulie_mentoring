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
                startDate: data.startDate ? new Date(data.startDate) : undefined,
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
                <Button className="rounded-xl h-10 px-5 font-semibold transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm việc mới
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-semibold tracking-tight">Thêm công việc mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground/60 px-0.5">Tiêu đề công việc</Label>
                            <Input
                                id="title"
                                placeholder="Cần hoàn thành việc gì..."
                                {...register("title")}
                                className="h-10 rounded-lg border-border/60 bg-muted/10 px-3 font-medium placeholder:text-muted-foreground/40 focus:border-primary/30 transition-all"
                            />
                            {errors.title && <p className="text-[11px] font-medium text-destructive/80 px-0.5 mt-1">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-xs font-semibold text-muted-foreground/60 px-0.5">Ngày bắt đầu</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    {...register("startDate")}
                                    className="h-10 rounded-lg border-border/60 bg-muted/10 px-3 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate" className="text-xs font-semibold text-muted-foreground/60 px-0.5">Hạn chót</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    {...register("dueDate")}
                                    className="h-10 rounded-lg border-border/60 bg-muted/10 px-3 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground/60 px-0.5">Độ ưu tiên</Label>
                            <Select
                                defaultValue="medium"
                                onValueChange={(val) => setValue("priority", val as any)}
                            >
                                <SelectTrigger className="h-10 rounded-lg border-border/60 bg-muted/10 px-4 font-medium">
                                    <SelectValue placeholder="Chọn..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-border/60">
                                    <SelectItem value="low" className="rounded-md">Thấp</SelectItem>
                                    <SelectItem value="medium" className="rounded-md">Trung bình</SelectItem>
                                    <SelectItem value="high" className="rounded-md">Cao</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 rounded-xl font-semibold transition-all hover:opacity-90"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                "Tạo công việc"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

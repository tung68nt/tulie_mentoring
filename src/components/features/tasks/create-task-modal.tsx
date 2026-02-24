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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";

export function CreateTaskModal({ onTaskCreated }: { onTaskCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TaskInput>({
        resolver: zodResolver(todoSchema) as any,
        defaultValues: {
            priority: "medium",
            status: "todo",
            column: "todo",
        } as any
    });

    const priority = watch("priority");

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
                <Button className="rounded-xl shadow-lg shadow-primary/10 h-11 px-6 font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="no-uppercase">Giao việc mới</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="no-uppercase">Thêm công việc mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Tiêu đề công việc</Label>
                            <Input
                                id="title"
                                placeholder="Nhập tên công việc..."
                                {...register("title")}
                                className="rounded-xl"
                            />
                            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Độ ưu tiên</Label>
                                <Select
                                    defaultValue="medium"
                                    onValueChange={(val) => setValue("priority", val as any)}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Chọn độ ưu tiên" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="low">Thấp</SelectItem>
                                        <SelectItem value="medium">Trung bình</SelectItem>
                                        <SelectItem value="high">Cao</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Hạn chót</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    {...register("dueDate")}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang xử lý...
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

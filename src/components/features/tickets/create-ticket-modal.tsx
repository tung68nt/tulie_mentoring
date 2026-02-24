"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createTicket } from "@/lib/actions/ticket";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ticketSchema = z.object({
    title: z.string().min(5, "Tiêu đề phải ít nhất 5 ký tự"),
    description: z.string().min(10, "Mô tả phải ít nhất 10 ký tự"),
    priority: z.enum(["low", "medium", "high"]),
});

export function CreateTicketModal() {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof ticketSchema>>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "medium",
        },
    });

    async function onSubmit(values: z.infer<typeof ticketSchema>) {
        setIsSubmitting(true);
        try {
            await createTicket(values);
            toast.success("Đã gửi yêu cầu hỗ trợ thành công");
            setOpen(false);
            form.reset();
        } catch (error) {
            toast.error("Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl no-uppercase h-11 px-6 font-medium gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Tạo yêu cầu mới
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold no-uppercase">Yêu cầu hỗ trợ mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground/60 no-uppercase">Tiêu đề</Label>
                            <Input
                                placeholder="Ví dụ: Lỗi không thể check-in"
                                {...form.register("title")}
                                className="rounded-xl border-border/50 focus:border-primary/30 h-11"
                            />
                            {form.formState.errors.title && (
                                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground/60 no-uppercase">Mức độ ưu tiên</Label>
                            <Select
                                onValueChange={(val) => form.setValue("priority", val as any)}
                                defaultValue={form.getValues("priority")}
                            >
                                <SelectTrigger className="rounded-xl border-border/50 h-11">
                                    <SelectValue placeholder="Chọn mức độ ưu tiên" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50">
                                    <SelectItem value="low">Thấp</SelectItem>
                                    <SelectItem value="medium">Trung bình</SelectItem>
                                    <SelectItem value="high">Cao</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.priority && (
                                <p className="text-xs text-destructive">{form.formState.errors.priority.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground/60 no-uppercase">Chi tiết yêu cầu</Label>
                            <Textarea
                                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                                {...form.register("description")}
                                className="rounded-xl border-border/50 focus:border-primary/30 min-h-[120px] py-3"
                            />
                            {form.formState.errors.description && (
                                <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="rounded-xl no-uppercase"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl no-uppercase min-w-[120px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                "Gửi yêu cầu"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

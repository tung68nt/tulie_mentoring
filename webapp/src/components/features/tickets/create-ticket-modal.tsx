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
    DialogDescription,
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
import { PlusCircle, Loader2, LifeBuoy } from "lucide-react";
import { toast } from "sonner";

const ticketSchema = z.object({
    title: z.string().min(5, "Tiêu đề phải ít nhất 5 ký tự"),
    description: z.string().min(10, "Mô tả phải ít nhất 10 ký tự"),
    priority: z.enum(["low", "medium", "high"]),
    category: z.enum(["system", "mentor", "admin_help"]),
});

const categoryLabels: Record<string, string> = {
    system: "Hỗ trợ hệ thống (Kỹ thuật/Lỗi)",
    mentor: "Gửi Mentor (Hỗ trợ học tập)",
    admin_help: "Gửi Admin (Quản trị chương trình)",
};

export function CreateTicketModal({ userRole }: { userRole?: string }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof ticketSchema>>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "medium",
            category: userRole === "mentee" ? "system" : "admin_help",
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
                <Button className="rounded-xl h-10 px-5 font-semibold gap-2 shadow-xs">
                    <PlusCircle className="w-4 h-4" />
                    Tạo yêu cầu mới
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] rounded-2xl border border-border/70 bg-card p-6 shadow-xl">
                <DialogHeader className="space-y-1.5 pb-3 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <LifeBuoy className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                                Yêu cầu hỗ trợ mới
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Gửi thông tin sự cố kỹ thuật hoặc câu hỏi cần giải đáp tới ban phụ trách.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-4">
                        {/* Tiêu đề */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground/80">
                                Tiêu đề <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                placeholder="Ví dụ: Lỗi không thể check-in buổi họp"
                                {...form.register("title")}
                                className="rounded-xl border border-border/60 bg-muted/20 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/80 h-10 text-sm px-3.5 transition-all shadow-none"
                            />
                            {form.formState.errors.title && (
                                <p className="text-[11px] font-medium text-destructive mt-1">
                                    {form.formState.errors.title.message}
                                </p>
                            )}
                        </div>

                        {/* 2 Select Boxes - Grid with gap-4 and min-w-0 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 min-w-0">
                                <Label className="text-xs font-semibold text-foreground/80">
                                    Loại hỗ trợ <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    onValueChange={(val) => form.setValue("category", val as any)}
                                    value={form.watch("category")}
                                >
                                    <SelectTrigger className="w-full min-w-0 rounded-xl border border-border/60 bg-muted/20 h-10 px-3.5 text-sm font-medium shadow-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80">
                                        <SelectValue placeholder="Chọn loại hỗ trợ" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border border-border/60 shadow-lg p-1 bg-popover">
                                        {userRole === "mentee" ? (
                                            <>
                                                <SelectItem value="system" className="rounded-lg text-xs py-2 cursor-pointer">
                                                    {categoryLabels.system}
                                                </SelectItem>
                                                <SelectItem value="mentor" className="rounded-lg text-xs py-2 cursor-pointer">
                                                    {categoryLabels.mentor}
                                                </SelectItem>
                                            </>
                                        ) : (
                                            <SelectItem value="admin_help" className="rounded-lg text-xs py-2 cursor-pointer">
                                                {categoryLabels.admin_help}
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5 min-w-0">
                                <Label className="text-xs font-semibold text-foreground/80">
                                    Mức độ ưu tiên <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    onValueChange={(val) => form.setValue("priority", val as any)}
                                    defaultValue={form.getValues("priority")}
                                >
                                    <SelectTrigger className="w-full min-w-0 rounded-xl border border-border/60 bg-muted/20 h-10 px-3.5 text-sm font-medium shadow-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80">
                                        <SelectValue placeholder="Chọn mức độ ưu tiên" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border border-border/60 shadow-lg p-1 bg-popover">
                                        <SelectItem value="low" className="rounded-lg text-xs py-2 cursor-pointer">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                Thấp
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="medium" className="rounded-lg text-xs py-2 cursor-pointer">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                                Trung bình
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="high" className="rounded-lg text-xs py-2 cursor-pointer">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                                Cao (Khẩn cấp)
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Chi tiết yêu cầu */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground/80">
                                Chi tiết yêu cầu <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                                {...form.register("description")}
                                className="rounded-xl border border-border/60 bg-muted/20 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/80 min-h-[130px] p-3.5 text-sm transition-all shadow-none resize-none"
                            />
                            {form.formState.errors.description && (
                                <p className="text-[11px] font-medium text-destructive mt-1">
                                    {form.formState.errors.description.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-border/40">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="rounded-xl border-border/60 hover:bg-muted/50 h-10 px-5 font-semibold text-sm"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl h-10 px-6 font-semibold shadow-xs gap-2 text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
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

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { programCycleSchema, type ProgramCycleInput } from "@/lib/validators";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createProgramCycle, updateProgramCycle } from "@/lib/actions/program";
import { Loader2 } from "lucide-react";

interface ProgramDialogProps {
    children: React.ReactNode;
    mode: "create" | "edit";
    program?: any;
}

export function ProgramDialog({ children, mode, program }: ProgramDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<any>({
        resolver: zodResolver(programCycleSchema),
        defaultValues: mode === "edit" ? {
            name: program.name,
            description: program.description || "",
            startDate: new Date(program.startDate || new Date()).toISOString().split('T')[0],
            endDate: new Date(program.endDate || new Date()).toISOString().split('T')[0],
            status: program.status as any,
        } : {
            status: "active",
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
        },
    });

    const statusValue = watch("status");

    const onSubmit = async (data: ProgramCycleInput) => {
        setLoading(true);
        try {
            if (mode === "create") {
                await createProgramCycle(data);
                toast.success("Đã tạo chương trình mới thành công");
            } else {
                await updateProgramCycle(program.id, data);
                toast.success("Đã cập nhật chương trình thành công");
            }
            setOpen(false);
            if (mode === "create") reset();
        } catch (error: any) {
            toast.error(error.message || "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Thêm chương trình mới" : "Chỉnh sửa chương trình"}
                    </DialogTitle>
                    <DialogDescription>
                        Điền thông tin chi tiết cho đợt mentoring.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Tên chương trình</Label>
                        <Input
                            id="name"
                            placeholder="VD: IMP Spring 2026"
                            {...register("name")}
                            className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name.message as string}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            placeholder="Mô tả ngắn gọn về chương trình..."
                            {...register("description")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Ngày bắt đầu</Label>
                            <Input
                                id="startDate"
                                type="date"
                                {...register("startDate")}
                                className={errors.startDate ? "border-destructive" : ""}
                            />
                            {errors.startDate && (
                                <p className="text-xs text-destructive">{errors.startDate.message as string}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Ngày kết thúc</Label>
                            <Input
                                id="endDate"
                                type="date"
                                {...register("endDate")}
                                className={errors.endDate ? "border-destructive" : ""}
                            />
                            {errors.endDate && (
                                <p className="text-xs text-destructive">{errors.endDate.message as string}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Trạng thái</Label>
                        <Select
                            value={statusValue}
                            onValueChange={(val) => setValue("status", val as any)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Đang hoạt động</SelectItem>
                                <SelectItem value="inactive">Tạm ngưng</SelectItem>
                                <SelectItem value="archived">Lưu trữ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {mode === "create" ? "Tạo chương trình" : "Lưu thay đổi"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

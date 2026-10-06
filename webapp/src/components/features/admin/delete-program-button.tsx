"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { deleteProgramCycle } from "@/lib/actions/program";
import { toast } from "sonner";

interface DeleteProgramButtonProps {
    programId: string;
    programName: string;
}

export function DeleteProgramButton({ programId, programName }: DeleteProgramButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res: any = await deleteProgramCycle(programId);
            if (res.success) {
                toast.success(`Đã xóa chương trình ${programName}`);
                setOpen(false);
            } else {
                toast.error(res.error || "Không thể xóa chương trình");
            }
        } catch (error: any) {
            toast.error(error.message || "Không thể xóa chương trình");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <DialogTitle className="text-center font-bold no-uppercase">Xác nhận xóa chương trình</DialogTitle>
                    <DialogDescription className="text-center">
                        Bạn có chắc chắn muốn xóa chương trình <span className="font-bold text-foreground">"{programName}"</span>?
                        Hành động này không thể hoàn tác.
                        Chỉ có thể xóa chương trình khi chưa có bất kỳ Mentorship nào gán vào.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-8 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Xác nhận xóa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

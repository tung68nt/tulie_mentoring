"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteWikiPage } from "@/lib/actions/wiki";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteWikiButtonProps {
    id: string;
    title: string;
}

export function DeleteWikiButton({ id, title }: DeleteWikiButtonProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        setIsDeleting(true);
        try {
            await deleteWikiPage(id);
            toast.success("Đã xóa trang thành công");
            setOpen(false);
            router.push("/wiki");
        } catch (error) {
            toast.error("Không thể xóa trang. Vui lòng thử lại.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-xl no-uppercase text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                    <Trash2 className="w-4 h-4" />
                    Xóa trang
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold no-uppercase">Xác nhận xóa</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground pt-2">
                        Bạn có chắc chắn muốn xóa trang <span className="font-bold text-foreground">"{title}"</span>? Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="rounded-xl no-uppercase"
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="rounded-xl no-uppercase min-w-[100px]"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xóa...
                            </>
                        ) : (
                            "Xác nhận xóa"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

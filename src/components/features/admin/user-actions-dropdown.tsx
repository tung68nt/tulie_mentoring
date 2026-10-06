"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, KeyRound, Ban, CheckCircle, Trash2, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adminResetPassword, toggleUserActive, deleteUser } from "@/lib/actions/user";
import { startImpersonation } from "@/lib/actions/impersonation";

interface UserActionsDropdownProps {
    userId: string;
    userName: string;
    isActive: boolean;
}

export function UserActionsDropdown({ userId, userName, isActive }: UserActionsDropdownProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("123456");

    const handleImpersonate = async () => {
        try {
            await startImpersonation(userId);
            toast.success(`Đang đóng vai ${userName}`);
            router.push("/");
            router.refresh();
        } catch (e: any) {
            toast.error(e.message || "Không thể đóng vai");
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        setIsLoading(true);
        try {
            const result = await adminResetPassword(userId, newPassword);
            if (result.success) {
                toast.success(`Đã đổi mật khẩu cho ${userName}`);
                setResetPasswordOpen(false);
                setNewPassword("123456");
            } else {
                toast.error(result.error || "Lỗi khi đổi mật khẩu");
            }
        } catch {
            toast.error("Đã xảy ra lỗi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async () => {
        setIsLoading(true);
        try {
            const result = await toggleUserActive(userId);
            if (result.success) {
                toast.success(result.isActive ? `Đã bỏ chặn ${userName}` : `Đã chặn ${userName}`);
            } else {
                toast.error(result.error || "Lỗi");
            }
        } catch {
            toast.error("Đã xảy ra lỗi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteUser(userId);
            toast.success(`Đã xoá ${userName}`);
            setDeleteOpen(false);
        } catch {
            toast.error("Không thể xoá người dùng");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleImpersonate}>
                        <Eye className="w-4 h-4 mr-2 text-amber-500" />
                        <span className="text-amber-600">Đóng vai</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setResetPasswordOpen(true)}>
                        <KeyRound className="w-4 h-4 mr-2" />
                        Đổi mật khẩu
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleActive} disabled={isLoading}>
                        {isActive ? (
                            <>
                                <Ban className="w-4 h-4 mr-2 text-amber-500" />
                                <span className="text-amber-600">Chặn tài khoản</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                                <span className="text-emerald-600">Bỏ chặn</span>
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setDeleteOpen(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xoá tài khoản
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Reset Password Dialog */}
            <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Đổi mật khẩu</DialogTitle>
                        <DialogDescription>
                            Đặt mật khẩu mới cho <strong>{userName}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div>
                            <Label htmlFor="newPassword">Mật khẩu mới</Label>
                            <Input
                                id="newPassword"
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setResetPasswordOpen(false)} disabled={isLoading}>Hủy</Button>
                        <Button onClick={handleResetPassword} disabled={isLoading}>
                            {isLoading ? "Đang xử lý..." : "Xác nhận"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xoá</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xoá tài khoản <strong>{userName}</strong>? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={isLoading}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? "Đang xoá..." : "Xoá"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

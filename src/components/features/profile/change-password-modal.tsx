"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "@/lib/actions/user";

export function ChangePasswordModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSave = async () => {
        if (!currentPassword) {
            toast.error("Vui lòng nhập mật khẩu hiện tại");
            return;
        }
        if (!newPassword || newPassword.length < 8) {
            toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        setIsLoading(true);
        try {
            const res = await changePassword(currentPassword, newPassword);
            if (res.success) {
                toast.success("Đổi mật khẩu thành công!");
                setIsOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(res.error || "Không thể đổi mật khẩu");
            }
        } catch (error: any) {
            toast.error("Đã xảy ra lỗi hệ thống", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                    <KeyRound className="w-4 h-4" />
                    Đổi mật khẩu
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Đổi mật khẩu</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <div className="space-y-4">
                        <Input
                            type="password"
                            label="Mật khẩu hiện tại"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Nhập mật khẩu hiện tại..."
                        />
                        <Input
                            type="password"
                            label="Mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Ít nhất 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt..."
                        />
                        <Input
                            type="password"
                            label="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu mới..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" className="rounded-xl" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button onClick={handleSave} isLoading={isLoading} className="rounded-xl">
                        Cập nhật
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

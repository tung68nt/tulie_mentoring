"use client";

import { useState } from "react";
import { updateUserRole } from "@/lib/actions/user";
import { Shield } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UserRoleSelectorProps {
    userId: string;
    currentRole: string;
    isCurrentUser: boolean;
}

export function UserRoleSelector({ userId, currentRole, isCurrentUser }: UserRoleSelectorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [pendingRole, setPendingRole] = useState<string | null>(null);

    const handleRoleChange = async (newRole: string) => {
        setPendingRole(newRole);
    };

    const confirmRoleChange = async () => {
        if (!pendingRole) return;
        setIsLoading(true);
        try {
            await updateUserRole(userId, pendingRole);
            toast.success("Cập nhật vai trò thành công");
            setPendingRole(null);
        } catch (error: any) {
            toast.error(error.message || "Đã xảy ra lỗi khi cập nhật");
        } finally {
            setIsLoading(false);
        }
    };

    if (isCurrentUser) {
        return (
            <div className="flex items-center gap-2 opacity-80 cursor-not-allowed">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary capitalize">
                    {currentRole}
                </span>
            </div>
        );
    }

    return (
        <>
            <Select
                defaultValue={currentRole}
                onValueChange={handleRoleChange}
                disabled={isLoading}
            >
                <SelectTrigger className="w-[120px] h-8 bg-transparent text-xs font-semibold focus:ring-0">
                    <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="mentee">Mentee</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="viewer">Người xem</SelectItem>
                    <SelectItem value="admin">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <Shield className="w-3 h-3" /> Admin
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            <Dialog open={pendingRole !== null} onOpenChange={(open) => !open && setPendingRole(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận thay đổi vai trò</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn thay đổi vai trò của người dùng này thành <strong>{pendingRole}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setPendingRole(null)}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={confirmRoleChange}
                            disabled={isLoading}
                        >
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

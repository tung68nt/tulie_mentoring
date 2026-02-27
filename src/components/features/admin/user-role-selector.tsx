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

interface UserRoleSelectorProps {
    userId: string;
    currentRole: string;
    isCurrentUser: boolean;
}

export function UserRoleSelector({ userId, currentRole, isCurrentUser }: UserRoleSelectorProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleChange = async (newRole: string) => {
        setIsLoading(true);
        try {
            await updateUserRole(userId, newRole);
            toast.success("Cập nhật vai trò thành công");
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
    );
}

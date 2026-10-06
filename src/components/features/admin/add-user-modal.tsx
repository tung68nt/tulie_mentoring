"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createSingleUser } from "@/lib/actions/user";

export function AddUserModal({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        email: "",
        firstName: "",
        lastName: "",
        role: "mentee",
        password: "123456",
    });

    const handleSubmit = async () => {
        if (!form.email) {
            toast.error("Email là bắt buộc");
            return;
        }
        if (!form.firstName) {
            toast.error("Họ là bắt buộc");
            return;
        }

        setIsLoading(true);
        try {
            const result = await createSingleUser(form);
            if (result.success) {
                toast.success(`Đã thêm ${form.firstName} ${form.lastName}`);
                setIsOpen(false);
                setForm({ email: "", firstName: "", lastName: "", role: "mentee", password: "123456" });
            } else {
                toast.error(result.error || "Lỗi khi thêm người dùng");
            }
        } catch {
            toast.error("Đã xảy ra lỗi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Thêm người dùng mới
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="firstName">Họ *</Label>
                            <Input
                                id="firstName"
                                placeholder="Nguyễn Văn"
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Tên *</Label>
                            <Input
                                id="lastName"
                                placeholder="A"
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="mt-1"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Vai trò</Label>
                            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mentee">Mentee</SelectItem>
                                    <SelectItem value="mentor">Mentor</SelectItem>
                                    <SelectItem value="facilitator">Facilitator</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="program_manager">User Manager</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="text"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Đang thêm..." : "Thêm người dùng"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

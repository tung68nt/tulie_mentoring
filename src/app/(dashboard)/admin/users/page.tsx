import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers, deleteUser } from "@/lib/actions/user";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, Shield, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { UserRoleSelector } from "@/components/features/admin/user-role-selector";
import { DeleteUserButton } from "@/components/features/admin/delete-user-button";
import { ImportUsersModal } from "@/components/features/admin/import-users-modal";
import { Upload } from "lucide-react";

export default async function AdminUsersPage() {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager")) {
        redirect("/login");
    }

    try {
        const users = await getAllUsers();
        const serializedUsers = JSON.parse(JSON.stringify(users));

        return (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground">Quản lý Người dùng</h1>
                        <p className="text-sm text-muted-foreground mt-1">Danh sách tất cả tài khoản trong hệ thống ({serializedUsers.length})</p>
                    </div>
                    <ImportUsersModal>
                        <Button className="shrink-0 gap-2">
                            <Upload className="w-4 h-4" />
                            Nhập từ Excel
                        </Button>
                    </ImportUsersModal>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Người dùng</TableHead>
                                <TableHead>Vai trò</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Tham gia</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {serializedUsers.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                firstName={user.firstName}
                                                lastName={user.lastName}
                                                src={user.avatar}
                                                size="sm"
                                            />
                                            <div>
                                                <Link href={`/admin/users/${user.id}`} className="font-semibold text-foreground hover:underline">
                                                    {user.firstName} {user.lastName}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="-ml-3">
                                            <UserRoleSelector
                                                userId={user.id}
                                                currentRole={user.role}
                                                isCurrentUser={user.id === session.user.id}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge status={user.isActive ? "active" : "inactive"} size="sm" />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(user.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {user.role !== "admin" && user.id !== session?.user?.id && (
                                            <DeleteUserButton
                                                userId={user.id}
                                                userName={`${user.firstName} ${user.lastName}`}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">Không thể tải danh sách người dùng. Vui lòng thử lại sau.</p>
            </div>
        );
    }
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/lib/actions/user";
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
import { Upload, UserPlus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { UserRoleSelector } from "@/components/features/admin/user-role-selector";
import { UserActionsDropdown } from "@/components/features/admin/user-actions-dropdown";
import { ImportUsersModal } from "@/components/features/admin/import-users-modal";
import { AddUserModal } from "@/components/features/admin/add-user-modal";

export default async function AdminUsersPage() {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager" && role !== "manager")) {
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
                    <div className="flex items-center gap-2 flex-wrap">
                        <ImportUsersModal>
                            <Button variant="outline" className="shrink-0 gap-2">
                                <Upload className="w-4 h-4" />
                                Nhập từ Excel
                            </Button>
                        </ImportUsersModal>
                        <AddUserModal>
                            <Button className="shrink-0 gap-2">
                                <UserPlus className="w-4 h-4" />
                                Thêm người dùng
                            </Button>
                        </AddUserModal>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Người dùng</TableHead>
                                <TableHead>Vai trò</TableHead>
                                <TableHead className="hidden sm:table-cell">Trạng thái</TableHead>
                                <TableHead className="hidden md:table-cell">Tham gia</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {serializedUsers.map((user: any) => (
                                <TableRow key={user.id} className={!user.isActive ? "opacity-50" : ""}>
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
                                                currentUserRole={role}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge status={user.isActive ? "active" : "inactive"} size="sm" />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground hidden md:table-cell">
                                        {formatDate(user.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {user.id !== session?.user?.id && (
                                            <UserActionsDropdown
                                                userId={user.id}
                                                userName={`${user.firstName} ${user.lastName}`}
                                                isActive={user.isActive}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>
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

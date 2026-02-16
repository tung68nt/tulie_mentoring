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

export default async function AdminUsersPage() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        redirect("/login");
    }

    const users = await getAllUsers();

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Quản lý Người dùng</h1>
                <p className="text-sm text-muted-foreground mt-1">Danh sách tất cả tài khoản trong hệ thống ({users.length})</p>
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
                        {users.map((user) => (
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
                                    <div className="flex items-center gap-2">
                                        {user.role === "admin" && <Shield className="w-4 h-4 text-primary" />}
                                        <span className={`capitalize ${user.role === 'admin' ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge status={user.isActive ? "active" : "inactive"} size="sm" />
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(user.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {user.role !== "admin" && (
                                        <form action={async () => {
                                            "use server";
                                            await deleteUser(user.id);
                                        }}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                                title="Xóa người dùng"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

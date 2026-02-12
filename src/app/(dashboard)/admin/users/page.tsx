import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers, deleteUser } from "@/lib/actions/user";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Shield, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
    const session = await auth();
    if ((session?.user as any).role !== "admin") {
        redirect("/");
    }

    const users = await getAllUsers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
                <p className="text-gray-500 text-sm mt-1">Danh sách tất cả tài khoản trong hệ thống ({users.length})</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-900">Người dùng</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Vai trò</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Trạng thái</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Tham gia</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            firstName={user.firstName}
                                            lastName={user.lastName}
                                            src={user.avatar}
                                            size="sm"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {user.role === "admin" && <Shield className="w-4 h-4 text-purple-600" />}
                                        <span className={`capitalize ${user.role === 'admin' ? 'font-bold text-purple-600' : ''}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge status={user.isActive ? "active" : "inactive"} size="sm" />
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {formatDate(user.createdAt)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.role !== "admin" && (
                                        <form action={async () => {
                                            "use server";
                                            await deleteUser(user.id);
                                        }}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                                title="Xóa người dùng"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

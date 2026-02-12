import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers, deleteUser } from "@/lib/actions/user";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Shield, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminUsersPage() {
    const session = await auth();
    if ((session?.user as any).role !== "admin") {
        redirect("/");
    }

    const users = await getAllUsers();

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-black">Quản lý Người dùng</h1>
                <p className="text-[#666] text-sm">Danh sách tất cả tài khoản trong hệ thống ({users.length})</p>
            </div>

            <div className="bg-white rounded-[8px] border border-[#eaeaea] overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-black">Người dùng</th>
                            <th className="px-6 py-4 font-semibold text-black">Vai trò</th>
                            <th className="px-6 py-4 font-semibold text-black">Trạng thái</th>
                            <th className="px-6 py-4 font-semibold text-black">Tham gia</th>
                            <th className="px-6 py-4 font-semibold text-black text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaeaea]">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-[#fafafa] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            firstName={user.firstName}
                                            lastName={user.lastName}
                                            src={user.avatar}
                                            size="sm"
                                        />
                                        <div>
                                            <Link href={`/admin/users/${user.id}`} className="font-semibold text-black hover:underline">
                                                {user.firstName} {user.lastName}
                                            </Link>
                                            <p className="text-xs text-[#666]">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {user.role === "admin" && <Shield className="w-4 h-4 text-[#7928ca]" />}
                                        <span className={`capitalize ${user.role === 'admin' ? 'font-semibold text-[#7928ca]' : 'text-[#666]'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge status={user.isActive ? "active" : "inactive"} size="sm" />
                                </td>
                                <td className="px-6 py-4 text-[#666]">
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
                                                className="text-[#ee0000] hover:text-[#ee0000] hover:bg-[#ee0000]/5 h-8 w-8 p-0"
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

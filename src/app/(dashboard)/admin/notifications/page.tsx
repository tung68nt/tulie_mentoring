import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Bell, CheckCircle, Mail, AlertCircle, Info } from "lucide-react";

export default async function AdminNotificationsPage() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== "admin" && role !== "program_manager")) {
        redirect("/login");
    }

    const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            }
        },
        take: 50
    });

    const typeIcons: Record<string, any> = {
        meeting: <Mail className="w-4 h-4 text-blue-500" />,
        mentorship: <CheckCircle className="w-4 h-4 text-green-500" />,
        goal: <CheckCircle className="w-4 h-4 text-purple-500" />,
        feedback: <Mail className="w-4 h-4 text-orange-500" />,
        system: <AlertCircle className="w-4 h-4 text-red-500" />,
        ticket: <Info className="w-4 h-4 text-primary" />,
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Lịch sử Thông báo</h1>
                <p className="text-sm text-muted-foreground mt-1">Danh sách 50 thông báo gần đây nhất trong hệ thống</p>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Người nhận</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thông báo</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {notifications.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                        Chưa có thông báo nào.
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((notif) => (
                                    <tr key={notif.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">{notif.user.firstName} {notif.user.lastName}</span>
                                                <span className="text-xs text-muted-foreground">{notif.user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 shrink-0">
                                                    {typeIcons[notif.type] || <Bell className="w-4 h-4 text-muted-foreground" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground">{notif.title}</span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1">{notif.message}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {notif.isRead ? (
                                                <Badge variant="secondary" size="sm">Đã đọc</Badge>
                                            ) : (
                                                <Badge variant="primary" size="sm">Chưa đọc</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                                            {formatDate(notif.createdAt, "dd/MM/yyyy HH:mm")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

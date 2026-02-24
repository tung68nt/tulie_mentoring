"use client";

import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle2, MessageSquare, LogIn, PlusCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityLog {
    id: string;
    action: string;
    entityType?: string;
    createdAt: string;
}

const ACTION_CONFIG: Record<string, { icon: any, label: string, color: string }> = {
    check_in: { icon: LogIn, label: "Đã điểm danh buổi học", color: "text-blue-500" },
    create_task: { icon: PlusCircle, label: "Đã tạo công việc mới", color: "text-green-500" },
    submit_reflection: { icon: MessageSquare, label: "Đã viết thu hoạch", color: "text-purple-500" },
    complete_task: { icon: CheckCircle2, label: "Đã hoàn thành công việc", color: "text-orange-500" },
};

export function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
    return (
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Hoạt động gần đây
                </h3>
            </div>

            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border/40">
                {logs.length > 0 ? (
                    logs.map((log) => {
                        const config = ACTION_CONFIG[log.action] || { icon: Activity, label: log.action, color: "text-muted-foreground" };
                        return (
                            <div key={log.id} className="relative pl-8 animate-in fade-in slide-in-from-left-2 transition-all">
                                <div className={cn("absolute left-0 top-0.5 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center z-10", config.color)}>
                                    <config.icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[13px] font-medium text-foreground leading-snug">
                                        {config.label}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/60 capitalize">
                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: vi })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-xs text-muted-foreground">Chưa có hoạt động nào được ghi nhận.</p>
                    </div>
                )}
            </div>
        </Card>
    );
}

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Target, Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
    stats: {
        attendanceRate: number;
        avgGoalProgress: number;
        taskCompletionRate: number;
        recentActivitiesCount: number;
    };
}

export function StatsCards({ stats }: StatsCardsProps) {
    const items = [
        {
            title: "Chuyên cần",
            value: `${stats.attendanceRate}%`,
            label: "Số buổi tham gia",
            icon: Calendar,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Tiến độ mục tiêu",
            value: `${stats.avgGoalProgress}%`,
            label: "Mức độ hoàn thành",
            icon: Target,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "Công việc",
            value: `${stats.taskCompletionRate}%`,
            label: "Đã hoàn thành",
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: "Hoạt động",
            value: stats.recentActivitiesCount,
            label: "Trong 7 ngày qua",
            icon: Activity,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, i) => (
                <Card key={i} className="p-6 rounded-lg border border-border/60 bg-background shadow-none h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-2 rounded-lg", item.bg)}>
                            <item.icon className={cn("w-5 h-5", item.color)} />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-semibold h-5 px-2 rounded-md border-border/60">Thống kê</Badge>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-[13px] font-medium text-muted-foreground">{item.title}</h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground">{item.value}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60">{item.label}</p>
                    </div>
                </Card>
            ))}
        </div>
    );
}

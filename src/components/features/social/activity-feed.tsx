"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getActivityLogs } from "@/lib/actions/activity";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { 
    Heart, 
    MessageCircle, 
    UserPlus, 
    TrendingUp,
    Award,
    Calendar,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITY_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
    create_post: { icon: MessageCircle, label: "đã đăng bài viết mới", color: "text-blue-500" },
    comment_post: { icon: MessageCircle, label: "đã bình luận", color: "text-green-500" },
    like_post: { icon: Heart, label: "đã thích", color: "text-red-500" },
    send_chat_message: { icon: MessageCircle, label: "đã gửi tin nhắn", color: "text-blue-400" },
    create_meeting: { icon: Calendar, label: "đã tạo cuộc họp", color: "text-purple-500" },
    complete_goal: { icon: TrendingUp, label: "đã hoàn thành mục tiêu", color: "text-green-500" },
    earn_badge: { icon: Award, label: "đã nhận huy hiệu", color: "text-yellow-500" },
    join_program: { icon: UserPlus, label: "đã tham gia chương trình", color: "text-primary" },
};

interface ActivityItem {
    id: string;
    action: string;
    createdAt: Date;
    user: {
        firstName: string;
        lastName: string;
        avatar?: string;
    };
}

export function ActivityFeed({ className }: { className?: string }) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadActivities() {
            try {
                const data = await getActivityLogs(20);
                setActivities(data);
            } catch (error) {
                console.error("Failed to load activities");
            } finally {
                setIsLoading(false);
            }
        }
        loadActivities();
    }, []);

    if (isLoading) {
        return (
            <Card className={cn("p-4", className)}>
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Hoạt động gần đây</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-muted" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 bg-muted rounded w-3/4" />
                                <div className="h-2 bg-muted rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className={cn("p-4", className)}>
            <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Hoạt động gần đây</h3>
            </div>

            {activities.length === 0 ? (
                <p className="text-[12px] text-muted-foreground/60 text-center py-4">
                    Chưa có hoạt động nào
                </p>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity) => {
                        const config = ACTIVITY_CONFIG[activity.action] || { 
                            icon: Bell, 
                            label: activity.action, 
                            color: "text-muted-foreground" 
                        };
                        const Icon = config.icon;

                        return (
                            <div key={activity.id} className="flex gap-3 group">
                                <div className="relative">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={activity.user.avatar} />
                                        <AvatarFallback className="text-[10px] bg-muted">
                                            {activity.user.firstName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border border-background",
                                        config.color.replace("text-", "bg-")
                                    )}>
                                        <Icon className={cn("w-2.5 h-2.5", config.color)} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] text-foreground leading-snug">
                                        <span className="font-semibold">{activity.user.firstName} {activity.user.lastName}</span>{" "}
                                        <span className="text-muted-foreground">{config.label}</span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: vi })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

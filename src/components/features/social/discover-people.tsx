"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { searchUsersForSharing } from "@/lib/actions/wiki";
import { cn } from "@/lib/utils";
import { UserPlus, X } from "lucide-react";

interface SuggestedUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role: string;
}

export function DiscoverPeople({ className, currentUserId }: { className?: string; currentUserId?: string }) {
    const [users, setUsers] = useState<SuggestedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [following, setFollowing] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function loadUsers() {
            try {
                const results = await searchUsersForSharing("");
                const filtered = results
                    .filter((u: any) => u.id !== currentUserId)
                    .slice(0, 5);
                setUsers(filtered);
            } catch (error) {
                console.error("Failed to load users");
            } finally {
                setIsLoading(false);
            }
        }
        loadUsers();
    }, [currentUserId]);

    const handleFollow = (userId: string) => {
        setFollowing(prev => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    if (isLoading) {
        return (
            <Card className={cn("p-4", className)}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Khám phá</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-muted" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 bg-muted rounded w-3/4" />
                                <div className="h-2 bg-muted rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className={cn("p-4", className)}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Khám phá</h3>
            </div>

            {users.length === 0 ? (
                <p className="text-[12px] text-muted-foreground/60 text-center py-4">
                    Không tìm thấy người dùng
                </p>
            ) : (
                <div className="space-y-3">
                    {users.map((user) => {
                        const isFollowing = following.has(user.id);

                        return (
                            <div key={user.id} className="flex items-center gap-3 group">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-foreground truncate">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60 truncate">
                                        {user.role === "mentor" ? "Mentor" : user.role}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant={isFollowing ? "outline" : "default"}
                                    className={cn(
                                        "h-8 px-3 text-[11px]",
                                        isFollowing && "border-primary/30 text-primary hover:bg-primary/5"
                                    )}
                                    onClick={() => handleFollow(user.id)}
                                >
                                    {isFollowing ? (
                                        <span className="flex items-center gap-1">
                                            <UserPlus className="w-3 h-3" />
                                            Đã theo
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <UserPlus className="w-3 h-3" />
                                            Theo dõi
                                        </span>
                                    )}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

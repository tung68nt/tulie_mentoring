"use client";

import { useEffect, useState } from "react";
import { PostForm } from "./post-form";
import { PostCard } from "./post-card";
import { getPosts } from "@/lib/actions/social";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SocialFeed({ currentUser, programCycleId }: { currentUser: any; programCycleId?: string }) {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPosts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getPosts({ programCycleId });
            setPosts(data);
        } catch (err) {
            setError("Không thể tải bảng tin. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [programCycleId]);

    return (
        <div className="space-y-6 max-w-2xl mx-auto w-full">
            <PostForm user={currentUser} programCycleId={programCycleId} onSuccess={loadPosts} />
            
            <div className="flex items-center justify-between py-2 px-1 border-b border-border/10">
                <h2 className="text-[14px] font-bold text-foreground">Bảng tin cộng đồng</h2>
                <Button variant="ghost" size="icon-xs" className="text-muted-foreground/40 hover:text-primary transition-colors" onClick={loadPosts} disabled={isLoading}>
                    <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                </Button>
            </div>

            <div className="space-y-4">
                {isLoading && posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Đang tải bảng tin...</p>
                    </div>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={currentUser}
                            onUpdate={loadPosts}
                        />
                    ))
                ) : (
                    <Card className="p-20 text-center rounded-lg border-dashed bg-muted/5 shadow-none">
                        <p className="text-sm text-muted-foreground">Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!</p>
                    </Card>
                )}
            </div>
        </div>
    );
}

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

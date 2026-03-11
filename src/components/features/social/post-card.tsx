"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Heart, MessageCircle, Share2, MoreHorizontal, Lightbulb } from "lucide-react";
import { useState } from "react";
import { toggleReaction, addComment } from "@/lib/actions/social";
import { cn } from "@/lib/utils";

interface PostCardProps {
    post: any;
    currentUser: any;
}

export function PostCard({ post, currentUser }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.reactions?.some((r: any) => r.type === "like"));
    const [likesCount, setLikesCount] = useState(post._count.reactions);
    const [isCommenting, setIsCommenting] = useState(false);
    const [commentContent, setCommentContent] = useState("");

    const handleLike = async () => {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        try {
            await toggleReaction({ postId: post.id, type: "like" });
        } catch (error) {
            // Revert on error
            setIsLiked(isLiked);
            setLikesCount(likesCount);
        }
    };

    return (
        <Card className="rounded-lg border border-border/60 bg-card overflow-hidden shadow-none">
            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>{post.author.firstName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                    {post.author.firstName} {post.author.lastName}
                                </span>
                                {post.author.role !== "mentee" && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                        {post.author.role === "mentor" ? "Mentor" : "Admin"}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground/60">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground/40">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </div>

                {/* Attachments (if any) */}
                {post.attachments?.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 rounded-lg overflow-hidden border border-border/40 bg-muted/20">
                        {post.attachments.map((file: any) => (
                            <img key={file.id} src={file.url} alt="Post attachment" className="w-full h-auto object-cover max-h-[400px]" />
                        ))}
                    </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center justify-between py-1 border-t border-border/10">
                    <div className="flex gap-4">
                        <button 
                            onClick={handleLike}
                            className={cn(
                                "flex items-center gap-1.5 text-[12px] transition-colors",
                                isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                            <span className="font-medium">{likesCount}</span>
                        </button>
                        <button 
                            onClick={() => setIsCommenting(!isCommenting)}
                            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-medium">{post._count.comments}</span>
                        </button>
                    </div>
                    <button className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Comment Section (Simplified) */}
                {isCommenting && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-2">
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={currentUser.avatar} />
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    className="flex-1 bg-muted/30 border-none rounded-full px-3 py-1 text-[12px] focus:ring-1 focus:ring-primary/20 outline-none"
                                    placeholder="Viết bình luận..."
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && commentContent.trim()) {
                                            // Handle add comment
                                            setCommentContent("");
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

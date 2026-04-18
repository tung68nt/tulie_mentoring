"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    MoreHorizontal, 
    ThumbsUp,
    Smile,
    Frown,
    Angry,
    Send,
    CornerDownRight
} from "lucide-react";
import { toggleReaction, addComment, getComments } from "@/lib/actions/social";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REACTION_TYPES = [
    { type: "like", icon: ThumbsUp, label: "Thích", color: "text-blue-500" },
    { type: "love", icon: Heart, label: "Yêu thích", color: "text-red-500" },
    { type: "haha", icon: Smile, label: "Haha", color: "text-yellow-500" },
    { type: "wow", icon: Smile, label: "Wow", color: "text-orange-500" },
    { type: "sad", icon: Frown, label: "Buồn", color: "text-blue-400" },
    { type: "angry", icon: Angry, label: "Giận", color: "text-red-600" },
];

interface PostCardProps {
    post: any;
    currentUser: any;
    onUpdate?: () => void;
}

export function PostCard({ post, currentUser, onUpdate }: PostCardProps) {
    const [reactions, setReactions] = useState<{type: string, count: number, userReacted: boolean}[]>([]);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<{id: string, name: string} | null>(null);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    useEffect(() => {
        const reactionCounts: Record<string, {count: number, userReacted: boolean}> = {};
        post.reactions?.forEach((r: any) => {
            if (!reactionCounts[r.type]) {
                reactionCounts[r.type] = { count: 0, userReacted: false };
            }
            reactionCounts[r.type].count++;
            if (r.userId === currentUser.id) {
                reactionCounts[r.type].userReacted = true;
            }
        });
        setReactions(
            Object.entries(reactionCounts).map(([type, data]) => ({
                type,
                ...data
            }))
        );
    }, [post.reactions, currentUser.id]);

    const handleReaction = async (type: string) => {
        const reactionIndex = reactions.findIndex(r => r.type === type);
        let updatedReactions = [...reactions];
        
        if (reactionIndex >= 0) {
            const existing = reactions[reactionIndex];
            if (existing.userReacted) {
                updatedReactions[reactionIndex] = { ...existing, count: existing.count - 1, userReacted: false };
                if (updatedReactions[reactionIndex].count === 0) {
                    updatedReactions = updatedReactions.filter(r => r.type !== type);
                }
            } else {
                updatedReactions[reactionIndex] = { ...existing, count: existing.count + 1, userReacted: true };
            }
        } else {
            updatedReactions.push({ type, count: 1, userReacted: true });
        }
        
        setReactions(updatedReactions);
        setShowReactionPicker(false);
        
        try {
            await toggleReaction({ postId: post.id, type });
        } catch (error) {
            setReactions(reactions);
            toast.error("Không thể cập nhật cảm xúc");
        }
    };

    const loadComments = async () => {
        setIsLoadingComments(true);
        try {
            const data = await getComments(post.id);
            setComments(data);
        } catch (error) {
            console.error("Failed to load comments");
        } finally {
            setIsLoadingComments(false);
        }
    };

    const toggleCommentSection = async () => {
        if (!isCommenting) {
            await loadComments();
        }
        setIsCommenting(!isCommenting);
    };

    const handleSubmitComment = async () => {
        if (!commentContent.trim()) return;
        
        setIsSubmittingComment(true);
        try {
            await addComment({
                postId: post.id,
                content: commentContent,
                parentId: replyingTo?.id
            });
            setCommentContent("");
            setReplyingTo(null);
            await loadComments();
            onUpdate?.();
        } catch (error) {
            toast.error("Không thể gửi bình luận");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
    const userReactedType = reactions.find(r => r.userReacted)?.type;

    return (
        <Card className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-none">
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {post.author.firstName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                    {post.author.firstName} {post.author.lastName}
                                </span>
                                {post.author.role !== "mentee" && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                        {post.author.role === "mentor" ? "Mentor" : post.author.role}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground/60">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground/40 hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </div>

                {/* Attachments */}
                {post.attachments?.length > 0 && (
                    <div className={cn(
                        "rounded-xl overflow-hidden border border-border/40 bg-muted/20",
                        post.attachments.length === 1 ? "grid-cols-1" : "grid grid-cols-2 gap-1"
                    )}>
                        {post.attachments.map((file: any, index: number) => (
                            <div key={file.id} className={cn(
                                "relative",
                                post.attachments.length > 2 && index >= 2 && "hidden"
                            )}>
                                <img 
                                    src={file.url} 
                                    alt={file.name || "Post attachment"} 
                                    className="w-full h-auto object-cover max-h-[400px]" 
                                />
                                {post.attachments.length > 2 && index === 2 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                                        +{post.attachments.length - 2}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Reaction Summary */}
                {totalReactions > 0 && (
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground/60">
                        <div className="flex -space-x-1">
                            {reactions.slice(0, 3).map(r => {
                                const reactionConfig = REACTION_TYPES.find(rt => rt.type === r.type);
                                const Icon = reactionConfig?.icon || ThumbsUp;
                                return (
                                    <div key={r.type} className={cn(
                                        "w-5 h-5 rounded-full bg-muted flex items-center justify-center border border-background",
                                        reactionConfig?.color
                                    )}>
                                        <Icon className="w-3 h-3" />
                                    </div>
                                );
                            })}
                        </div>
                        <span>{totalReactions}</span>
                    </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1">
                        {/* Reaction Button */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-1.5 text-[12px] h-8 px-2",
                                    userReactedType && "text-primary"
                                )}
                                onClick={() => setShowReactionPicker(!showReactionPicker)}
                            >
                                {userReactedType ? (
                                    <>
                                        {(() => {
                                            const rc = REACTION_TYPES.find(r => r.type === userReactedType);
                                            const Icon = rc?.icon || ThumbsUp;
                                            return <Icon className={cn("w-4 h-4", rc?.color)} />;
                                        })()}
                                        <span className="font-medium">Đã react</span>
                                    </>
                                ) : (
                                    <>
                                        <ThumbsUp className="w-4 h-4" />
                                        <span className="font-medium">Thích</span>
                                    </>
                                )}
                            </Button>
                            
                            {/* Reaction Picker */}
                            {showReactionPicker && (
                                <div className="absolute bottom-full left-0 mb-2 z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="flex items-center gap-1 p-1.5 bg-card rounded-full border border-border/40 shadow-lg">
                                        {REACTION_TYPES.map(rt => {
                                            const Icon = rt.icon;
                                            return (
                                                <button
                                                    key={rt.type}
                                                    onClick={() => handleReaction(rt.type)}
                                                    className={cn(
                                                        "w-8 h-8 flex items-center justify-center rounded-full hover:scale-125 transition-transform",
                                                        reactions.find(r => r.type === rt.type)?.userReacted && `bg-${rt.color}/10`
                                                    )}
                                                    title={rt.label}
                                                >
                                                    <Icon className={cn("w-5 h-5", rt.color)} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-[12px] h-8 px-2"
                            onClick={toggleCommentSection}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-medium">{post._count.comments}</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-[12px] h-8 px-2"
                        >
                            <Share2 className="w-4 h-4" />
                            <span className="font-medium">Chia sẻ</span>
                        </Button>
                    </div>
                </div>

                {/* Comments Section */}
                {isCommenting && (
                    <div className="space-y-3 pt-2 border-t border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Comment Input */}
                        <div className="flex gap-2">
                            <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage src={currentUser.avatar} />
                                <AvatarFallback className="text-[10px] bg-muted">
                                    {currentUser.firstName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                {replyingTo && (
                                    <div className="flex items-center gap-1 text-[11px] text-primary/70">
                                        <CornerDownRight className="w-3 h-3" />
                                        <span>Trả lời @{replyingTo.name}</span>
                                        <button 
                                            onClick={() => setReplyingTo(null)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Viết bình luận..."
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        className="min-h-[60px] text-[13px] resize-none bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey && commentContent.trim()) {
                                                e.preventDefault();
                                                handleSubmitComment();
                                            }
                                        }}
                                    />
                                    <Button 
                                        size="icon-sm"
                                        onClick={handleSubmitComment}
                                        disabled={!commentContent.trim() || isSubmittingComment}
                                        className="shrink-0 bg-primary hover:bg-primary/90"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        {isLoadingComments ? (
                            <div className="py-4 text-center text-[12px] text-muted-foreground/60">
                                Đang tải bình luận...
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="space-y-3">
                                {comments.map(comment => (
                                    <CommentItem 
                                        key={comment.id} 
                                        comment={comment} 
                                        currentUser={currentUser}
                                        onReply={(id, name) => {
                                            setReplyingTo({ id, name: `${comment.author.firstName} ${comment.author.lastName}` });
                                        }}
                                        depth={0}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-4 text-center text-[12px] text-muted-foreground/60">
                                Chưa có bình luận nào. Hãy là người đầu tiên!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}

function CommentItem({ comment, currentUser, onReply, depth }: { 
    comment: any; 
    currentUser: any;
    onReply: (id: string, name: string) => void;
    depth: number;
}) {
    const [showReplies, setShowReplies] = useState(depth < 2);
    
    return (
        <div className={cn("flex gap-2", depth > 0 && "ml-6 mt-2")}>
            <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback className="text-[10px] bg-muted">
                    {comment.author.firstName?.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <div className="bg-muted/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-foreground">
                            {comment.author.firstName} {comment.author.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                        </span>
                    </div>
                    <p className="text-[12px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </p>
                </div>
                <div className="flex items-center gap-3 px-1">
                    <button 
                        onClick={() => onReply(comment.id, `${comment.author.firstName} ${comment.author.lastName}`)}
                        className="text-[10px] text-muted-foreground/60 hover:text-primary font-medium"
                    >
                        Trả lời
                    </button>
                    {comment.replies && comment.replies.length > 0 && (
                        <button 
                            onClick={() => setShowReplies(!showReplies)}
                            className="text-[10px] text-muted-foreground/60 hover:text-primary font-medium"
                        >
                            {showReplies ? "Ẩn" : `Xem ${comment.replies.length} trả lời`}
                        </button>
                    )}
                </div>
                {showReplies && comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-2">
                        {comment.replies.map((reply: any) => (
                            <CommentItem 
                                key={reply.id} 
                                comment={reply} 
                                currentUser={currentUser}
                                onReply={onReply}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createPost } from "@/lib/actions/social";
import { toast } from "sonner";
import { Image as ImageIcon, Link as LinkIcon, Smile, Send } from "lucide-react";

export function PostForm({ user, onSuccess }: { user: any; onSuccess?: () => void }) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await createPost({
                content,
                visibility: "program"
            });
            setContent("");
            toast.success("Đã đăng bài thành công!");
            onSuccess?.();
        } catch (error) {
            toast.error("Không thể đăng bài. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="p-4 rounded-lg bg-card shadow-none">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={user.avatar || user.image} />
                        <AvatarFallback>{user.firstName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Textarea
                        placeholder={`${user.firstName} ơi, bạn đang nghĩ gì?`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[100px] bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 resize-none text-sm placeholder:text-muted-foreground/60 p-3"
                    />
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" type="button">
                            <ImageIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" type="button">
                            <LinkIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" type="button">
                            <Smile className="w-4 h-4" />
                        </Button>
                    </div>
                    
                    <Button 
                        type="submit" 
                        disabled={isSubmitting || !content.trim()} 
                        size="sm"
                        className="gap-2 px-6 h-9"
                    >
                        <span className="text-[13px] font-semibold">Đăng ngay</span>
                        <Send className="w-3 h-3" />
                    </Button>
                </div>
            </form>
        </Card>
    );
}

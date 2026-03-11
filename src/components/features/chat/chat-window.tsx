"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, Smile, Info, MoreVertical } from "lucide-react";
import { getMessages, sendMessage } from "@/lib/actions/chat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function ChatWindow({ 
    currentUser, 
    roomId 
}: { 
    currentUser: any; 
    roomId: string;
}) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            const data = await getMessages(roomId);
            setMessages(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, [roomId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const content = input;
        setInput("");
        
        // Optimistic UI update
        const optimisticMessage = {
            id: Math.random().toString(),
            content,
            senderId: currentUser.id,
            createdAt: new Date().toISOString(),
            sender: {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                avatar: currentUser.avatar,
            }
        };
        setMessages([...messages, optimisticMessage]);

        try {
            await sendMessage({ roomId, content });
        } catch (err) {
            console.error(err);
            // Revert on error or show toast
        }
    };

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/40 shrink-0 shadow-sm z-10 bg-background/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-9 w-9 border-2 border-primary/20 p-0.5">
                            <AvatarFallback>C</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background ring-1 ring-black/5" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-foreground">Phòng Chat</h3>
                        <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Đang hoạt động
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground/40 hover:text-foreground">
                        <Info className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground/40 hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 py-6 scroll-smooth">
                <div className="flex flex-col gap-6">
                    {messages.map((message, i) => {
                        const isOwn = message.senderId === currentUser.id;
                        const prevMessage = messages[i-1];
                        const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;

                        return (
                            <div key={message.id} className={cn(
                                "flex items-end gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
                                isOwn ? "flex-row-reverse" : "flex-row"
                            )}>
                                {!isOwn && (
                                    <div className="w-8 shrink-0">
                                        {showAvatar ? (
                                            <Avatar className="h-8 w-8 ring-2 ring-primary/10 p-0.5">
                                                <AvatarImage src={message.sender.avatar} />
                                                <AvatarFallback>{message.sender.firstName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        ) : <div className="w-8" />}
                                    </div>
                                )}
                                <div className={cn(
                                    "flex flex-col max-w-[70%] group",
                                    isOwn ? "items-end" : "items-start"
                                )}>
                                    {!isOwn && showAvatar && (
                                        <span className="text-[10px] text-muted-foreground/60 ml-1 mb-1 font-semibold no-uppercase">
                                            {message.sender.firstName}
                                        </span>
                                    )}
                                    <div className={cn(
                                        "px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-transform duration-200 active:scale-95",
                                        isOwn 
                                            ? "bg-primary text-primary-foreground rounded-br-none ring-1 ring-primary-foreground/20" 
                                            : "bg-muted/50 text-foreground rounded-bl-none border border-border/40 hover:bg-muted/70"
                                    )}>
                                        {message.content}
                                    </div>
                                    <span className="text-[9px] text-muted-foreground/40 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium no-uppercase">
                                        {format(new Date(message.createdAt), "HH:mm", { locale: vi })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} className="h-1 w-full" />
                </div>
            </ScrollArea>

            {/* Message Input Container */}
            <div className="p-4 bg-background border-t border-border/40 shrink-0">
                <form 
                    onSubmit={handleSend}
                    className="flex items-center gap-2 p-1 bg-muted/30 border border-border/30 rounded-full pr-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-card transition-all"
                >
                    <Button type="button" variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer rounded-full ml-1">
                        <Plus className="w-4 h-4" />
                    </Button>
                    <input 
                        className="flex-1 bg-transparent border-none text-[13px] px-2 py-1 outline-none placeholder:text-muted-foreground/40"
                        placeholder="Nhập tin nhắn..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <div className="flex gap-0.5 items-center">
                        <Button type="button" variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer rounded-full">
                            <Smile className="w-4 h-4" />
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={!input.trim()}
                            size="icon-sm"
                            className="h-8 w-8 bg-primary rounded-full hover:bg-primary/90 shadow-md transform transition-transform active:scale-90"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile, Info, MoreVertical, Check, CheckCheck } from "lucide-react";
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
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadMessages = useCallback(async () => {
        try {
            const data = await getMessages(roomId);
            setMessages(data);
            // Clear pending IDs since server data is now available
            setPendingIds(new Set());
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        setIsLoading(true);
        loadMessages();
    }, [roomId, loadMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const content = input;
        const tempId = `pending-${Date.now()}`;
        setInput("");
        
        // Optimistic UI update
        const optimisticMessage = {
            id: tempId,
            content,
            senderId: currentUser.id,
            createdAt: new Date().toISOString(),
            sender: {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                avatar: currentUser.avatar,
            },
            _pending: true,
        };
        setPendingIds(prev => new Set(prev).add(tempId));
        setMessages(prev => [...prev, optimisticMessage]);

        try {
            const result = await sendMessage({ roomId, content });
            // Replace optimistic with real message
            setMessages(prev => prev.map(m => m.id === tempId ? { ...result, sender: optimisticMessage.sender, _sent: true } : m));
            setPendingIds(prev => { const s = new Set(prev); s.delete(tempId); return s; });
        } catch (err) {
            console.error(err);
            // Mark as failed
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, _failed: true, _pending: false } : m));
            setPendingIds(prev => { const s = new Set(prev); s.delete(tempId); return s; });
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0 bg-background/80 backdrop-blur-md z-10">
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
            <ScrollArea className="flex-1 px-4 py-4 scroll-smooth">
                <div className="flex flex-col gap-4">
                    {messages.map((message, i) => {
                        const isOwn = message.senderId === currentUser.id;
                        const prevMessage = messages[i-1];
                        const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
                        const isPending = message._pending;
                        const isSent = message._sent || (!isPending && isOwn);
                        const isFailed = message._failed;

                        return (
                            <div key={message.id} className={cn(
                                "flex items-end gap-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
                                isOwn ? "flex-row-reverse" : "flex-row"
                            )}>
                                {!isOwn && (
                                    <div className="w-7 shrink-0">
                                        {showAvatar ? (
                                            <Avatar className="h-7 w-7 ring-2 ring-primary/10 p-0.5">
                                                <AvatarImage src={message.sender.avatar} />
                                                <AvatarFallback>{message.sender.firstName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        ) : <div className="w-7" />}
                                    </div>
                                )}
                                <div className={cn(
                                    "flex flex-col max-w-[75%] group",
                                    isOwn ? "items-end" : "items-start"
                                )}>
                                    {!isOwn && showAvatar && (
                                        <span className="text-[10px] text-muted-foreground/60 ml-1 mb-0.5 font-semibold no-uppercase">
                                            {message.sender.firstName}
                                        </span>
                                    )}
                                    <div className={cn(
                                        "px-3 py-2 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all duration-200",
                                        isOwn 
                                            ? "bg-primary text-primary-foreground rounded-br-none" 
                                            : "bg-muted/50 text-foreground rounded-bl-none border border-border/40",
                                        isPending && "opacity-70",
                                        isFailed && "opacity-50 ring-1 ring-destructive/30"
                                    )}>
                                        {message.content}
                                    </div>
                                    {/* Time + Status */}
                                    <div className={cn(
                                        "flex items-center gap-1 mt-0.5 px-1",
                                        isOwn ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        <span className="text-[9px] text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity font-medium no-uppercase">
                                            {format(new Date(message.createdAt), "HH:mm", { locale: vi })}
                                        </span>
                                        {isOwn && (
                                            <span className="text-muted-foreground/40">
                                                {isPending ? (
                                                    <Check className="w-3 h-3 text-muted-foreground/30" />
                                                ) : isFailed ? (
                                                    <span className="text-[9px] text-destructive">!</span>
                                                ) : (
                                                    <CheckCheck className="w-3 h-3 text-primary/60" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} className="h-1 w-full" />
                </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="px-3 py-2 bg-background border-t border-border/40 shrink-0">
                <form 
                    onSubmit={handleSend}
                    className="flex items-center gap-1.5 p-1 bg-muted/30 border border-border/30 rounded-full pr-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-card transition-all"
                >
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon-sm" 
                        className="h-8 w-8 text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer rounded-full ml-0.5"
                        onClick={handleAttachClick}
                        title="Đính kèm tệp"
                    >
                        <Paperclip className="w-4 h-4" />
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        onChange={(e) => {
                            // TODO: implement file upload
                            const files = e.target.files;
                            if (files && files.length > 0) {
                                console.log("Selected files:", files);
                            }
                        }}
                    />
                    <input 
                        className="flex-1 bg-transparent border-none text-[13px] px-2 py-1.5 outline-none placeholder:text-muted-foreground/40"
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

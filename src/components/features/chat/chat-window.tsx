"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile, Info, MoreVertical, Check, CheckCheck, Users } from "lucide-react";
import { getMessages, sendMessage } from "@/lib/actions/chat";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { vi } from "date-fns/locale";

export function ChatWindow({ 
    currentUser, 
    roomId,
    roomInfo,
    otherUser,
    isOnline = false
}: { 
    currentUser: any; 
    roomId: string;
    roomInfo?: {
        name?: string;
        type?: string;
        participants?: any[];
    };
    otherUser?: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
    isOnline?: boolean;
}) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadMessages = useCallback(async () => {
        try {
            const data = await getMessages(roomId);
            setMessages(data);
            setPendingIds(new Set());
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        setIsLoading(true);
        setMessages([]);
        loadMessages();
    }, [roomId, loadMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Typing indicator logic
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Show typing state
        setIsTyping(true);
        
        // Hide typing after 2 seconds of no input
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        // Clear typing state
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        setIsTyping(false);

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
            setMessages(prev => prev.map(m => m.id === tempId ? { ...result, sender: optimisticMessage.sender, _sent: true } : m));
            setPendingIds(prev => { const s = new Set(prev); s.delete(tempId); return s; });
        } catch (err) {
            console.error(err);
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, _failed: true, _pending: false } : m));
            setPendingIds(prev => { const s = new Set(prev); s.delete(tempId); return s; });
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const formatMessageDate = (date: Date) => {
        if (isToday(date)) {
            return format(date, "HH:mm", { locale: vi });
        } else if (isYesterday(date)) {
            return `Hôm qua ${format(date, "HH:mm", { locale: vi })}`;
        }
        return format(date, "dd/MM HH:mm", { locale: vi });
    };

    const formatGroupHeader = (date: Date) => {
        if (isToday(date)) {
            return "Hôm nay";
        } else if (isYesterday(date)) {
            return "Hôm qua";
        }
        return format(date, "EEEE, dd/MM", { locale: vi });
    };

    // Group messages by date
    const groupedMessages: { date: Date; messages: any[] }[] = [];
    messages.forEach((msg, i) => {
        const msgDate = new Date(msg.createdAt);
        const dateKey = msgDate.toDateString();
        
        if (i === 0 || messages[i-1].createdAt.toDateString() !== dateKey) {
            groupedMessages.push({ date: msgDate, messages: [msg] });
        } else {
            groupedMessages[groupedMessages.length - 1].messages.push(msg);
        }
    });

    const displayName = roomInfo?.name || (otherUser ? `${otherUser.firstName} ${otherUser.lastName || ""}` : "Phòng Chat");
    const isGroupChat = roomInfo?.type === "mentorship_group" || roomInfo?.type === "program_group";
    const participantCount = roomInfo?.participants?.length || (otherUser ? 2 : 1);

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0 bg-background/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                            {otherUser?.avatar ? (
                                <AvatarImage src={otherUser.avatar} />
                            ) : (
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {displayName.charAt(0)}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        {isGroupChat ? (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                                <Users className="w-3 h-3 text-primary-foreground" />
                            </div>
                        ) : (
                            <span className={cn(
                                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                                isOnline ? "bg-green-500" : "bg-muted-foreground/40"
                            )} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-foreground">{displayName}</h3>
                        <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                            {isGroupChat ? (
                                <>{participantCount} thành viên</>
                            ) : isOnline ? (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Đang hoạt động
                                </>
                            ) : (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                                    Offline
                                </>
                            )}
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
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground">Đang tải tin nhắn...</p>
                        </div>
                    ) : (
                        <>
                            {groupedMessages.map((group, groupIndex) => (
                                <div key={groupIndex}>
                                    {/* Date Separator */}
                                    <div className="flex items-center gap-4 my-4">
                                        <div className="flex-1 h-px bg-border/40" />
                                        <span className="text-[10px] font-medium text-muted-foreground/60 bg-background px-2 py-0.5 rounded-full">
                                            {formatGroupHeader(group.date)}
                                        </span>
                                        <div className="flex-1 h-px bg-border/40" />
                                    </div>

                                    {/* Messages */}
                                    {group.messages.map((message, msgIndex) => {
                                        const isOwn = message.senderId === currentUser.id;
                                        const prevMessage = group.messages[msgIndex - 1];
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
                                                                <AvatarFallback className="text-[10px] bg-muted">
                                                                    {message.sender.firstName?.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        ) : <div className="w-7" />}
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "flex flex-col max-w-[80%] group",
                                                    isOwn ? "items-end" : "items-start"
                                                )}>
                                                    {!isOwn && showAvatar && (
                                                        <span className="text-[10px] text-muted-foreground/60 ml-1 mb-0.5 font-semibold no-uppercase">
                                                            {message.sender.firstName}
                                                        </span>
                                                    )}
                                                    <div className={cn(
                                                        "px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all duration-200",
                                                        isOwn 
                                                            ? "bg-primary text-primary-foreground rounded-br-sm" 
                                                            : "bg-muted/60 text-foreground rounded-bl-sm border border-border/30",
                                                        isPending && "opacity-70",
                                                        isFailed && "opacity-50 ring-1 ring-destructive/30"
                                                    )}>
                                                        {message.content}
                                                    </div>
                                                    {/* Time + Status */}
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 mt-0.5 px-1",
                                                        isOwn ? "flex-row-reverse" : "flex-row"
                                                    )}>
                                                        <span className="text-[9px] text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity font-medium no-uppercase">
                                                            {formatMessageDate(new Date(message.createdAt))}
                                                        </span>
                                                        {isOwn && (
                                                            <span className="text-muted-foreground/40">
                                                                {isPending ? (
                                                                    <Check className="w-3 h-3 text-muted-foreground/30" />
                                                                ) : isFailed ? (
                                                                    <span className="text-[9px] text-destructive font-bold">!</span>
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
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {otherUserTyping && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <Avatar className="h-7 w-7">
                                        {otherUser?.avatar && <AvatarImage src={otherUser.avatar} />}
                                        <AvatarFallback className="text-[10px] bg-muted">
                                            {otherUser?.firstName?.charAt(0) || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-3 py-2 border border-border/30">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div ref={scrollRef} className="h-1 w-full" />
                </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="px-3 py-3 bg-background border-t border-border/40 shrink-0">
                <form 
                    onSubmit={handleSend}
                    className="flex items-end gap-2 p-1.5 bg-muted/30 border border-border/30 rounded-2xl pr-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-card transition-all"
                >
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon-sm" 
                        className="h-9 w-9 text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer rounded-full shrink-0"
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
                            const files = e.target.files;
                            if (files && files.length > 0) {
                                console.log("Selected files:", files);
                            }
                        }}
                    />
                    <textarea
                        className="flex-1 bg-transparent border-none text-[13px] px-1 py-1.5 outline-none placeholder:text-muted-foreground/40 resize-none max-h-32"
                        placeholder="Nhập tin nhắn..."
                        value={input}
                        onChange={handleInputChange}
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        style={{ height: 'auto', overflow: 'hidden' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                        }}
                    />
                    <div className="flex gap-0.5 items-center shrink-0">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon-sm" 
                            className="h-9 w-9 text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer rounded-full"
                        >
                            <Smile className="w-4 h-4" />
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={!input.trim()}
                            size="icon"
                            className="h-9 w-9 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95 rounded-full"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
                {isTyping && (
                    <p className="text-[10px] text-muted-foreground/40 mt-1 px-2 animate-pulse">
                        Đang nhập...
                    </p>
                )}
            </div>
        </div>
    );
}

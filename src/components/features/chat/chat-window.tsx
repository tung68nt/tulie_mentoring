"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        setIsTyping(true);
        
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        setIsTyping(false);

        const content = input;
        const tempId = `pending-${Date.now()}`;
        setInput("");
        
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

    const groupedMessages: { date: Date; messages: any[] }[] = [];
    messages.forEach((msg, i) => {
        const msgDate = new Date(msg.createdAt);
        const dateKey = msgDate.toDateString();
        
        if (i === 0 || new Date(messages[i-1].createdAt).toDateString() !== dateKey) {
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        {otherUser?.avatar ? (
                            <AvatarImage src={otherUser.avatar} />
                        ) : (
                            <AvatarFallback className="text-xs font-medium">
                                {displayName.charAt(0)}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">{displayName}</h3>
                        <p className="text-xs text-muted-foreground">
                            {isGroupChat ? `${participantCount} thành viên` : "Nhắn tin"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Info className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 py-4">
                <div className="flex flex-col gap-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground">Đang tải tin nhắn...</p>
                        </div>
                    ) : (
                        <>
                            {groupedMessages.map((group, groupIndex) => (
                                <div key={groupIndex}>
                                    <div className="flex items-center gap-3 my-4">
                                        <div className="flex-1 h-px bg-border" />
                                        <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-0.5">
                                            {formatGroupHeader(group.date)}
                                        </span>
                                        <div className="flex-1 h-px bg-border" />
                                    </div>

                                    {group.messages.map((message) => {
                                        const isOwn = message.senderId === currentUser.id;
                                        const isPending = message._pending;
                                        const isFailed = message._failed;

                                        return (
                                            <div key={message.id} className={cn(
                                                "flex items-end gap-2 mb-3",
                                                isOwn ? "flex-row-reverse" : "flex-row"
                                            )}>
                                                <Avatar className="h-6 w-6 shrink-0">
                                                    {!isOwn && (
                                                        <>
                                                            <AvatarImage src={message.sender.avatar} />
                                                            <AvatarFallback className="text-[10px]">
                                                                {message.sender.firstName?.charAt(0)}
                                                            </AvatarFallback>
                                                        </>
                                                    )}
                                                </Avatar>
                                                <div className={cn(
                                                    "flex flex-col max-w-[75%]",
                                                    isOwn ? "items-end" : "items-start"
                                                )}>
                                                    <div className={cn(
                                                        "px-3 py-2 rounded-2xl text-sm",
                                                        isOwn 
                                                            ? "bg-foreground text-background rounded-br-sm" 
                                                            : "bg-muted rounded-bl-sm",
                                                        isPending && "opacity-70",
                                                        isFailed && "opacity-50"
                                                    )}>
                                                        {message.content}
                                                    </div>
                                                    {isOwn && (
                                                        <span className="text-[10px] text-muted-foreground mt-1">
                                                            {isPending ? (
                                                                <Check className="w-3 h-3 inline" />
                                                            ) : isFailed ? (
                                                                <span className="text-destructive font-bold">!</span>
                                                            ) : (
                                                                <CheckCheck className="w-3 h-3 inline" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}

                            {otherUserTyping && (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-[10px]">
                                            {otherUser?.firstName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="px-4 py-3 border-t border-border shrink-0 bg-muted/30">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon-sm" 
                        className="text-muted-foreground shrink-0"
                        onClick={handleAttachClick}
                    >
                        <Paperclip className="w-4 h-4" />
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                    />
                    <Input
                        className="flex-1 h-9 rounded-lg"
                        placeholder="Nhập tin nhắn..."
                        value={input}
                        onChange={handleInputChange}
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon-sm" 
                        className="text-muted-foreground shrink-0"
                    >
                        <Smile className="w-4 h-4" />
                    </Button>
                    <Button 
                        type="submit" 
                        size="icon-sm"
                        disabled={!input.trim()}
                        className="h-9 w-9 shrink-0 rounded-lg"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}

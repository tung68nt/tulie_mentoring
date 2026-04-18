"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Minimize2, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { getChatRooms, getMessages, sendMessage } from "@/lib/actions/chat";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface FloatingChatProps {
    currentUser: any;
}

export function FloatingChat({ currentUser }: FloatingChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !selectedRoomId) {
            loadRooms();
        }
    }, [isOpen, selectedRoomId]);

    useEffect(() => {
        if (selectedRoomId) {
            loadMessages();
            const interval = setInterval(loadMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedRoomId]);

    const loadRooms = async () => {
        try {
            const data = await getChatRooms();
            setRooms(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadMessages = useCallback(async () => {
        if (!selectedRoomId) return;
        try {
            const data = await getMessages(selectedRoomId, 30);
            setMessages(prev => {
                const pendingMsgs = prev.filter(m => m._pending);
                const serverIds = new Set(data.map((m: any) => m.id));
                const stillPending = pendingMsgs.filter(m => !serverIds.has(m.id));
                return [...data, ...stillPending];
            });
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (err) {
            console.error(err);
        }
    }, [selectedRoomId]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !selectedRoomId) return;

        const content = input;
        const tempId = `pending-${Date.now()}`;
        setInput("");

        const optimistic = {
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
        setMessages(prev => [...prev, optimistic]);

        try {
            const result = await sendMessage({ roomId: selectedRoomId, content });
            setMessages(prev => prev.map(m => m.id === tempId ? { ...result, sender: optimistic.sender, _sent: true } : m));
            setPendingIds(prev => { const s = new Set(prev); s.delete(tempId); return s; });
        } catch (err) {
            console.error(err);
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, _failed: true, _pending: false } : m));
            setPendingIds(prev => { const s = new Set(prev); s.delete(tempId); return s; });
        }
    };

    const getRoomName = (room: any) => {
        if (room.type === "direct") {
            const other = room.participants.find((p: any) => p.userId !== currentUser.id);
            return `${other?.user.firstName} ${other?.user.lastName || ""}`;
        }
        return room.name || "Phòng chat";
    };

    const getRoomAvatar = (room: any) => {
        if (room.type === "direct") {
            const other = room.participants.find((p: any) => p.userId !== currentUser.id);
            return other?.user.avatar;
        }
        return null;
    };

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3 pointer-events-none">
            {isOpen && (
                <Card className="w-[360px] h-[480px] flex flex-col border overflow-hidden pointer-events-auto">
                    {/* Header */}
                    <div className="px-4 py-3 border-b flex items-center justify-between shrink-0 bg-muted/50">
                        <div className="flex items-center gap-2 min-w-0">
                            {selectedRoomId ? (
                                <>
                                    <Button 
                                        variant="ghost" 
                                        size="icon-sm"
                                        onClick={() => setSelectedRoomId(null)}
                                        className="shrink-0"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                    <Avatar className="h-7 w-7 shrink-0">
                                        <AvatarImage src={getRoomAvatar(rooms.find(r => r.id === selectedRoomId))!} />
                                        <AvatarFallback className="text-xs">
                                            {getRoomName(rooms.find(r => r.id === selectedRoomId))[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-semibold truncate">
                                        {getRoomName(rooms.find(r => r.id === selectedRoomId))}
                                    </span>
                                </>
                            ) : (
                                <span className="text-sm font-semibold">Tin nhắn</span>
                            )}
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon-sm"
                            onClick={() => setIsOpen(false)}
                            className="shrink-0"
                        >
                            <Minimize2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {!selectedRoomId ? (
                            <ScrollArea className="h-full">
                                <div className="py-2">
                                    {rooms.length === 0 ? (
                                        <div className="text-center py-16 text-sm text-muted-foreground">
                                            Chưa có cuộc trò chuyện nào
                                        </div>
                                    ) : (
                                        rooms.map((room) => (
                                            <button
                                                key={room.id}
                                                onClick={() => setSelectedRoomId(room.id)}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                                            >
                                                <Avatar className="h-9 w-9 shrink-0">
                                                    <AvatarImage src={getRoomAvatar(room)!} />
                                                    <AvatarFallback className="text-xs">
                                                        {getRoomName(room)[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-medium truncate">{getRoomName(room)}</span>
                                                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                                            {room.messages[0] ? format(new Date(room.messages[0].createdAt), "HH:mm") : ""}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {room.messages[0]?.content || "Bắt đầu trò chuyện..."}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex flex-col h-full">
                                <ScrollArea className="flex-1 px-3 py-2">
                                    <div className="space-y-2">
                                        {messages.map((msg) => {
                                            const isOwn = msg.senderId === currentUser.id;
                                            const isPending = msg._pending;
                                            const isSent = msg._sent || (!isPending && isOwn);

                                            return (
                                                <div key={msg.id} className={cn(
                                                    "flex items-end gap-1.5",
                                                    isOwn ? "flex-row-reverse" : "flex-row"
                                                )}>
                                                    <Avatar className="h-5 w-5 shrink-0">
                                                        {!isOwn && (
                                                            <>
                                                                <AvatarImage src={msg.sender.avatar} />
                                                                <AvatarFallback className="text-[8px]">
                                                                    {msg.sender.firstName?.[0]}
                                                                </AvatarFallback>
                                                            </>
                                                        )}
                                                    </Avatar>
                                                    <div className={cn(
                                                        "flex flex-col max-w-[80%]",
                                                        isOwn ? "items-end" : "items-start"
                                                    )}>
                                                        <div className={cn( 
                                                            "rounded-2xl px-2.5 py-1.5 text-xs",
                                                            isOwn 
                                                                ? "bg-foreground text-background rounded-br-sm" 
                                                                : "bg-muted rounded-bl-sm",
                                                            isPending && "opacity-70"
                                                        )}>
                                                            {msg.content}
                                                        </div>
                                                        {isOwn && (
                                                            <span className="text-[9px] text-muted-foreground mt-0.5">
                                                                {isPending ? (
                                                                    <Check className="w-2.5 h-2.5 inline" />
                                                                ) : (
                                                                    <CheckCheck className="w-2.5 h-2.5 inline" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={scrollRef} />
                                    </div>
                                </ScrollArea>
                                <div className="p-3 border-t shrink-0 bg-muted/30">
                                    <form onSubmit={handleSend} className="flex items-center gap-2">
                                        <Input 
                                            className="flex-1 h-8 rounded-lg text-xs"
                                            placeholder="Nhập tin nhắn..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                        />
                                        <Button 
                                            type="submit" 
                                            size="icon-sm"
                                            disabled={!input.trim()}
                                            className="h-8 w-8 shrink-0 rounded-lg"
                                        >
                                            <Send className="w-3 h-3" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            <div className="pointer-events-auto">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="icon"
                    className={cn(
                        "w-12 h-12 rounded-full shadow-md transition-all",
                        isOpen 
                            ? "bg-muted text-foreground hover:bg-muted" 
                            : "bg-foreground text-background hover:bg-foreground/90"
                    )}
                >
                    {isOpen ? (
                        <X className="w-5 h-5" />
                    ) : (
                        <MessageCircle className="w-5 h-5" />
                    )}
                </Button>
            </div>
        </div>
    );
}

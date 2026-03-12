"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Maximize2, Send, Minimize2, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    const [isLoading, setIsLoading] = useState(false);
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch rooms when opened
    useEffect(() => {
        if (isOpen && !selectedRoomId) {
            loadRooms();
        }
    }, [isOpen, selectedRoomId]);

    // Fetch messages when room selected
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
            // Merge: keep pending messages, replace confirmed ones
            setMessages(prev => {
                const pendingMsgs = prev.filter(m => m._pending);
                // Deduplicate: only keep pending if not yet in server data
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

        // Optimistic UI
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
            // Replace optimistic with real
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
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end gap-3 sm:gap-4 pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <Card className="w-[calc(100vw-2rem)] sm:w-[360px] h-[calc(100dvh-8rem)] sm:h-[500px] max-h-[500px] shadow-2xl overflow-hidden flex flex-col border-border/40 animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto bg-card">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between bg-background/80 backdrop-blur-md shrink-0">
                        <div className="flex items-center gap-2">
                            {selectedRoomId ? (
                                <>
                                    <Button 
                                        variant="ghost" 
                                        size="icon-sm" 
                                        onClick={() => setSelectedRoomId(null)}
                                        className="h-7 w-7 rounded-full"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={getRoomAvatar(rooms.find(r => r.id === selectedRoomId))!} />
                                            <AvatarFallback>C</AvatarFallback>
                                        </Avatar>
                                        <span className="text-[13px] font-bold truncate max-w-[150px]">
                                            {getRoomName(rooms.find(r => r.id === selectedRoomId))}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <span className="text-[14px] font-bold ml-1">Tin nhắn</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <Button 
                                variant="ghost" 
                                size="icon-sm" 
                                className="h-7 w-7 rounded-full"
                                onClick={() => setIsOpen(false)}
                            >
                                <Minimize2 className="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon-sm" 
                                className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10"
                                onClick={() => { setIsOpen(false); setSelectedRoomId(null); }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {!selectedRoomId ? (
                            /* Rooms List */
                            <ScrollArea className="h-full px-1">
                                <div className="py-1 space-y-0.5">
                                    {rooms.length === 0 ? (
                                        <div className="text-center py-20 text-muted-foreground text-[12px]">
                                            Chưa có cuộc trò chuyện nào.
                                        </div>
                                    ) : (
                                        rooms.map((room) => (
                                            <button
                                                key={room.id}
                                                onClick={() => setSelectedRoomId(room.id)}
                                                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                                            >
                                                <div className="relative">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={getRoomAvatar(room)!} />
                                                        <AvatarFallback>{getRoomName(room)[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-background" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <span className="text-[12px] font-bold truncate text-foreground">{getRoomName(room)}</span>
                                                        <span className="text-[10px] text-muted-foreground/60">
                                                            {room.messages[0] ? format(new Date(room.messages[0].createdAt), "HH:mm") : ""}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground/60 truncate italic">
                                                        {room.messages[0]?.content || "Bắt đầu trò chuyện..."}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        ) : (
                            /* Messages Window */
                            <div className="flex flex-col h-full bg-background">
                                <ScrollArea className="flex-1 px-2 py-2">
                                    <div className="space-y-3 pb-1">
                                        {messages.map((msg, i) => {
                                            const isOwn = msg.senderId === currentUser.id;
                                            const isPending = msg._pending;
                                            const isSent = msg._sent || (!isPending && isOwn);

                                            return (
                                                <div key={msg.id} className={cn(
                                                    "flex items-end gap-1.5",
                                                    isOwn ? "flex-row-reverse" : "flex-row"
                                                )}>
                                                    {!isOwn && (
                                                        <Avatar className="h-5 w-5 shrink-0">
                                                            <AvatarImage src={msg.sender.avatar} />
                                                            <AvatarFallback className="text-[8px]">{msg.sender.firstName[0]}</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div className={cn(
                                                        "flex flex-col",
                                                        isOwn ? "items-end" : "items-start"
                                                    )}>
                                                        <div className={cn( 
                                                            "max-w-[85%] rounded-2xl px-2.5 py-1.5 text-[12px] shadow-sm",
                                                            isOwn ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none",
                                                            isPending && "opacity-70"
                                                        )}>
                                                            {msg.content}
                                                        </div>
                                                        {/* Status */}
                                                        {isOwn && (
                                                            <div className="flex items-center gap-0.5 mt-0.5 pr-0.5">
                                                                <span className="text-[8px] text-muted-foreground/40">
                                                                    {format(new Date(msg.createdAt), "HH:mm")}
                                                                </span>
                                                                {isPending ? (
                                                                    <Check className="w-2.5 h-2.5 text-muted-foreground/30" />
                                                                ) : (
                                                                    <CheckCheck className="w-2.5 h-2.5 text-primary/60" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={scrollRef} />
                                    </div>
                                </ScrollArea>
                                {/* Input */}
                                <div className="px-2 py-1.5 border-t border-border/40 shrink-0 bg-background">
                                    <form 
                                        onSubmit={handleSend}
                                        className="flex items-center gap-1.5"
                                    >
                                        <input 
                                            className="flex-1 bg-muted/50 border-none text-[12px] px-3 py-1.5 rounded-full outline-none placeholder:text-muted-foreground/60 focus:bg-background transition-all ring-inset focus:ring-1 ring-border"
                                            placeholder="Nhập tin nhắn..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                        />
                                        <Button 
                                            type="submit" 
                                            size="icon-sm" 
                                            disabled={!input.trim()}
                                            className="h-7 w-7 rounded-full bg-primary shrink-0"
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

            {/* Bubble */}
            <div className="pointer-events-auto">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 group relative",
                        isOpen ? "bg-background text-foreground border border-border shadow-xl rotate-90" : "bg-primary text-primary-foreground hover:scale-105"
                    )}
                    title="Trò chuyện"
                >
                    {isOpen ? (
                        <X className="w-6 h-6 animate-in fade-in zoom-in duration-300" />
                    ) : (
                        <MessageCircle className="w-6 h-6 animate-in fade-in zoom-in duration-300" />
                    )}
                </button>
            </div>
        </div>
    );
}

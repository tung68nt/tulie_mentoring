"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Hash, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { getChatRooms } from "@/lib/actions/chat";

export function ChatSidebar({ 
    currentUser, 
    selectedRoomId, 
    onSelectRoom 
}: { 
    currentUser: any; 
    selectedRoomId?: string;
    onSelectRoom: (roomId: string) => void;
}) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadRooms() {
            try {
                const data = await getChatRooms();
                setRooms(data);
            } catch (err) {
                console.error("Failed to load rooms", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadRooms();
    }, []);

    return (
        <div className="flex flex-col h-full bg-card border-r border-border/40 w-full sm:w-[320px]">
            <div className="p-4 border-b border-border/40 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-[14px] font-bold text-foreground">Tin nhắn</h2>
                    <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-semibold border-none rounded-full h-5">
                        {rooms.length} phòng
                    </Badge>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {isLoading ? (
                        <div className="p-4 space-y-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="flex gap-3 items-center animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-muted" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-muted rounded w-24" />
                                        <div className="h-2 bg-muted rounded w-16" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : rooms.length > 0 ? (
                        rooms.map((room) => {
                            const otherParticipant = room.participants.find((p: any) => p.userId !== currentUser.id);
                            const name = room.name || `${otherParticipant?.user.firstName} ${otherParticipant?.user.lastName}`;
                            const lastMessage = room.messages[0];
                            const isSelected = selectedRoomId === room.id;

                            return (
                                <button
                                    key={room.id}
                                    onClick={() => onSelectRoom(room.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group text-left",
                                        isSelected 
                                            ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-[0.98]"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border border-border/20 group-hover:scale-105 transition-transform duration-200">
                                            <AvatarImage src={otherParticipant?.user.avatar} />
                                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card ring-1 ring-black/5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "text-[13px] font-bold truncate transition-colors",
                                                isSelected ? "text-primary" : "text-foreground"
                                            )}>
                                                {name}
                                            </span>
                                            {lastMessage && (
                                                <span className="text-[10px] text-muted-foreground/60 shrink-0">
                                                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false, locale: vi })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] truncate mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                            {lastMessage ? lastMessage.content : "Bắt đầu cuộc trò chuyện..."}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center space-y-3 mt-10">
                            <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto" />
                            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                                Chưa có cuộc trò chuyện nào.<br/>Tìm Mentor để bắt đầu chat!
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

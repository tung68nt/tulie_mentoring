"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageSquare, Plus, Search, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getChatRooms, getOrCreateDirectChat } from "@/lib/actions/chat";
import { searchUsersForSharing } from "@/lib/actions/wiki";

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

    // New chat dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [userSearch, setUserSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

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

    // User search for new chat
    useEffect(() => {
        if (userSearch.length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchUsersForSharing(userSearch);
                setSearchResults(results);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearch]);

    async function handleStartChat(targetUserId: string) {
        setIsCreating(true);
        try {
            const room = await getOrCreateDirectChat(targetUserId);
            onSelectRoom(room.id);
            setDialogOpen(false);
            setUserSearch("");
            setSearchResults([]);
            // Reload rooms to include the new one
            const data = await getChatRooms();
            setRooms(data);
        } catch (err) {
            console.error("Failed to create chat", err);
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <div className="flex flex-col h-full bg-card border-r border-border/40 w-full sm:w-[320px]">
            <div className="p-4 border-b border-border/40 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-[14px] font-bold text-foreground">Tin nhắn</h2>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-semibold border-none rounded-full h-5">
                            {rooms.length} phòng
                        </Badge>

                        {/* New Chat Button */}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-primary/10 text-primary">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-2xl">
                                <DialogHeader>
                                    <DialogTitle>Cuộc trò chuyện mới</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        <Input
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            placeholder="Tìm theo tên hoặc email..."
                                            className="pl-9"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="max-h-64 overflow-y-auto space-y-1">
                                        {isSearching ? (
                                            <div className="py-6 text-center text-sm text-muted-foreground">
                                                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                                Đang tìm kiếm...
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => handleStartChat(user.id)}
                                                    disabled={isCreating}
                                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all text-left group"
                                                >
                                                    <Avatar className="h-9 w-9 border border-border/30">
                                                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground/60 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : userSearch.length >= 2 ? (
                                            <div className="py-6 text-center text-sm text-muted-foreground/60">
                                                Không tìm thấy kết quả
                                            </div>
                                        ) : (
                                            <div className="py-6 text-center text-sm text-muted-foreground/60">
                                                Nhập ít nhất 2 ký tự để tìm kiếm
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
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
                                Chưa có cuộc trò chuyện nào.<br/>Nhấn <strong>+</strong> để bắt đầu chat!
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

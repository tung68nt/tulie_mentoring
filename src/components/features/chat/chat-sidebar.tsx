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
    onSelectRoom: (roomId: string, roomData?: any) => void;
}) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
            const data = await getChatRooms();
            setRooms(data);
        } catch (err) {
            console.error("Failed to create chat", err);
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <div className="flex flex-col h-full bg-card border-r border-border w-full sm:w-[340px] shrink-0">
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Tin nhắn</h2>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-medium rounded-full h-5 px-2">
                            {rooms.length} phòng
                        </Badge>

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="icon-sm" variant="ghost" className="h-7 w-7 rounded-full hover:bg-primary/10 text-primary">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-xl">
                                <DialogHeader>
                                    <DialogTitle className="text-base font-semibold">Cuộc trò chuyện mới</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            placeholder="Tìm theo tên hoặc email..."
                                            className="pl-9 rounded-lg"
                                            autoFocus
                                        />
                                    </div>

                                    <ScrollArea className="h-[240px]">
                                        <div className="space-y-1 pr-3">
                                            {isSearching ? (
                                                <div className="py-8 text-center text-sm text-muted-foreground">
                                                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                                    Đang tìm kiếm...
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map((user) => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => handleStartChat(user.id)}
                                                        disabled={isCreating}
                                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                                                    >
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="text-xs font-medium bg-muted">
                                                                {user.firstName?.[0]}{user.lastName?.[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {user.firstName} {user.lastName}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : userSearch.length >= 2 ? (
                                                <div className="py-8 text-center text-sm text-muted-foreground">
                                                    Không tìm thấy kết quả
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center text-sm text-muted-foreground">
                                                    Nhập ít nhất 2 ký tự để tìm kiếm
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[1,2,3].map(i => (
                                <div key={i} className="flex gap-3 items-center">
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
                                    onClick={() => onSelectRoom(room.id, room)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                                        isSelected 
                                            ? "bg-primary/10 text-primary" 
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={otherParticipant?.user.avatar} />
                                            <AvatarFallback className="text-xs font-medium bg-muted">
                                                {name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "text-sm font-medium truncate",
                                                isSelected ? "text-primary" : "text-foreground"
                                            )}>
                                                {name}
                                            </span>
                                            {lastMessage && (
                                                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false, locale: vi })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                            {lastMessage ? lastMessage.content : "Bắt đầu trò chuyện..."}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center space-y-3">
                            <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Chưa có cuộc trò chuyện nào.
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

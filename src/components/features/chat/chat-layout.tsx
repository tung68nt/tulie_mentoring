"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatWindow } from "./chat-window";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchUsersForSharing } from "@/lib/actions/wiki";
import { getOrCreateDirectChat } from "@/lib/actions/chat";

export function ChatLayout({ currentUser }: { currentUser: any }) {
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [selectedRoomData, setSelectedRoomData] = useState<any>(null);

    const [quickSearch, setQuickSearch] = useState("");
    const [quickResults, setQuickResults] = useState<any[]>([]);
    const [isQuickSearching, setIsQuickSearching] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        if (quickSearch.length < 2) {
            setQuickResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsQuickSearching(true);
            try {
                const results = await searchUsersForSharing(quickSearch);
                setQuickResults(results);
            } catch {
                setQuickResults([]);
            } finally {
                setIsQuickSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [quickSearch]);

    async function handleQuickChat(targetUserId: string) {
        setIsStarting(true);
        try {
            const room = await getOrCreateDirectChat(targetUserId);
            setSelectedRoomId(room.id);
            setQuickSearch("");
            setQuickResults([]);
        } catch (err) {
            console.error("Failed to start chat", err);
        } finally {
            setIsStarting(false);
        }
    }

    function handleRoomSelect(roomId: string, roomData?: any) {
        setSelectedRoomId(roomId);
        setSelectedRoomData(roomData);
    }

    const otherUser = selectedRoomData?.participants?.find((p: any) => p.userId !== currentUser.id)?.user;

    return (
        <div className="flex h-full min-h-[500px] overflow-hidden bg-background">
            <div className="flex w-full h-full relative">
                <ChatSidebar 
                    currentUser={currentUser} 
                    selectedRoomId={selectedRoomId!} 
                    onSelectRoom={handleRoomSelect} 
                />

                <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
                    {selectedRoomId ? (
                        <ChatWindow 
                            key={selectedRoomId} 
                            currentUser={currentUser} 
                            roomId={selectedRoomId} 
                            roomInfo={{
                                name: selectedRoomData?.name,
                                type: selectedRoomData?.type,
                                participants: selectedRoomData?.participants?.map((p: any) => p.user)
                            }}
                            otherUser={otherUser}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <MessageCircle className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-2 max-w-sm text-center">
                                <h3 className="text-lg font-semibold">Bắt đầu trò chuyện</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Tìm Mentor hoặc Mentee để trao đổi bài học và kinh nghiệm thực tế.
                                </p>
                            </div>

                            <div className="w-full max-w-sm space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        value={quickSearch}
                                        onChange={(e) => setQuickSearch(e.target.value)}
                                        placeholder="Tìm người để chat..."
                                        className="pl-9 rounded-lg bg-muted/50"
                                    />
                                </div>

                                {(quickResults.length > 0 || isQuickSearching) && (
                                    <Card className="p-2 overflow-hidden">
                                        <ScrollArea className="h-[192px]">
                                            <div className="space-y-1 pr-3">
                                                {isQuickSearching ? (
                                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1.5" />
                                                        Đang tìm...
                                                    </div>
                                                ) : (
                                                    quickResults.map((user) => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => handleQuickChat(user.id)}
                                                            disabled={isStarting}
                                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                                                        >
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="text-xs font-medium bg-muted">
                                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">
                                                                    {user.firstName} {user.lastName}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

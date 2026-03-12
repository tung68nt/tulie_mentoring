"use client";

import { useState } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatWindow } from "./chat-window";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { searchUsersForSharing } from "@/lib/actions/wiki";
import { getOrCreateDirectChat, getChatRooms } from "@/lib/actions/chat";

export function ChatLayout({ currentUser }: { currentUser: any }) {
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    // Quick start chat state
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

    return (
        <Card className="flex h-full min-h-[500px] overflow-hidden rounded-xl border border-border/40 shadow-xl bg-card transition-all duration-300">
            <div className="flex w-full h-full relative">
                {/* Sidebar */}
                <ChatSidebar 
                    currentUser={currentUser} 
                    selectedRoomId={selectedRoomId!} 
                    onSelectRoom={setSelectedRoomId} 
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden group">
                    {selectedRoomId ? (
                        <ChatWindow 
                            key={selectedRoomId} 
                            currentUser={currentUser} 
                            roomId={selectedRoomId} 
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center animate-in fade-in duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-inner relative z-10 transition-transform group-hover:scale-110 duration-500">
                                    <MessageCircle className="w-10 h-10 text-primary" />
                                </div>
                            </div>
                            <div className="space-y-2 max-w-xs relative z-10">
                                <h3 className="text-lg font-bold text-foreground">Bắt đầu trò chuyện</h3>
                                <p className="text-[13px] text-muted-foreground/60 leading-relaxed">
                                    Tìm Mentor hoặc Mentee để trao đổi bài học và kinh nghiệm thực tế.
                                </p>
                            </div>

                            {/* Quick search inline */}
                            <div className="w-full max-w-sm relative z-10 space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    <Input
                                        value={quickSearch}
                                        onChange={(e) => setQuickSearch(e.target.value)}
                                        placeholder="Tìm người để chat..."
                                        className="pl-9 rounded-full border-border/40 bg-muted/30 focus:bg-background h-10"
                                    />
                                </div>

                                {(quickResults.length > 0 || isQuickSearching) && (
                                    <div className="border border-border/40 rounded-xl bg-card shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                                        {isQuickSearching ? (
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1.5" />
                                                Đang tìm...
                                            </div>
                                        ) : (
                                            quickResults.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => handleQuickChat(user.id)}
                                                    disabled={isStarting}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                                                >
                                                    <Avatar className="h-8 w-8 border border-border/30">
                                                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground/60 truncate">{user.email}</p>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

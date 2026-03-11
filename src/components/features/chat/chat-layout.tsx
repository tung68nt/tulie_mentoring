"use client";

import { useState } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatWindow } from "./chat-window";
import { Card } from "@/components/ui/card";
import { MessageSquare, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatLayout({ currentUser }: { currentUser: any }) {
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    return (
        <Card className="flex h-[calc(100vh-140px)] min-h-[500px] overflow-hidden rounded-xl border border-border/40 shadow-xl bg-card transition-all duration-300">
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
                                <h3 className="text-lg font-bold text-foreground">Chọn một cuộc trò chuyện</h3>
                                <p className="text-[13px] text-muted-foreground/60 leading-relaxed">
                                    Kết nối ngay với Mentor hoặc Mentee của bạn để trao đổi bài học và kinh nghiệm thực tế.
                                </p>
                            </div>
                            <button 
                                onClick={() => {}} // Could trigger new chat modal
                                className="px-6 h-10 bg-primary/5 border border-primary/20 text-primary rounded-full text-[13px] font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95"
                            >
                                Bắt đầu chat ngay
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

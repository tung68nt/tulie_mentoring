"use client";

import { Bell, Search, Menu, X, ChevronRight, HelpCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface HeaderProps {
    userName?: string;
    userRole?: string;
    avatar?: string | null;
    onMenuClick?: () => void;
}

export function Header({ userName, userRole, avatar, onMenuClick }: HeaderProps) {
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <header className="fixed top-0 right-0 left-0 bg-white/80 backdrop-blur-md border-b border-[#eaeaea] z-40 transition-all">
            <div className="h-14 px-4 flex items-center justify-between max-w-[1400px] mx-auto">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-[6px] hover:bg-[#fafafa] text-[#666] hover:text-black transition-all"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className={cn(
                        "relative hidden md:block transition-all duration-300",
                        isSearchFocused ? "w-[400px]" : "w-[240px]"
                    )}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhanh..."
                            className="w-full h-8 pl-10 pr-4 bg-[#fafafa] border border-[#eaeaea] rounded-[6px] text-[13px] text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all"
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-[6px] hover:bg-[#fafafa] text-[#666] hover:text-black transition-all relative group">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#0070f3] rounded-full border border-white" />
                    </button>

                    <button className="hidden sm:flex p-2 rounded-[6px] hover:bg-[#fafafa] text-[#666] hover:text-black transition-all">
                        <HelpCircle className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-[1px] bg-[#eaeaea] mx-1" />

                    <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-black leading-none mb-0.5">{userName || "Người dùng"}</p>
                            <p className="text-[10px] text-[#999] font-medium leading-none translate-y-0.5">{userRole || "Vai trò"}</p>
                        </div>
                        <Avatar
                            firstName={userName?.split(' ')[0] || "U"}
                            lastName={userName?.split(' ')[1] || ""}
                            src={avatar}
                            size="sm"
                            className="ring-2 ring-white ring-offset-2 ring-offset-[#eaeaea] group-hover:ring-black transition-all"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}

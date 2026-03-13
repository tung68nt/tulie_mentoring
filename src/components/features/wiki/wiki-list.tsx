"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import {
    BookOpen, Globe, Lock, Users, UserCheck,
    Search, FileText, Clock, Hash
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WikiListProps {
    myPages: any[];
    sharedPages: any[];
    communityPages: any[];
    role: string;
}

const visibilityConfig: Record<string, { label: string; icon: any; className: string }> = {
    private: { label: "Riêng tư", icon: Lock, className: "text-muted-foreground bg-muted" },
    mentorship: { label: "Nhóm", icon: Users, className: "text-blue-600 bg-blue-500/10" },
    public: { label: "Cộng đồng", icon: Globe, className: "text-emerald-600 bg-emerald-500/10" },
    selected: { label: "Chọn người", icon: UserCheck, className: "text-purple-600 bg-purple-500/10" },
};

const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "my", label: "Của tôi" },
    { id: "shared", label: "Được chia sẻ" },
    { id: "community", label: "Cộng đồng" },
];

/* ── Wiki Card ── */
function WikiCard({ page }: { page: any }) {
    const vis = visibilityConfig[page.visibility] || visibilityConfig.private;
    const VisIcon = vis.icon;

    return (
        <Link href={`/wiki/${page.slug}`} className="block group h-full">
            <div className="relative flex flex-col h-full rounded-xl border border-border/50 bg-card hover:border-foreground/20 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                {/* Cover Image — with fallback for broken images */}
                {page.coverImage ? (
                    <div className="h-36 overflow-hidden bg-muted flex-shrink-0">
                        <img
                            src={page.coverImage}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                // Hide broken image, show placeholder
                                const target = e.currentTarget;
                                target.style.display = "none";
                                target.parentElement!.classList.add("items-center", "justify-center");
                                const placeholder = document.createElement("div");
                                placeholder.className = "flex items-center justify-center w-full h-full";
                                placeholder.innerHTML = `<svg class="w-8 h-8 text-muted-foreground/20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"/></svg>`;
                                target.parentElement!.appendChild(placeholder);
                            }}
                        />
                    </div>
                ) : null}

                <div className="flex flex-col flex-1 p-4 space-y-3">
                    {/* Category + Visibility */}
                    <div className="flex items-center justify-between gap-2">
                        {page.category && (
                            <span className="text-[11px] font-medium text-muted-foreground">
                                {page.category}
                            </span>
                        )}
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md", vis.className)}>
                            <VisIcon className="w-3 h-3" />
                            {vis.label}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {page.title}
                    </h3>

                    {/* Spacer to push footer down */}
                    <div className="flex-1" />

                    {/* Author + Date */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                        <Avatar
                            firstName={page.author?.firstName || ""}
                            lastName={page.author?.lastName || ""}
                            src={page.author?.avatar}
                            size="xs"
                        />
                        <span className="text-[11px] text-muted-foreground truncate flex-1">
                            {page.author?.firstName} {page.author?.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50 shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(page.updatedAt)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* ── Category Group ── */
function CategoryGroup({ category, pages }: { category: string; pages: any[] }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Hash className="w-3.5 h-3.5 text-muted-foreground/40" />
                <h2 className="text-sm font-semibold text-foreground">{category}</h2>
                <span className="text-[11px] text-muted-foreground/40 font-medium">{pages.length}</span>
                <div className="flex-1 h-px bg-border/30 ml-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.map((page: any) => (
                    <WikiCard key={page.id} page={page} />
                ))}
            </div>
        </div>
    );
}

/* ── Main List Component ── */
export function WikiList({ myPages, sharedPages, communityPages, role }: WikiListProps) {
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const allPages = useMemo(() => [...myPages, ...sharedPages, ...communityPages], [myPages, sharedPages, communityPages]);

    const tabData: Record<string, { pages: any[]; empty: string }> = {
        all: { pages: allPages, empty: "Chưa có tài liệu nào trong hệ thống." },
        my: { pages: myPages, empty: "Bạn chưa tạo trang nào." },
        shared: { pages: sharedPages, empty: "Chưa có tài liệu nào được chia sẻ." },
        community: { pages: communityPages, empty: "Chưa có tài liệu công khai nào." },
    };

    const current = tabData[activeTab];

    // Filter
    const filteredPages = useMemo(() => {
        if (!searchQuery.trim()) return current.pages;
        const q = searchQuery.toLowerCase();
        return current.pages.filter((p: any) =>
            p.title.toLowerCase().includes(q) ||
            (p.category && p.category.toLowerCase().includes(q)) ||
            (p.author?.firstName && p.author.firstName.toLowerCase().includes(q))
        );
    }, [current.pages, searchQuery]);

    // Group by category
    const grouped = useMemo(() => {
        const groups: Record<string, any[]> = {};
        filteredPages.forEach((p: any) => {
            const cat = p.category || "Chung";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });
        return groups;
    }, [filteredPages]);

    return (
        <div className="space-y-6">
            {/* Controls bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Tabs - underline style */}
                <div className="flex items-center gap-0 border-b border-border/40">
                    {tabs.map((tab) => {
                        const count = tabData[tab.id].pages.length;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap",
                                    isActive
                                        ? "text-foreground"
                                        : "text-muted-foreground/50 hover:text-foreground"
                                )}
                            >
                                {tab.label}
                                {tab.id !== "all" && count > 0 && (
                                    <span className={cn(
                                        "ml-1.5 text-[10px]",
                                        isActive ? "text-primary font-bold" : "text-muted-foreground/30"
                                    )}>
                                        {count}
                                    </span>
                                )}
                                {isActive && (
                                    <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-foreground rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                    <Input
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-9 text-[12px] bg-muted/30 border-transparent focus:border-border/40 focus:bg-background shadow-none rounded-lg"
                    />
                </div>
            </div>

            {/* Content */}
            {filteredPages.length === 0 ? (
                <div className="py-20">
                    <EmptyState
                        icon={<FileText className="w-6 h-6" />}
                        title="Chưa có tài liệu"
                        description={searchQuery ? "Không tìm thấy kết quả phù hợp." : current.empty}
                    />
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([category, pages]) => (
                        <CategoryGroup key={category} category={category} pages={pages} />
                    ))}
                </div>
            )}
        </div>
    );
}

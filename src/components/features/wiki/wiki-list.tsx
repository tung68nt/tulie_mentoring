"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Globe, Lock, Users, UserCheck, Search, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface WikiListProps {
    myPages: any[];
    sharedPages: any[];
    communityPages: any[];
    role: string;
}

const visibilityConfig: Record<string, { label: string; icon: any; color: string }> = {
    private: { label: "Riêng tư", icon: Lock, color: "text-gray-400" },
    mentorship: { label: "Nhóm", icon: Users, color: "text-blue-400" },
    public: { label: "Cộng đồng", icon: Globe, color: "text-emerald-400" },
    selected: { label: "Chọn người", icon: UserCheck, color: "text-purple-400" },
};

const tabs = [
    { id: "my", label: "Của tôi", icon: BookOpen },
    { id: "shared", label: "Được chia sẻ", icon: Users },
    { id: "community", label: "Cộng đồng", icon: Globe },
];

function WikiCard({ page }: { page: any }) {
    const vis = visibilityConfig[page.visibility] || visibilityConfig.private;
    const VisIcon = vis.icon;

    return (
        <Link href={`/wiki/${page.slug}`} className="block group">
            <div className="p-4 rounded-xl border border-border/40 bg-card hover:border-primary/20 hover:bg-accent/30 transition-all duration-200">
                {page.coverImage && (
                    <div className="w-full h-28 rounded-lg mb-3 overflow-hidden bg-muted">
                        <img src={page.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1">
                            {page.title}
                        </h3>
                        <VisIcon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${vis.color}`} />
                    </div>

                    {page.category && (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                            {page.category}
                        </span>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                        <Avatar
                            firstName={page.author?.firstName || ""}
                            lastName={page.author?.lastName || ""}
                            src={page.author?.avatar}
                            size="xs"
                        />
                        <span className="text-[11px] font-medium text-muted-foreground truncate flex-1">
                            {page.author?.firstName} {page.author?.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50 font-medium shrink-0">
                            {formatDate(page.updatedAt)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function WikiList({ myPages, sharedPages, communityPages, role }: WikiListProps) {
    const [activeTab, setActiveTab] = useState("my");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const tabData = {
        my: { pages: myPages, empty: "Bạn chưa tạo trang nào. Nhấn \"Tạo trang mới\" để bắt đầu." },
        shared: { pages: sharedPages, empty: role === "mentee" ? "Mentor chưa chia sẻ tài liệu nào cho bạn." : "Chưa có tài liệu nào được chia sẻ." },
        community: { pages: communityPages, empty: "Chưa có tài liệu công khai nào." },
    };

    const current = tabData[activeTab as keyof typeof tabData];

    // Extract unique categories from current tab
    const categories = useMemo(() => {
        const cats = new Set<string>();
        current.pages.forEach((p: any) => {
            if (p.category) cats.add(p.category);
        });
        return Array.from(cats).sort();
    }, [current.pages]);

    // Filter pages
    const filteredPages = useMemo(() => {
        let filtered = current.pages;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter((p: any) =>
                p.title.toLowerCase().includes(q) ||
                (p.category && p.category.toLowerCase().includes(q)) ||
                (p.author?.firstName && p.author.firstName.toLowerCase().includes(q)) ||
                (p.author?.lastName && p.author.lastName.toLowerCase().includes(q))
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter((p: any) => p.category === selectedCategory);
        }

        return filtered;
    }, [current.pages, searchQuery, selectedCategory]);

    return (
        <div className="space-y-6">
            {/* Tab bar + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/40 border border-border/40 w-fit">
                    {tabs.map((tab) => {
                        const count = tabData[tab.id as keyof typeof tabData].pages.length;
                        const isActive = activeTab === tab.id;
                        const TabIcon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedCategory(null); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-bold transition-all ${
                                    isActive
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground/60 hover:text-foreground"
                                }`}
                            >
                                <TabIcon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                                {count > 0 && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                        isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/50"
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                    <Input
                        placeholder="Tìm kiếm tài liệu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-9 text-[12px] bg-background border-border/40 shadow-none rounded-lg"
                    />
                </div>
            </div>

            {/* Category filter pills */}
            {categories.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            !selectedCategory
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        Tất cả
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                                selectedCategory === cat
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Content Grid */}
            {filteredPages.length === 0 ? (
                <EmptyState
                    icon={<BookOpen className="w-5 h-5" />}
                    title="Chưa có trang nào"
                    description={searchQuery ? "Không tìm thấy kết quả phù hợp." : current.empty}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPages.map((page: any) => (
                        <WikiCard key={page.id} page={page} />
                    ))}
                </div>
            )}
        </div>
    );
}

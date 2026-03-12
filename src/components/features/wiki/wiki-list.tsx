"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Globe, Lock, Users, Eye, UserCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface WikiListProps {
    myPages: any[];
    sharedPages: any[];
    communityPages: any[];
    role: string;
}

const visibilityLabels: Record<string, { label: string; icon: any; color: string }> = {
    private: { label: "Riêng tư", icon: Lock, color: "text-gray-500" },
    mentorship: { label: "Nhóm Mentoring", icon: Users, color: "text-blue-500" },
    public: { label: "Cộng đồng", icon: Globe, color: "text-emerald-500" },
    selected: { label: "Chọn người", icon: UserCheck, color: "text-purple-500" },
};

const tabs = [
    { id: "my", label: "Của tôi", icon: BookOpen },
    { id: "shared", label: "Được chia sẻ", icon: Users },
    { id: "community", label: "Cộng đồng", icon: Globe },
];

function WikiCard({ page }: { page: any }) {
    const vis = visibilityLabels[page.visibility] || visibilityLabels.private;
    const VisIcon = vis.icon;

    return (
        <Link href={`/wiki/${page.slug}`} className="block group transition-transform active:scale-[0.98]">
            <Card className="p-5 h-full hover:border-primary/20 transition-all shadow-none border-border/60">
                {page.coverImage && (
                    <div className="w-full h-32 rounded-lg mb-4 overflow-hidden bg-muted">
                        <img src={page.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {page.title}
                        </h3>
                        <div className={`flex items-center gap-1 shrink-0 ${vis.color}`}>
                            <VisIcon className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    {page.category && (
                        <Badge status={page.category} size="sm" />
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <div className="flex items-center gap-2">
                            <Avatar
                                firstName={page.author?.firstName || ""}
                                lastName={page.author?.lastName || ""}
                                size="xs"
                            />
                            <span className="text-[11px] font-medium text-muted-foreground">
                                {page.author?.firstName} {page.author?.lastName}
                            </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 font-medium">
                            {formatDate(page.updatedAt)}
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

function PageGrid({ pages, emptyMessage }: { pages: any[]; emptyMessage: string }) {
    if (pages.length === 0) {
        return (
            <EmptyState
                icon={BookOpen}
                title="Chưa có trang nào"
                description={emptyMessage}
            />
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page) => (
                <WikiCard key={page.id} page={page} />
            ))}
        </div>
    );
}

export function WikiList({ myPages, sharedPages, communityPages, role }: WikiListProps) {
    const [activeTab, setActiveTab] = useState("my");

    const tabData = {
        my: { pages: myPages, empty: "Bạn chưa tạo trang wiki nào. Nhấn \"Tạo trang mới\" để bắt đầu." },
        shared: { pages: sharedPages, empty: role === "mentee" ? "Mentor và nhà trường chưa chia sẻ tài liệu nào cho bạn." : "Chưa có tài liệu nào được chia sẻ với bạn." },
        community: { pages: communityPages, empty: "Chưa có tài liệu công khai nào trong cộng đồng." },
    };

    const current = tabData[activeTab as keyof typeof tabData];

    return (
        <div className="space-y-6">
            {/* Tab bar */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/60 w-fit">
                {tabs.map((tab) => {
                    const count = tabData[tab.id as keyof typeof tabData].pages.length;
                    const isActive = activeTab === tab.id;
                    const TabIcon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                isActive
                                    ? "bg-background text-foreground shadow-sm border border-border/40"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <TabIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {count > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <PageGrid pages={current.pages} emptyMessage={current.empty} />
        </div>
    );
}

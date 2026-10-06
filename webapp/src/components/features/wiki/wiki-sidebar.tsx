"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronRight,
    FileText,
    Search,
    Plus,
    Hash,
    PanelLeftClose,
    PanelLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WikiSidebarProps {
    pages: any[];
}

export function WikiSidebar({ pages }: WikiSidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Group pages by category
    const categories = pages.reduce((acc: any, page: any) => {
        const cat = page.category || "Chung";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(page);
        return acc;
    }, {});

    const filteredPages = pages.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredCategories = Object.entries(categories).reduce((acc: any, [cat, catPages]: [string, any]) => {
        const matches = catPages.filter((p: any) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (matches.length > 0 || cat.toLowerCase().includes(searchQuery.toLowerCase())) {
            acc[cat] = matches;
        }
        return acc;
    }, {});

    if (isCollapsed) {
        return (
            <div className="w-12 flex-shrink-0 border-r border-border bg-muted/5 flex flex-col items-center py-4 gap-4 transition-all duration-300 overflow-hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted"
                    onClick={() => setIsCollapsed(false)}
                >
                    <PanelLeft className="w-4 h-4" />
                </Button>
                <div className="w-full px-2 space-y-2">
                    {pages.map(p => (
                        <Link
                            key={p.id}
                            href={`/wiki/${p.slug}`}
                            className={cn(
                                "flex items-center justify-center h-8 w-8 rounded-md transition-colors",
                                pathname.includes(p.slug) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <FileText className="w-4 h-4" />
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-64 flex-shrink-0 border-r border-border bg-muted/5 flex flex-col transition-all duration-300 h-full overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between border-b border-border/50">
                <h2 className="text-[13px] font-bold text-foreground/80 tracking-tight flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary/60" />
                    Wiki Sidebar
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsCollapsed(true)}
                >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                </Button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-border/30">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                    <Input
                        placeholder="Tìm kiếm tài liệu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 pr-2 text-[11px] bg-background/50 border-border/60 focus:bg-background shadow-none"
                    />
                </div>
            </div>

            {/* Pages List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-2 space-y-6">
                {Object.entries(filteredCategories).map(([category, catPages]: [string, any]) => (
                    <div key={category} className="space-y-1">
                        <div className="px-3 py-1 flex items-center gap-1.5 opacity-60">
                            <Hash className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{category}</span>
                        </div>
                        <div className="space-y-0.5">
                            {catPages.map((page: any) => (
                                <Link
                                    key={page.id}
                                    href={`/wiki/${page.slug}`}
                                    className={cn(
                                        "flex items-start gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-all group",
                                        pathname.includes(page.slug)
                                            ? "bg-primary/5 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <FileText className={cn(
                                        "w-3.5 h-3.5 mt-0.5 flex-shrink-0 transition-colors",
                                        pathname.includes(page.slug) ? "text-primary" : "text-muted-foreground/50 group-hover:text-foreground/70"
                                    )} />
                                    <span className="flex-1 leading-snug break-words whitespace-normal">
                                        {page.title}
                                    </span>
                                    {pathname.includes(page.slug) && (
                                        <div className="mt-1 w-1 h-3 bg-primary rounded-full flex-shrink-0" />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                {Object.keys(filteredCategories).length === 0 && (
                    <div className="px-4 py-8 text-center space-y-2">
                        <FileText className="w-8 h-8 text-muted-foreground/20 mx-auto" />
                        <p className="text-[10px] text-muted-foreground font-medium italic">Không tìm thấy kết quả.</p>
                    </div>
                )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-3 border-t border-border/50 bg-muted/10">
                <Link href="/wiki/new">
                    <Button variant="outline" className="w-full h-8 gap-2 text-[11px] font-bold shadow-none border-border/60 hover:bg-background">
                        <Plus className="w-3.5 h-3.5" />
                        Thêm trang mới
                    </Button>
                </Link>
            </div>
        </div>
    );
}

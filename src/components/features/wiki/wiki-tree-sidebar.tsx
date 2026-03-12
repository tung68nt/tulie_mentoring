"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronRight, ChevronDown, FileText,
    Search, Plus, PanelLeftClose, PanelLeft, FolderOpen, Folder
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface WikiTreeSidebarProps {
    pages: any[];
}

export function WikiTreeSidebar({ pages }: WikiTreeSidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [search, setSearch] = useState("");
    const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

    // Group by category
    const categories = pages.reduce((acc: Record<string, any[]>, page: any) => {
        const cat = page.category || "Chung";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(page);
        return acc;
    }, {});

    // Filter
    const filteredCategories = Object.entries(categories).reduce((acc: Record<string, any[]>, [cat, catPages]) => {
        if (!search.trim()) {
            acc[cat] = catPages as any[];
            return acc;
        }
        const q = search.toLowerCase();
        const matches = (catPages as any[]).filter((p: any) => p.title.toLowerCase().includes(q));
        if (matches.length > 0) acc[cat] = matches;
        return acc;
    }, {});

    const currentSlug = pathname.split("/wiki/")[1]?.split("/")[0] || "";

    const toggleCat = (cat: string) => {
        setExpandedCats(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    const isCatExpanded = (cat: string) => {
        if (search.trim()) return true;
        if (expandedCats.has(cat)) return true;
        return (categories[cat] as any[] || []).some((p: any) => p.slug === currentSlug);
    };

    if (collapsed) {
        return (
            <div className="w-12 flex-shrink-0 border-r border-border/40 bg-muted/5 flex flex-col items-center py-4 gap-2 transition-all duration-200">
                <button
                    className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
                    onClick={() => setCollapsed(false)}
                >
                    <PanelLeft className="w-4 h-4" />
                </button>
                <div className="w-6 h-px bg-border/30 my-1" />
                {pages.slice(0, 8).map(p => (
                    <Link
                        key={p.id}
                        href={`/wiki/${p.slug}`}
                        title={p.title}
                        className={cn(
                            "h-7 w-7 rounded-md flex items-center justify-center transition-colors",
                            pathname.includes(p.slug)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground/40 hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <FileText className="w-3.5 h-3.5" />
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <div className="w-60 flex-shrink-0 border-r border-border/40 bg-muted/5 flex flex-col transition-all duration-200 h-full overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between">
                <Link href="/wiki" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="text-[13px] font-bold text-foreground tracking-tight">Wiki</span>
                </Link>
                <button
                    className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
                    onClick={() => setCollapsed(true)}
                >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/30" />
                    <Input
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-7 pl-7 text-[11px] bg-muted/30 border-transparent focus:border-primary/20 focus:bg-background shadow-none rounded-md"
                    />
                </div>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4 space-y-0.5">
                {Object.entries(filteredCategories).map(([cat, catPages]) => {
                    const isExpanded = isCatExpanded(cat);
                    const FolderIcon = isExpanded ? FolderOpen : Folder;

                    return (
                        <div key={cat}>
                            <button
                                onClick={() => toggleCat(cat)}
                                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left hover:bg-muted/50 transition-colors group"
                            >
                                {isExpanded
                                    ? <ChevronDown className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                                    : <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                                }
                                <FolderIcon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                                <span className="text-[11px] font-semibold text-foreground/70 truncate flex-1">{cat}</span>
                                <span className="text-[10px] text-muted-foreground/30 font-medium">{(catPages as any[]).length}</span>
                            </button>

                            {isExpanded && (
                                <div className="ml-3 pl-2.5 border-l border-border/30 space-y-0.5 my-0.5">
                                    {(catPages as any[]).map((page: any) => {
                                        const isActive = pathname.includes(page.slug);
                                        return (
                                            <Link
                                                key={page.id}
                                                href={`/wiki/${page.slug}`}
                                                className={cn(
                                                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all group/item",
                                                    isActive
                                                        ? "bg-primary/8 text-primary font-semibold"
                                                        : "text-muted-foreground/70 hover:bg-muted/40 hover:text-foreground font-medium"
                                                )}
                                            >
                                                <FileText className={cn(
                                                    "w-3 h-3 shrink-0",
                                                    isActive ? "text-primary" : "text-muted-foreground/30 group-hover/item:text-muted-foreground/50"
                                                )} />
                                                <span className="truncate leading-snug">{page.title}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {Object.keys(filteredCategories).length === 0 && (
                    <div className="px-3 py-6 text-center">
                        <p className="text-[10px] text-muted-foreground/40 italic">Không tìm thấy.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2.5 border-t border-border/30">
                <Link
                    href="/wiki/new"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium text-muted-foreground/50 hover:text-primary hover:bg-primary/5 transition-colors"
                >
                    <Plus className="w-3 h-3" />
                    Thêm trang mới
                </Link>
            </div>
        </div>
    );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import {
    BookOpen, Globe, Lock, Users, UserCheck,
    Search, FileText, Clock, Hash, FolderOpen
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WikiLandingProps {
    structure: any[];
    role: string;
}

/* ── Wiki Card ── */
function WikiCard({ wiki, categoryName }: { wiki: any; categoryName: string }) {
    return (
        <Link href={`/wiki/${wiki.slug}`} className="block group h-full">
            <div className="relative flex flex-col h-full rounded-lg border border-border/50 bg-card hover:border-foreground/20 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                {/* Cover */}
                {wiki.coverImage && (
                    <div className="h-32 overflow-hidden bg-muted flex-shrink-0">
                        <img
                            src={wiki.coverImage}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                )}

                <div className="flex flex-col flex-1 p-4 space-y-3">
                    {/* Category badge */}
                    <span className="text-xs text-muted-foreground font-medium">
                        {categoryName}
                    </span>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {wiki.title}
                    </h3>

                    {/* Description */}
                    {wiki.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{wiki.description}</p>
                    )}

                    <div className="flex-1" />

                    {/* Footer */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground">
                            {wiki.pages.length} trang
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* ── Category Group ── */
function CategoryGroup({ category }: { category: any }) {
    if (category.wikis.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <FolderOpen className="w-4 h-4 text-muted-foreground/40" />
                <h2 className="text-lg font-semibold text-foreground">{category.name}</h2>
                <span className="text-xs text-muted-foreground/40 font-medium">{category.wikis.length}</span>
                <div className="flex-1 h-px bg-border/30 ml-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.wikis.map((wiki: any) => (
                    <WikiCard key={wiki.id} wiki={wiki} categoryName={category.name} />
                ))}
            </div>
        </div>
    );
}

/* ── Main Landing Component ── */
export function WikiLanding({ structure, role }: WikiLandingProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter
    const filteredStructure = useMemo(() => {
        if (!searchQuery.trim()) return structure;
        const q = searchQuery.toLowerCase();
        return structure.map((cat: any) => ({
            ...cat,
            wikis: cat.wikis.filter((w: any) =>
                w.title.toLowerCase().includes(q) ||
                (w.description && w.description.toLowerCase().includes(q)) ||
                cat.name.toLowerCase().includes(q)
            ),
        })).filter((cat: any) => cat.wikis.length > 0);
    }, [structure, searchQuery]);

    const hasContent = filteredStructure.some((cat: any) => cat.wikis.length > 0);

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center justify-end">
                <div className="relative w-full sm:w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                    <Input
                        placeholder="Tìm kiếm wiki..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-9 text-sm bg-muted/30 border-transparent focus:border-border/40 focus:bg-background shadow-none rounded-lg"
                    />
                </div>
            </div>

            {/* Content */}
            {!hasContent ? (
                <div className="py-20">
                    <EmptyState
                        icon={<BookOpen className="w-6 h-6" />}
                        title="Chưa có Wiki nào"
                        description={searchQuery ? "Không tìm thấy kết quả phù hợp." : "Tạo chuyên mục và wiki từ sidebar bên trái để bắt đầu."}
                    />
                </div>
            ) : (
                <div className="space-y-8">
                    {filteredStructure.map((category: any) => (
                        <CategoryGroup key={category.id} category={category} />
                    ))}
                </div>
            )}
        </div>
    );
}

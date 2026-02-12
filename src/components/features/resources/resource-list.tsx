"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Link as LinkIcon,
    Download,
    ExternalLink,
    Search,
    File,
    MoreVertical,
    FolderOpen,
    X
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Resource {
    id: string;
    title: string;
    description: string | null;
    type: string;
    linkUrl: string | null;
    fileUrl: string | null;
    category: string;
    visibility: string;
    createdAt: Date;
    uploadedBy: { firstName: string; lastName: string };
}

interface ResourceListProps {
    resources: Resource[];
    categories: string[];
}

export function ResourceList({ resources, categories }: ResourceListProps) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filtered = useMemo(() => {
        let result = resources;
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                r => r.title.toLowerCase().includes(q) ||
                    (r.description && r.description.toLowerCase().includes(q)) ||
                    r.category.toLowerCase().includes(q)
            );
        }
        if (activeCategory) {
            result = result.filter(r => r.category === activeCategory);
        }
        return result;
    }, [resources, search, activeCategory]);

    const getIcon = (type: string) => {
        switch (type) {
            case "link": return <LinkIcon className="w-5 h-5 text-[#666]" />;
            case "document": return <FileText className="w-5 h-5 text-[#666]" />;
            default: return <File className="w-5 h-5 text-[#666]" />;
        }
    };

    const getCategoryCount = (cat: string) => resources.filter(r => r.category === cat).length;

    return (
        <>
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm tài liệu theo tên, từ khóa..."
                    className="w-full pl-10 pr-10 h-10 rounded-[8px] border border-[#eaeaea] bg-white text-sm text-black placeholder:text-[#999] focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all hover:border-[#999]"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-black transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Categories */}
                <div className="space-y-6">
                    <Card className="p-4">
                        <h3 className="text-[11px] font-semibold text-[#999] mb-4 px-2">Danh mục</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-[6px] text-sm font-medium flex items-center justify-between transition-colors",
                                    !activeCategory ? "bg-black text-white" : "text-[#666] hover:bg-[#fafafa]"
                                )}
                            >
                                Tất cả tài liệu
                                <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-[4px]",
                                    !activeCategory ? "bg-white/20" : "bg-[#eaeaea] text-[#666]"
                                )}>
                                    {resources.length}
                                </span>
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-[6px] text-sm font-medium flex items-center justify-between transition-colors",
                                        activeCategory === cat ? "bg-black text-white" : "text-[#666] hover:bg-[#fafafa]"
                                    )}
                                >
                                    {cat}
                                    {getCategoryCount(cat) > 0 && (
                                        <span className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded-[4px]",
                                            activeCategory === cat ? "bg-white/20" : "bg-[#eaeaea] text-[#666]"
                                        )}>
                                            {getCategoryCount(cat)}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-black text-white p-6 border-none overflow-hidden relative">
                        <div className="relative z-10">
                            <h4 className="text-sm font-semibold mb-2">Bạn có tài liệu hay?</h4>
                            <p className="text-xs text-white/60 leading-relaxed mb-4">Chia sẻ kiến thức của bạn với cộng đồng Mentoring ngay hôm nay.</p>
                            <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10" asChild>
                                <Link href="/resources/new">Chia sẻ ngay</Link>
                            </Button>
                        </div>
                        <FolderOpen className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 rotate-12" />
                    </Card>
                </div>

                {/* Resource Grid */}
                <div className="lg:col-span-3">
                    {filtered.length === 0 ? (
                        <Card className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-[#fafafa] rounded-full flex items-center justify-center text-[#999] mb-6 border border-[#eaeaea]">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-black">
                                {search || activeCategory ? "Không tìm thấy tài liệu" : "Chưa có tài liệu nào"}
                            </h3>
                            <p className="text-sm text-[#666] max-w-xs mt-1">
                                {search || activeCategory
                                    ? "Hãy thử thay đổi từ khóa hoặc bộ lọc khác."
                                    : "Hãy là người đầu tiên đóng góp tài liệu cho thư viện."}
                            </p>
                            {(search || activeCategory) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => { setSearch(""); setActiveCategory(null); }}
                                >
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-[11px] text-[#999] font-medium px-1">
                                {filtered.length} tài liệu{activeCategory ? ` trong "${activeCategory}"` : ""}
                                {search ? ` khớp "${search}"` : ""}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filtered.map(res => (
                                    <Card key={res.id} hover className="p-5 flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-[8px] flex items-center justify-center shrink-0 bg-[#fafafa] border border-[#eaeaea]">
                                            {getIcon(res.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between">
                                                <h4 className="text-sm font-semibold text-black truncate pr-2">{res.title}</h4>
                                            </div>
                                            <p className="text-xs text-[#666] line-clamp-1">{res.description || "Không có mô tả."}</p>
                                            <div className="flex items-center gap-3 pt-2">
                                                <span className="text-[10px] font-medium text-[#999]">{res.category}</span>
                                                <span className="w-1 h-1 bg-[#eaeaea] rounded-full" />
                                                <span className="text-[10px] text-[#999]">{formatDate(res.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 pt-3">
                                                {res.type === "link" ? (
                                                    <Button variant="outline" size="sm" className="h-7 text-[11px] font-medium px-3" asChild>
                                                        <a href={res.linkUrl!} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="w-3 h-3 mr-1.5" />
                                                            Truy cập
                                                        </a>
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" size="sm" className="h-7 text-[11px] font-medium px-3">
                                                        <Download className="w-3 h-3 mr-1.5" />
                                                        Tải xuống
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { blocksToText } from "@/components/ui/block-editor";
import { Book, Clock, ChevronRight, Hash } from "lucide-react";
import Link from "next/link";

interface WikiListProps {
    pages: any[];
}

export function WikiList({ pages }: WikiListProps) {
    if (pages.length === 0) {
        return (
            <div className="p-16 text-center bg-muted/20 rounded-3xl border border-dashed border-border mt-8">
                <Book className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground font-medium no-uppercase">Chưa có tài liệu nào trong mục này.</p>
            </div>
        );
    }

    // Group pages by category
    const categories = pages.reduce((acc: any, page: any) => {
        const cat = page.category || "Chung";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(page);
        return acc;
    }, {});

    return (
        <div className="space-y-10 mt-8">
            {Object.entries(categories).map(([category, catPages]: [string, any]) => (
                <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Hash className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-bold no-uppercase tracking-tight">{category}</h2>
                        <span className="text-xs font-medium text-muted-foreground/40 ml-1">({catPages.length})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {catPages.map((page: any) => (
                            <Link key={page.id} href={`/wiki/${page.slug}`} className="group h-full">
                                <Card padding="none" className="h-full flex flex-col border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-3xl overflow-hidden group-hover:translate-y-[-2px]">
                                    <div className="p-6 flex-1 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors no-uppercase">{page.title}</h3>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/30 mt-1 group-hover:text-primary/60 group-hover:translate-x-1 transition-all" />
                                        </div>

                                        <p className="text-[13px] text-muted-foreground/60 line-clamp-3 leading-relaxed no-uppercase">
                                            {page.content ? blocksToText(page.content) : "Không có nội dung mô tả."}
                                        </p>
                                    </div>

                                    <div className="px-6 py-4 bg-muted/20 border-t border-border/40 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50 font-bold no-uppercase">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{new Date(page.updatedAt).toLocaleDateString("vi-VN")}</span>
                                        </div>
                                        {page.visibility !== 'public' && (
                                            <Badge variant="outline" size="sm" className="bg-background text-[9px] uppercase tracking-tighter">
                                                {page.visibility === 'mentor_only' ? 'Mentor' : 'Mentee'}
                                            </Badge>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

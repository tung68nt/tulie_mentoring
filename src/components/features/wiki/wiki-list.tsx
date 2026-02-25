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
            <div className="p-12 text-center bg-muted/20 rounded-lg border border-dashed border-border mt-6">
                <Book className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">Chưa có tài liệu nào trong mục này.</p>
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
        <div className="space-y-8 mt-6">
            {Object.entries(categories).map(([category, catPages]: [string, any]) => (
                <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary/60">
                            <Hash className="w-3.5 h-3.5" />
                        </div>
                        <h2 className="text-base font-semibold text-foreground tracking-tight">{category}</h2>
                        <span className="text-xs text-muted-foreground ml-1">({catPages.length})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {catPages.map((page: any) => (
                            <Link key={page.id} href={`/wiki/${page.slug}`} className="group h-full">
                                <Card padding="none" className="h-full flex flex-col border-border/60 hover:border-primary/40 transition-all rounded-lg overflow-hidden bg-card">
                                    <div className="p-5 flex-1 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-semibold text-[15px] text-foreground leading-snug group-hover:text-primary transition-colors">{page.title}</h3>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/30 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                                        </div>

                                        <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed opacity-80">
                                            {page.content ? blocksToText(page.content) : "Không có nội dung mô tả."}
                                        </p>
                                    </div>

                                    <div className="px-5 py-3 bg-muted/10 border-t border-border/40 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                            <Clock className="w-3 h-3 opacity-60" />
                                            <span>{new Date(page.updatedAt).toLocaleDateString("vi-VN")}</span>
                                        </div>
                                        {page.visibility !== 'public' && (
                                            <Badge variant="outline" className="text-[9px] font-semibold py-0 h-4.5 rounded-md border-border/60">
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

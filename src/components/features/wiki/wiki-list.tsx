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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {catPages.map((page: any) => {
                            const defaultCover = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070";

                            return (
                                <Link key={page.id} href={`/wiki/${page.slug}`} className="group h-full flex flex-col">
                                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl border border-border/40">
                                        <img
                                            src={page.coverImage || defaultCover}
                                            alt={page.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <Card padding="none" className="h-full flex flex-col border-border/40 hover:border-primary/40 rounded-t-none rounded-b-xl transition-all shadow-none bg-card flex-1">
                                        <div className="p-5 space-y-2">
                                            <h3 className="font-bold text-[14px] text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">{page.title}</h3>
                                            <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed opacity-80">
                                                {page.content ? blocksToText(page.content).substring(0, 100) : "Bắt đầu khám phá tài liệu này..."}
                                            </p>
                                        </div>

                                        <div className="px-5 py-3 border-t border-border/40 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                                                <Clock className="w-3.5 h-3.5 opacity-60" />
                                                <span>{new Date(page.updatedAt).toLocaleDateString("vi-VN")}</span>
                                            </div>
                                            {page.visibility !== 'public' && (
                                                <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0 h-4 rounded-md shadow-none border-none">
                                                    {page.visibility === 'mentor_only' ? 'Mentor' : 'Mentee'}
                                                </Badge>
                                            )}
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

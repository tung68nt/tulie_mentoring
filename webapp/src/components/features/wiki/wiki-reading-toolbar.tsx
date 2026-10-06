"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Printer, Bookmark, Share2 } from "lucide-react";

interface WikiReadingToolbarProps {
    title: string;
    readingMinutes: number;
}

export function WikiReadingToolbar({ title, readingMinutes }: WikiReadingToolbarProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    return (
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60 backdrop-blur-md">
            <span className="text-[11px] font-medium text-muted-foreground px-2 py-0.5">
                ⏱ {readingMinutes} phút đọc
            </span>
            <div className="w-px h-3.5 bg-border" />
            <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs px-2.5 rounded-lg text-muted-foreground hover:text-foreground"
                title="Sao chép liên kết"
            >
                {copied ? (
                    <>
                        <Check className="w-3 h-3 text-emerald-500 mr-1" />
                        <span className="text-emerald-500 text-[11px]">Đã chép</span>
                    </>
                ) : (
                    <>
                        <Share2 className="w-3 h-3 mr-1" />
                        <span className="text-[11px]">Chia sẻ</span>
                    </>
                )}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                className="h-7 text-xs px-2.5 rounded-lg text-muted-foreground hover:text-foreground"
                title="In hoặc Lưu PDF"
            >
                <Printer className="w-3 h-3 mr-1" />
                <span className="text-[11px]">In / PDF</span>
            </Button>
        </div>
    );
}

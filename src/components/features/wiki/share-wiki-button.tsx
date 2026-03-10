"use client";

import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareWikiButtonProps {
    slug: string;
}

export function ShareWikiButton({ slug }: ShareWikiButtonProps) {
    const [copied, setCopied] = useState(false);

    const onShare = async () => {
        try {
            // Check if origin is available (it always is in modern browsers except some SSG edge cases)
            const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
            const url = `${origin}/share/wiki/${slug}`;

            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Đã sao chép liên kết chia sẻ");

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            toast.error("Không thể sao chép liên kết");
        }
    };

    return (
        <Button
            variant="outline"
            className="rounded-xl gap-2 shadow-sm transition-all"
            size="sm"
            onClick={onShare}
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4 text-green-600" />
                    Đã sao chép
                </>
            ) : (
                <>
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                </>
            )}
        </Button>
    );
}

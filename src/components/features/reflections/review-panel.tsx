"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileChips, type FileInfo } from "@/components/features/files/file-chips";
import { reviewReflection } from "@/lib/actions/reflection";

/** Phần đính kèm + nhận xét của mentor cho một bài thu hoạch đã nộp. */
export function ReflectionReviewPanel({ reflection }: {
    reflection: { id: string; linkUrl?: string | null; files?: FileInfo[]; mentorFeedback?: string | null; mentorConfirmed: boolean };
}) {
    const router = useRouter();
    const [feedback, setFeedback] = useState(reflection.mentorFeedback ?? "");
    const [busy, setBusy] = useState(false);

    async function submit() {
        setBusy(true);
        try {
            await reviewReflection(reflection.id, feedback, true);
            toast.success("Đã gửi nhận xét");
            router.refresh();
        } catch (e: any) {
            toast.error(e?.message || "Không gửi được nhận xét");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-5 border-t border-border pt-6 mt-8">
            {(reflection.files?.length || reflection.linkUrl) ? (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Tệp và liên kết đính kèm</h3>
                    <FileChips files={reflection.files ?? []} />
                    {reflection.linkUrl && (
                        <a href={reflection.linkUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-sm text-foreground underline underline-offset-4 break-all">
                            <ExternalLink className="w-4 h-4 shrink-0" />{reflection.linkUrl}
                        </a>
                    )}
                </div>
            ) : null}

            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Nhận xét của mentor</h3>
                <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} maxLength={5000} rows={4} placeholder="Góp ý, điểm tốt, việc cần cải thiện..." />
                <Button onClick={submit} disabled={busy}>
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {reflection.mentorConfirmed ? "Cập nhật nhận xét" : "Gửi nhận xét và xác nhận"}
                </Button>
            </div>
        </div>
    );
}

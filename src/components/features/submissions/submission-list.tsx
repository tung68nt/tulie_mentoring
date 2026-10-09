"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileChips, type FileInfo } from "@/components/features/files/file-chips";
import { deleteSubmission, reviewSubmission } from "@/lib/actions/submission";
import { formatDate } from "@/lib/utils";

type Item = {
    id: string; kind: string; title: string; note: string | null; linkUrl: string | null; status: string;
    feedback: string | null; createdAt: string; menteeId: string;
    mentee: { firstName: string | null; lastName: string | null };
    files: FileInfo[];
};

const KIND_LABEL: Record<string, string> = { assignment: "Bài tập", practice: "Thực hành", other: "Khác" };
const STATUS: Record<string, { label: string; variant: "secondary" | "success" | "warning" }> = {
    submitted: { label: "Chờ nhận xét", variant: "secondary" },
    reviewed: { label: "Đã nhận xét", variant: "success" },
    needs_revision: { label: "Cần chỉnh sửa", variant: "warning" },
};

export function SubmissionList({ items, mode }: { items: Item[]; mode: "mentee" | "reviewer" | "viewer" }) {
    if (items.length === 0) {
        return <Card className="p-8 text-center text-sm text-muted-foreground">Chưa có bài nộp nào.</Card>;
    }
    return (
        <div className="space-y-3">
            {items.map((it) => <SubmissionCard key={it.id} item={it} mode={mode} />)}
        </div>
    );
}

function SubmissionCard({ item, mode }: { item: Item; mode: "mentee" | "reviewer" | "viewer" }) {
    const router = useRouter();
    const [feedback, setFeedback] = useState(item.feedback ?? "");
    const [busy, setBusy] = useState(false);
    const st = STATUS[item.status] ?? STATUS.submitted;

    async function review(status: "reviewed" | "needs_revision") {
        setBusy(true);
        const res = await reviewSubmission({ id: item.id, status, feedback });
        setBusy(false);
        if ("error" in res && res.error) return toast.error(res.error);
        toast.success("Đã lưu nhận xét");
        router.refresh();
    }

    async function remove() {
        setBusy(true);
        const res = await deleteSubmission(item.id);
        setBusy(false);
        if ("error" in res && res.error) return toast.error(res.error);
        router.refresh();
    }

    return (
        <Card className="p-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{KIND_LABEL[item.kind] ?? item.kind}</Badge>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {mode !== "mentee" && <>{item.mentee.firstName} {item.mentee.lastName} · </>}
                        {formatDate(item.createdAt, "HH:mm dd/MM/yyyy")}
                    </p>
                </div>
                <Badge variant={st.variant}>{st.label}</Badge>
            </div>

            {item.note && <p className="whitespace-pre-wrap text-sm text-foreground/90">{item.note}</p>}
            <FileChips files={item.files} />
            {item.linkUrl && (
                <a href={item.linkUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-sm text-foreground underline underline-offset-4 break-all">
                    <ExternalLink className="w-4 h-4 shrink-0" />{item.linkUrl}
                </a>
            )}

            {mode !== "reviewer" && item.feedback && (
                <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                    <p className="text-sm font-semibold text-foreground">Nhận xét của mentor</p>
                    <p className="whitespace-pre-wrap text-sm text-foreground/90">{item.feedback}</p>
                </div>
            )}

            {mode === "reviewer" && (
                <div className="space-y-2 border-t border-border pt-3">
                    <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} maxLength={5000} rows={3} placeholder="Nhận xét cho mentee..." />
                    <div className="flex gap-2">
                        <Button size="sm" disabled={busy} onClick={() => review("reviewed")}>
                            {busy && <Loader2 className="w-4 h-4 animate-spin" />}Đạt, đã nhận xét
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => review("needs_revision")}>Yêu cầu chỉnh sửa</Button>
                    </div>
                </div>
            )}

            {mode === "mentee" && item.status !== "reviewed" && (
                <Button size="sm" variant="ghost" disabled={busy} onClick={remove}><Trash2 className="w-4 h-4" />Xoá</Button>
            )}
        </Card>
    );
}

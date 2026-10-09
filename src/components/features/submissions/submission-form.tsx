"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AttachmentPicker, type PickedFile } from "@/components/features/files/attachment-picker";
import { createSubmission } from "@/lib/actions/submission";

const KINDS = [
    { value: "assignment", label: "Bài tập" },
    { value: "practice", label: "Thực hành" },
    { value: "other", label: "Khác" },
] as const;

export function SubmissionForm() {
    const router = useRouter();
    const [kind, setKind] = useState<(typeof KINDS)[number]["value"]>("assignment");
    const [title, setTitle] = useState("");
    const [note, setNote] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [files, setFiles] = useState<PickedFile[]>([]);
    const [busy, setBusy] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        const res = await createSubmission({ kind, title, note, linkUrl, fileIds: files.map((f) => f.fileId) });
        setBusy(false);
        if ("error" in res && res.error) return toast.error(res.error);
        toast.success("Đã nộp bài");
        setTitle(""); setNote(""); setLinkUrl(""); setFiles([]);
        router.refresh();
    }

    return (
        <Card className="p-5">
            <form onSubmit={submit} className="space-y-4">
                <h2 className="font-semibold text-foreground">Nộp bài mới</h2>
                <div className="flex gap-2">
                    {KINDS.map((k) => (
                        <Button key={k.value} type="button" size="sm" variant={kind === k.value ? "default" : "outline"} onClick={() => setKind(k.value)}>
                            {k.label}
                        </Button>
                    ))}
                </div>
                <Input label="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={5000} rows={3} placeholder="Ghi chú cho mentor (tuỳ chọn)" />
                <Input label="Liên kết (Drive, GitHub, Figma...)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} maxLength={500} inputMode="url" placeholder="https://..." />
                <AttachmentPicker purpose="submission" value={files} onChange={setFiles} />
                <Button type="submit" disabled={busy || !title.trim()}>
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Nộp bài
                </Button>
            </form>
        </Card>
    );
}

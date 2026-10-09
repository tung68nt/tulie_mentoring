"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Loader2 } from "lucide-react";
import { getFileDownloadUrl } from "@/lib/actions/files";

export type FileInfo = { id: string; fileName: string; size: number };

export function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Danh sách tệp, bấm để tải (link ký 5 phút do server cấp sau khi kiểm tra quyền). */
export function FileChips({ files }: { files: FileInfo[] }) {
    const [busy, setBusy] = useState<string | null>(null);
    if (!files?.length) return null;

    async function open(id: string) {
        setBusy(id);
        const res = await getFileDownloadUrl(id);
        setBusy(null);
        if ("error" in res && res.error) return toast.error(res.error);
        if ("url" in res && res.url) window.open(res.url, "_blank", "noopener,noreferrer");
    }

    return (
        <ul className="flex flex-wrap gap-2">
            {files.map((f) => (
                <li key={f.id}>
                    <button
                        type="button"
                        onClick={() => open(f.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-muted"
                    >
                        {busy === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
                        <span className="max-w-[200px] truncate">{f.fileName}</span>
                        <span className="text-xs text-muted-foreground">{formatSize(f.size)}</span>
                        <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                </li>
            ))}
        </ul>
    );
}

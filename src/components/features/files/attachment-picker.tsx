"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/upload-client";
import { formatSize } from "./file-chips";

export type PickedFile = { fileId: string; name: string; size: number };

const ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp";

/** Chọn và upload tệp (tối đa `max`), trả danh sách fileId qua onChange. */
export function AttachmentPicker({
    purpose,
    value,
    onChange,
    max = 5,
}: {
    purpose: "reflection" | "submission";
    value: PickedFile[];
    onChange: (files: PickedFile[]) => void;
    max?: number;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
        const picked = Array.from(e.target.files ?? []);
        e.target.value = "";
        if (!picked.length) return;
        if (value.length + picked.length > max) return toast.error(`Tối đa ${max} tệp.`);

        setUploading(true);
        const next = [...value];
        for (const f of picked) {
            const res = await uploadFile(f, purpose, f.name);
            if ("error" in res) toast.error(`${f.name}: ${res.error}`);
            else next.push({ fileId: res.fileId, name: f.name, size: f.size });
        }
        onChange(next);
        setUploading(false);
    }

    return (
        <div className="space-y-2">
            {value.length > 0 && (
                <ul className="space-y-1.5">
                    {value.map((f) => (
                        <li key={f.fileId} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
                            <span className="truncate text-foreground">{f.name}</span>
                            <span className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-muted-foreground">{formatSize(f.size)}</span>
                                <button type="button" aria-label="Bỏ tệp" onClick={() => onChange(value.filter((x) => x.fileId !== f.fileId))}>
                                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={onPick} />
            <Button type="button" variant="outline" size="sm" disabled={uploading || value.length >= max} onClick={() => inputRef.current?.click()}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                Đính kèm tệp
            </Button>
            <p className="text-xs text-muted-foreground">PDF, Word, PowerPoint, Excel, ảnh, tối đa 10MB mỗi tệp.</p>
        </div>
    );
}

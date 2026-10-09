"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFileDownloadUrl } from "@/lib/actions/files";

export function SelfieViewButton({ fileId }: { fileId: string }) {
    const [busy, setBusy] = useState(false);
    async function open() {
        setBusy(true);
        const res = await getFileDownloadUrl(fileId);
        setBusy(false);
        if ("error" in res && res.error) return toast.error(res.error);
        if ("url" in res && res.url) window.open(res.url, "_blank", "noopener,noreferrer");
    }
    return (
        <Button type="button" variant="ghost" size="xs" onClick={open} disabled={busy}>
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}Xem selfie
        </Button>
    );
}

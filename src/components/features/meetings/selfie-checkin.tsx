"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImage, uploadFile } from "@/lib/upload-client";
import { selfieCheckIn } from "@/lib/actions/checkin";

export function SelfieCheckin({ meetingId }: { meetingId: string }) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [phase, setPhase] = useState<"idle" | "camera" | "preview" | "sending">("idle");
    const [photo, setPhoto] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    }, []);

    useEffect(() => () => stopCamera(), [stopCamera]);
    useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

    async function openCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
            streamRef.current = stream;
            setPhase("camera");
            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    void videoRef.current.play();
                }
            });
        } catch {
            toast.error("Không mở được camera. Hãy cấp quyền camera cho trình duyệt.");
        }
    }

    async function capture() {
        const video = videoRef.current;
        if (!video || !video.videoWidth) return;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")!.drawImage(video, 0, 0);
        const raw = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
        if (!raw) return toast.error("Không chụp được ảnh.");
        const small = await compressImage(raw);
        stopCamera();
        setPhoto(small);
        setPreviewUrl(URL.createObjectURL(small));
        setPhase("preview");
    }

    async function submit() {
        if (!photo) return;
        setPhase("sending");
        const up = await uploadFile(photo, "selfie", "selfie.jpg");
        if ("error" in up) {
            toast.error(up.error);
            return setPhase("preview");
        }
        const res = await selfieCheckIn({ meetingId, selfieFileId: up.fileId });
        if ("error" in res && res.error) {
            toast.error(res.error);
            return setPhase("preview");
        }
        toast.success("Check-in thành công");
        router.refresh();
    }

    if (phase === "idle") {
        return (
            <Button onClick={openCamera} className="w-full sm:w-auto">
                <Camera className="w-4 h-4" /> Chụp selfie để check-in
            </Button>
        );
    }

    return (
        <div className="space-y-3 max-w-sm">
            <div className="aspect-[3/4] overflow-hidden rounded-lg border border-border bg-muted">
                {phase === "camera" ? (
                    <video ref={videoRef} playsInline muted className="h-full w-full object-cover -scale-x-100" />
                ) : (
                    previewUrl && /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={previewUrl} alt="Ảnh selfie" className="h-full w-full object-cover -scale-x-100" />
                )}
            </div>
            <div className="flex gap-2">
                {phase === "camera" && (
                    <Button onClick={capture} className="flex-1"><Camera className="w-4 h-4" /> Chụp</Button>
                )}
                {(phase === "preview" || phase === "sending") && (
                    <>
                        <Button variant="outline" disabled={phase === "sending"} onClick={() => { setPhoto(null); setPreviewUrl(null); void openCamera(); }}>
                            <RefreshCw className="w-4 h-4" /> Chụp lại
                        </Button>
                        <Button onClick={submit} disabled={phase === "sending"} className="flex-1">
                            {phase === "sending" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Xác nhận check-in
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

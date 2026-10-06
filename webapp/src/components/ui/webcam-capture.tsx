"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Check, AlertCircle, Upload } from "lucide-react";

interface WebcamCaptureProps {
    onCapture: (dataUrl: string) => void;
    initialImage?: string | null;
    title?: string;
    description?: string;
    aspectRatio?: "square" | "portrait";
}

export function WebcamCapture({
    onCapture,
    initialImage,
    title = "Chụp ảnh xác thực",
    description = "Đặt khuôn mặt ở giữa khung hình và bấm chụp",
    aspectRatio = "square"
}: WebcamCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(initialImage || null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);

    const startCamera = async () => {
        setCameraError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 640 }
                },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
                setIsStreaming(true);
            }
        } catch (err: any) {
            console.error("Camera access error:", err);
            setCameraError(
                "Không thể truy cập camera. Vui lòng cấp quyền camera trên trình duyệt hoặc tải ảnh từ thiết bị."
            );
            setIsStreaming(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
            setIsStreaming(false);
        }
    };

    useEffect(() => {
        if (!capturedImage) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, []);

    const handleTakePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const width = video.videoWidth || 480;
        const height = video.videoHeight || 480;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw flipped image for natural mirror effect
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(dataUrl);
        onCapture(dataUrl);
        stopCamera();
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setCapturedImage(dataUrl);
            onCapture(dataUrl);
            stopCamera();
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="text-center">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>

            <div className={`relative w-64 h-64 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center ${aspectRatio === "portrait" ? "h-80" : ""}`}>
                {capturedImage ? (
                    <img
                        src={capturedImage}
                        alt="Captured Portrait"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover -scale-x-100"
                        />
                        {/* Overlay frame guide */}
                        <div className="absolute inset-4 border-2 border-dashed border-primary/40 rounded-full pointer-events-none" />
                    </>
                )}

                {cameraError && !capturedImage && (
                    <div className="absolute inset-0 bg-background/90 p-4 flex flex-col items-center justify-center text-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                        <p className="text-xs text-muted-foreground">{cameraError}</p>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2"
                        >
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            Tải ảnh từ máy
                        </Button>
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
            />

            <div className="flex items-center gap-2">
                {capturedImage ? (
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRetake}
                            className="text-xs"
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Chụp lại
                        </Button>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-900/60">
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Đã ghi nhận ảnh
                        </div>
                    </>
                ) : (
                    <>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleTakePhoto}
                            disabled={!isStreaming}
                            className="text-xs"
                        >
                            <Camera className="w-3.5 h-3.5 mr-1.5" />
                            Chụp ảnh ngay
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-muted-foreground"
                        >
                            <Upload className="w-3.5 h-3.5 mr-1" />
                            Tải tệp ảnh
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

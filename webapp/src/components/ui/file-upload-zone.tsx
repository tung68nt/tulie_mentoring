"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
    Upload,
    FileText,
    FileCode,
    FileArchive,
    FileSpreadsheet,
    FileImage,
    Film,
    File,
    X,
    CheckCircle2,
    Link2,
    ExternalLink,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface UploadedFileInfo {
    name: string;
    size?: number;
    type?: string;
    dataUrl?: string;
    linkUrl?: string;
    isCloudLink?: boolean;
}

interface FileUploadZoneProps {
    onFileSelected: (info: UploadedFileInfo | null) => void;
    currentFile?: UploadedFileInfo | null;
    accept?: string;
    maxSizeMb?: number;
    allowCloudLinks?: boolean;
    label?: string;
    description?: string;
    className?: string;
}

export function FileUploadZone({
    onFileSelected,
    currentFile,
    accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.png,.jpg,.jpeg,.mp4",
    maxSizeMb = 30,
    allowCloudLinks = true,
    label = "Tải lên tệp tài liệu / bài nộp",
    description = "Hỗ trợ PDF, Word, Excel, Slide, Zip, Ảnh dung lượng tối đa 30MB",
    className = "",
}: FileUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileInfo, setFileInfo] = useState<UploadedFileInfo | null>(currentFile || null);
    const [cloudUrl, setCloudUrl] = useState("");
    const [cloudUrlTitle, setCloudUrlTitle] = useState("");
    const [activeMode, setActiveMode] = useState<"file" | "cloud">("file");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatBytes = (bytes?: number) => {
        if (!bytes || bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const getFileIcon = (name: string, type?: string) => {
        const ext = name.split(".").pop()?.toLowerCase() || "";
        if (["pdf"].includes(ext) || type?.includes("pdf")) {
            return <FileText className="w-6 h-6 text-rose-500" />;
        }
        if (["doc", "docx"].includes(ext) || type?.includes("word")) {
            return <FileText className="w-6 h-6 text-blue-500" />;
        }
        if (["xls", "xlsx", "csv"].includes(ext) || type?.includes("sheet") || type?.includes("excel")) {
            return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
        }
        if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext) || type?.startsWith("image/")) {
            return <FileImage className="w-6 h-6 text-indigo-500" />;
        }
        if (["zip", "rar", "7z", "tar"].includes(ext)) {
            return <FileArchive className="w-6 h-6 text-amber-500" />;
        }
        if (["mp4", "mov", "avi", "webm"].includes(ext) || type?.startsWith("video/")) {
            return <Film className="w-6 h-6 text-purple-500" />;
        }
        if (["js", "ts", "tsx", "py", "html", "css", "json", "sql"].includes(ext)) {
            return <FileCode className="w-6 h-6 text-sky-500" />;
        }
        return <File className="w-6 h-6 text-muted-foreground" />;
    };

    const processFile = (file: File) => {
        setErrorMessage(null);
        if (file.size > maxSizeMb * 1024 * 1024) {
            setErrorMessage(`Dung lượng tệp vượt quá ${maxSizeMb}MB. Vui lòng chọn tệp nhỏ hơn hoặc gắn link Google Drive / OneDrive.`);
            return;
        }

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = () => {
            const dataUrl = reader.result as string;
            const newInfo: UploadedFileInfo = {
                name: file.name,
                size: file.size,
                type: file.type || file.name.split(".").pop(),
                dataUrl,
                isCloudLink: false,
            };
            setFileInfo(newInfo);
            onFileSelected(newInfo);
            setIsProcessing(false);
        };

        reader.onerror = () => {
            setErrorMessage("Lỗi khi đọc tệp. Vui lòng thử lại.");
            setIsProcessing(false);
        };

        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            processFile(file);
        }
    };

    const handleCloudSubmit = () => {
        if (!cloudUrl.trim()) return;
        setErrorMessage(null);

        try {
            new URL(cloudUrl);
        } catch {
            setErrorMessage("Đường dẫn URL không hợp lệ (cần bắt đầu bằng http:// hoặc https://)");
            return;
        }

        const newInfo: UploadedFileInfo = {
            name: cloudUrlTitle.trim() || cloudUrl,
            linkUrl: cloudUrl.trim(),
            isCloudLink: true,
            type: "cloud_link",
        };
        setFileInfo(newInfo);
        onFileSelected(newInfo);
    };

    const handleRemove = () => {
        setFileInfo(null);
        setCloudUrl("");
        setCloudUrlTitle("");
        setErrorMessage(null);
        onFileSelected(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    {label}
                </label>
                {allowCloudLinks && !fileInfo && (
                    <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border text-[11px]">
                        <button
                            type="button"
                            onClick={() => setActiveMode("file")}
                            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                                activeMode === "file"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Tệp máy tính
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveMode("cloud")}
                            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                                activeMode === "cloud"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Link đám mây / Drive
                        </button>
                    </div>
                )}
            </div>

            {/* Error banner */}
            {errorMessage && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* When a file or link is selected */}
            {fileInfo ? (
                <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-md flex items-center justify-between gap-4 transition-all animate-in fade-in-50">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-xs">
                            {fileInfo.isCloudLink ? (
                                <ExternalLink className="w-5 h-5 text-sky-500" />
                            ) : (
                                getFileIcon(fileInfo.name, fileInfo.type)
                            )}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {fileInfo.name}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                {fileInfo.isCloudLink ? (
                                    <span className="text-sky-600 dark:text-sky-400 font-medium truncate max-w-xs">
                                        {fileInfo.linkUrl}
                                    </span>
                                ) : (
                                    <>
                                        <span>{formatBytes(fileInfo.size)}</span>
                                        <span>•</span>
                                        <span className="uppercase text-[10px] bg-muted px-1.5 py-0.2 rounded font-mono">
                                            {fileInfo.type || "FILE"}
                                        </span>
                                    </>
                                )}
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                    <CheckCircle2 className="w-3 h-3" /> Đã sẵn sàng
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {fileInfo.linkUrl && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 text-xs rounded-xl"
                            >
                                <a href={fileInfo.linkUrl} target="_blank" rel="noreferrer">
                                    <ExternalLink className="w-3 h-3 mr-1" /> Mở
                                </a>
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ) : activeMode === "file" ? (
                /* Drag and drop zone */
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`relative p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center group flex flex-col items-center justify-center gap-3 backdrop-blur-md ${
                        isDragging
                            ? "border-primary bg-primary/10 scale-[1.01]"
                            : "border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-card/40"
                    }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileInput}
                        className="hidden"
                    />

                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                        isDragging
                            ? "bg-primary text-primary-foreground border-primary scale-110 shadow-lg"
                            : "bg-muted/60 border-border text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/30"
                    }`}>
                        <Upload className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                            {isProcessing ? "Đang xử lý tệp..." : "Kéo thả tệp vào đây hoặc nhấn để chọn"}
                        </p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground/70">
                        <span className="px-2 py-0.5 rounded-md bg-muted/80 font-mono">PDF</span>
                        <span className="px-2 py-0.5 rounded-md bg-muted/80 font-mono">DOCX</span>
                        <span className="px-2 py-0.5 rounded-md bg-muted/80 font-mono">ZIP</span>
                        <span className="px-2 py-0.5 rounded-md bg-muted/80 font-mono">XLSX</span>
                        <span className="px-2 py-0.5 rounded-md bg-muted/80 font-mono">IMAGES</span>
                    </div>
                </div>
            ) : (
                /* Cloud Link input */
                <div className="p-5 rounded-2xl border border-border bg-card/40 backdrop-blur-md space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Tên hiển thị (Tùy chọn)</label>
                        <Input
                            placeholder="VD: Slide thuyết trình buổi 3 (Google Slides)"
                            value={cloudUrlTitle}
                            onChange={(e) => setCloudUrlTitle(e.target.value)}
                            className="text-xs h-9"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Đường dẫn Google Drive, OneDrive, Figma hoặc GitHub</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://drive.google.com/file/d/..."
                                value={cloudUrl}
                                onChange={(e) => setCloudUrl(e.target.value)}
                                className="text-xs h-9 flex-1"
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleCloudSubmit}
                                disabled={!cloudUrl.trim()}
                                className="h-9 text-xs px-4 rounded-xl"
                            >
                                <Link2 className="w-3.5 h-3.5 mr-1.5" /> Gắn link
                            </Button>
                        </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Lưu ý: Đảm bảo link Google Drive/OneDrive đã được bật chế độ "Bất kỳ ai có đường liên kết đều có thể xem" (Anyone with link can view).
                    </p>
                </div>
            )}
        </div>
    );
}

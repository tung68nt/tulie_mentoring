"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    ExternalLink,
    Copy,
    Check,
    FileText,
    FileCode,
    FileImage,
    Film,
    File,
    Maximize2,
    Calendar,
    User,
    Eye,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface FileItem {
    id?: string;
    title: string;
    description?: string | null;
    fileUrl?: string | null;
    linkUrl?: string | null;
    type?: string;
    category?: string;
    uploadedBy?: { firstName?: string | null; lastName?: string | null } | null;
    createdAt?: Date | string;
}

interface FileViewerModalProps {
    file: FileItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export function FileViewerModal({ file, isOpen, onClose }: FileViewerModalProps) {
    const [copied, setCopied] = useState(false);

    if (!file) return null;

    const targetUrl = file.fileUrl || file.linkUrl || "";
    const isImage = /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(targetUrl) || targetUrl.startsWith("data:image/");
    const isPdf = /\.pdf$/i.test(targetUrl) || targetUrl.startsWith("data:application/pdf");
    const isVideo = /\.(mp4|webm|mov)$/i.test(targetUrl) || targetUrl.startsWith("data:video/");
    const isCloudDoc = /docs\.google\.com|drive\.google\.com|figma\.com|notion\.so|github\.com/i.test(targetUrl);

    const handleCopy = () => {
        if (!targetUrl) return;
        navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden rounded-3xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            {file.category && (
                                <Badge variant="secondary" className="text-[10px] font-semibold">
                                    {file.category}
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                {file.type || "Tài liệu"}
                            </Badge>
                        </div>
                        <DialogTitle className="text-lg font-bold text-foreground truncate">
                            {file.title}
                        </DialogTitle>
                        {file.description && (
                            <DialogDescription className="text-xs text-muted-foreground line-clamp-1">
                                {file.description}
                            </DialogDescription>
                        )}
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        {targetUrl && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="h-8 text-xs rounded-xl"
                                    title="Sao chép liên kết"
                                >
                                    {copied ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                                    )}
                                    {copied ? "Đã chép" : "Chép link"}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="h-8 text-xs rounded-xl"
                                    title="Mở trong tab mới"
                                >
                                    <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                        Mở tab mới
                                    </a>
                                </Button>

                                {!isCloudDoc && (
                                    <Button
                                        size="sm"
                                        asChild
                                        className="h-8 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        <a href={targetUrl} download={file.title}>
                                            <Download className="w-3.5 h-3.5 mr-1.5" />
                                            Tải về
                                        </a>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Main Viewer Body */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center min-h-[350px] max-h-[68vh] bg-black/5 dark:bg-black/30">
                    {!targetUrl ? (
                        <div className="text-center p-8 space-y-2">
                            <File className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                            <p className="text-sm font-medium text-muted-foreground">Tài liệu không có đường dẫn tệp trực tiếp.</p>
                        </div>
                    ) : isImage ? (
                        <div className="relative max-h-full max-w-full flex items-center justify-center p-2">
                            <img
                                src={targetUrl}
                                alt={file.title}
                                className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-lg border border-border/50"
                            />
                        </div>
                    ) : isPdf ? (
                        <div className="w-full h-[62vh] rounded-2xl overflow-hidden border border-border shadow-inner bg-background">
                            <iframe
                                src={targetUrl}
                                className="w-full h-full border-none"
                                title={file.title}
                            />
                        </div>
                    ) : isVideo ? (
                        <div className="w-full max-w-2xl rounded-2xl overflow-hidden bg-black shadow-lg">
                            <video controls className="w-full h-auto max-h-[60vh]">
                                <source src={targetUrl} />
                                Trình duyệt không hỗ trợ xem video trực tiếp.
                            </video>
                        </div>
                    ) : isCloudDoc ? (
                        <div className="p-8 max-w-md w-full rounded-2xl border border-border bg-card shadow-sm text-center space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                                <ExternalLink className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-base font-bold text-foreground">Tài liệu trực tuyến</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Tài liệu này được lưu trữ trên nền tảng đám mây (Google Drive, Docs, Figma hoặc GitHub).
                                </p>
                            </div>
                            <Button asChild className="w-full rounded-xl h-10 font-semibold text-xs shadow-xs">
                                <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Truy cập tài liệu ngay
                                </a>
                            </Button>
                        </div>
                    ) : (
                        <div className="p-8 max-w-md w-full rounded-2xl border border-border bg-card shadow-sm text-center space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                                <FileText className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-base font-bold text-foreground">{file.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                    Định dạng tệp này có thể tải về để mở trên máy tính cá nhân.
                                </p>
                            </div>
                            <Button asChild className="w-full rounded-xl h-10 font-semibold text-xs shadow-xs">
                                <a href={targetUrl} download={file.title}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Tải tệp về máy
                                </a>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer Metadata */}
                <div className="px-6 py-3 border-t border-border bg-muted/10 flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-4">
                        {file.uploadedBy && (
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                Đăng bởi: {file.uploadedBy.firstName} {file.uploadedBy.lastName}
                            </span>
                        )}
                        {file.createdAt && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Ngày tạo: {formatDate(file.createdAt)}
                            </span>
                        )}
                    </div>

                    <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs rounded-lg">
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

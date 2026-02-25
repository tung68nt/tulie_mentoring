"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateWikiPage, deleteWikiPage } from "@/lib/actions/wiki";
import { BlockEditor } from "@/components/ui/block-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, Save, Loader2, Globe, Shield, Lock, Trash2, Layout } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface WikiEditFormProps {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    page: any;
}

export function WikiEditForm({ page }: WikiEditFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState(page.title);
    const [category, setCategory] = useState(page.category || "");
    const [visibility, setVisibility] = useState<string>(page.visibility);
    const [content, setContent] = useState(page.content);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleSave() {
        if (!title) {
            toast.error("Vui lòng nhập tiêu đề trang");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateWikiPage(page.id, {
                title,
                content,
                category,
                visibility
            });
            toast.success("Đã cập nhật trang Wiki");
            router.push(`/wiki/${page.slug}`);
            router.refresh();
        } catch {
            toast.error("Không thể cập nhật trang. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        setIsDeleting(true);
        try {
            await deleteWikiPage(page.id);
            toast.success("Đã xóa trang Wiki");
            router.push("/wiki");
        } catch {
            toast.error("Không thể xóa trang. Vui lòng thử lại.");
            setIsDeleting(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-fade-in">
            <header className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                    <Link href={`/wiki/${page.slug}`}>
                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-accent/50 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground leading-none no-uppercase">Chỉnh sửa tài liệu</h1>
                        <p className="text-[11px] text-muted-foreground/50 no-uppercase font-bold tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            SLUG: {page.slug}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="rounded-lg text-destructive hover:bg-destructive/5 hover:text-destructive no-uppercase gap-2">
                                <Trash2 className="w-4 h-4" />
                                Xóa trang
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-xl border border-border/60 shadow-none">
                            <DialogHeader>
                                <DialogTitle className="no-uppercase font-bold">Xác nhận xóa tài liệu?</DialogTitle>
                                <DialogDescription className="no-uppercase">
                                    Hành động này không thể hoàn tác. Trang wiki &quot;{page.title}&quot; sẽ bị xóa vĩnh viễn khỏi hệ thống.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <Button variant="ghost" onClick={() => (document.querySelector('[data-state="open"]') as any)?.click()} className="rounded-lg no-uppercase border-border">Hủy</Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="rounded-lg no-uppercase bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isDeleting ? "Đang xóa..." : "Xóa tài liệu"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="rounded-lg no-uppercase min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Cập nhật
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em] px-1">Tiêu đề tài liệu</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề ấn tượng..."
                            className="text-3xl font-bold h-20 rounded-xl border-border/40 focus:border-primary/20 px-8 flex-1 bg-background/50 backdrop-blur-sm transition-all shadow-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em] px-1">Nội dung chi tiết</label>
                        <div className="rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm shadow-none overflow-hidden ring-1 ring-border/5">
                            <BlockEditor
                                initialContent={content}
                                onChange={setContent}
                                className="min-h-[700px] border-none"
                            />
                        </div>
                    </div>
                </div>

                <aside className="space-y-6">
                    <Card className="p-8 rounded-xl border-border/40 shadow-none bg-muted/20 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground/60 no-uppercase">Danh mục</label>
                            <div className="relative">
                                <Layout className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                <Input
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="Danh mục..."
                                    className="rounded-lg border-border/40 bg-background pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground/60 no-uppercase">Phạm vi hiển thị</label>
                            <Select
                                value={visibility}
                                onValueChange={(v: string) => setVisibility(v)}
                            >
                                <SelectTrigger className="rounded-lg border-border/40 bg-background h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="public">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-3.5 h-3.5 text-blue-500" />
                                            <span>Công khai</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="mentor_only">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-3.5 h-3.5 text-purple-500" />
                                            <span>Chỉ Mentors</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="mentee_only">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-3.5 h-3.5 text-orange-500" />
                                            <span>Chỉ Mentees</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWikiPage } from "@/lib/actions/wiki";
import { BlockEditor } from "@/components/ui/block-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Save, Loader2, Globe, Shield, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewWikiPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [visibility, setVisibility] = useState<"public" | "mentor_only" | "mentee_only">("public");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSave() {
        if (!title) {
            toast.error("Vui lòng nhập tiêu đề trang");
            return;
        }
        if (!content || content === "[]") {
            toast.error("Vui lòng nhập nội dung trang");
            return;
        }

        setIsSubmitting(true);
        try {
            const page = await createWikiPage({
                title,
                content,
                category,
                visibility
            });
            toast.success("Đã tạo trang Wiki thành công");
            router.push(`/wiki/${page.slug}`);
        } catch (error) {
            toast.error("Không thể tạo trang. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-fade-in">
            <header className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/wiki">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold no-uppercase">Tạo tài liệu mới</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="rounded-xl no-uppercase"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="rounded-xl no-uppercase min-w-[120px] shadow-none"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Lưu trang
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground/60 no-uppercase px-1">Tiêu đề tài liệu</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề ấn tượng..."
                            className="text-2xl font-bold h-16 rounded-xl border-border/40 focus:border-primary/30 px-6 shadow-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground/60 no-uppercase px-1">Nội dung chi tiết</label>
                        <BlockEditor
                            onChange={setContent}
                            className="min-h-[500px] rounded-xl border-border/40 shadow-none"
                        />
                    </div>
                </div>

                <aside className="space-y-6">
                    <Card className="p-6 rounded-xl border-border/40 shadow-none bg-muted/20 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground/60 no-uppercase">Danh mục</label>
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="Ví dụ: Kỹ năng, Định hướng..."
                                className="rounded-xl border-border/40 bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground/60 no-uppercase">Phạm vi hiển thị</label>
                            <Select
                                value={visibility}
                                onValueChange={(v: any) => setVisibility(v)}
                            >
                                <SelectTrigger className="rounded-xl border-border/40 bg-background h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
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

// Minimal local card for layout
function Card({ children, className, padding = "default" }: any) {
    return (
        <div className={`bg-background border border-border overflow-hidden ${className}`}>
            {children}
        </div>
    );
}

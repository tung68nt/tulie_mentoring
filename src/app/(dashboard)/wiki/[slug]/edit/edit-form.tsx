"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateWikiPage, deleteWikiPage, searchUsersForSharing } from "@/lib/actions/wiki";
import { BlockEditor } from "@/components/ui/block-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, Save, Loader2, Globe, Lock, Users, UserCheck, Trash2, Layout, Search, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const visibilityOptions = [
    { value: "private", label: "Chỉ mình tôi", icon: Lock, color: "text-gray-500", desc: "Không ai khác xem được" },
    { value: "mentorship", label: "Nhóm Mentoring", icon: Users, color: "text-blue-500", desc: "Mentor/Mentee và Manager của tôi" },
    { value: "public", label: "Cộng đồng", icon: Globe, color: "text-emerald-500", desc: "Toàn bộ mọi người" },
    { value: "selected", label: "Chọn người", icon: UserCheck, color: "text-purple-500", desc: "Chỉ người được chọn" },
];

interface WikiEditFormProps {
    page: any;
}

export function WikiEditForm({ page }: WikiEditFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState(page.title);
    const [category, setCategory] = useState(page.category || "");
    const [visibility, setVisibility] = useState<string>(page.visibility || "private");
    const [coverImage, setCoverImage] = useState(page.coverImage || "");
    const [content, setContent] = useState(page.content);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // User picker state
    const [selectedUsers, setSelectedUsers] = useState<{ id: string; firstName: string; lastName: string; email: string }[]>(
        page.shares?.map((s: any) => s.user).filter(Boolean) || []
    );
    const [userSearch, setUserSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (visibility !== "selected" || userSearch.length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchUsersForSharing(userSearch);
                setSearchResults(results.filter((u: any) => !selectedUsers.some(s => s.id === u.id)));
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearch, visibility, selectedUsers]);

    async function handleSave() {
        if (!title) {
            toast.error("Vui lòng nhập tiêu đề trang");
            return;
        }

        if (visibility === "selected" && selectedUsers.length === 0) {
            toast.error("Vui lòng chọn ít nhất một người để chia sẻ");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateWikiPage(page.id, {
                title,
                content,
                category,
                visibility,
                coverImage,
                shareWithUserIds: visibility === "selected" ? selectedUsers.map(u => u.id) : [],
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
                        <label className="text-[10px] font-bold text-muted-foreground/40 no-uppercase tracking-[0.1em] px-1">Tiêu đề tài liệu</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề ấn tượng..."
                            className="text-3xl font-bold h-20 rounded-xl border-border/40 focus:border-primary/20 px-8 flex-1 bg-background/50 backdrop-blur-sm transition-all shadow-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground/40 no-uppercase tracking-[0.1em] px-1">Nội dung chi tiết</label>
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
                            <label className="text-[11px] font-bold text-muted-foreground/60 no-uppercase">Ảnh bìa (URL)</label>
                            <Input
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                placeholder="https://unsplash.com/..."
                                className="rounded-lg border-border/40 bg-background"
                            />
                        </div>

                        {/* Visibility radio group — matches new/page.tsx */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-muted-foreground/60 no-uppercase">Phạm vi chia sẻ</label>
                            <div className="space-y-2">
                                {visibilityOptions.map((opt) => {
                                    const Icon = opt.icon;
                                    const isSelected = visibility === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => setVisibility(opt.value)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all text-sm ${
                                                isSelected
                                                    ? "border-primary/40 bg-primary/5"
                                                    : "border-border/40 bg-background hover:border-border"
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${opt.color}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium leading-tight ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {opt.label}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{opt.desc}</p>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
                                                isSelected ? "border-primary bg-primary" : "border-border"
                                            }`}>
                                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[3px]" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* User picker — only when "selected" */}
                        {visibility === "selected" && (
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-muted-foreground/60 no-uppercase">Chọn người nhận</label>

                                {/* Selected users chips */}
                                {selectedUsers.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedUsers.map(u => (
                                            <span
                                                key={u.id}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 text-[11px] font-medium"
                                            >
                                                {u.firstName} {u.lastName}
                                                <button
                                                    onClick={() => setSelectedUsers(prev => prev.filter(s => s.id !== u.id))}
                                                    className="hover:text-destructive transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Search input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                                    <Input
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder="Tìm theo tên hoặc email..."
                                        className="rounded-lg border-border/40 bg-background pl-8 h-9 text-[12px]"
                                    />
                                </div>

                                {/* Search results dropdown */}
                                {(searchResults.length > 0 || isSearching) && (
                                    <div className="border border-border/40 rounded-lg bg-background max-h-40 overflow-y-auto">
                                        {isSearching ? (
                                            <div className="p-3 text-center text-[11px] text-muted-foreground">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto mb-1" />
                                                Đang tìm...
                                            </div>
                                        ) : (
                                            searchResults.map(u => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => {
                                                        setSelectedUsers(prev => [...prev, u]);
                                                        setUserSearch("");
                                                        setSearchResults([]);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/30 transition-colors text-[12px]"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                        {u.firstName?.[0]}{u.lastName?.[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-foreground truncate">{u.firstName} {u.lastName}</p>
                                                        <p className="text-[10px] text-muted-foreground/60 truncate">{u.email}</p>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}

                                {userSearch.length > 0 && userSearch.length < 2 && (
                                    <p className="text-[10px] text-muted-foreground/50 px-1">Nhập ít nhất 2 ký tự để tìm kiếm</p>
                                )}
                            </div>
                        )}
                    </Card>
                </aside>
            </div>
        </div>
    );
}

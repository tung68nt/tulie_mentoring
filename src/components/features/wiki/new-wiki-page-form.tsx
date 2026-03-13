"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createWikiPage, searchUsersForSharing } from "@/lib/actions/wiki";
import { BlockEditor } from "@/components/ui/block-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Save, Loader2, Globe, Lock, Users, UserCheck, Search, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const visibilityOptions = [
    { value: "private", label: "Chỉ mình tôi", icon: Lock, color: "text-muted-foreground", desc: "Không ai khác xem được" },
    { value: "mentorship", label: "Nhóm Mentoring", icon: Users, color: "text-blue-600", desc: "Mentor/Mentee và Manager của tôi" },
    { value: "public", label: "Cộng đồng", icon: Globe, color: "text-emerald-600", desc: "Toàn bộ mọi người" },
    { value: "selected", label: "Chọn người", icon: UserCheck, color: "text-purple-600", desc: "Chỉ người được chọn" },
];

interface NewWikiPageFormProps {
    wikiSlug: string;
    wikiId: string;
    wikiTitle: string;
}

export function NewWikiPageForm({ wikiSlug, wikiId, wikiTitle }: NewWikiPageFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [visibility, setVisibility] = useState("private");
    const [coverImage, setCoverImage] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // User picker state
    const [selectedUsers, setSelectedUsers] = useState<{ id: string; firstName: string; lastName: string; email: string }[]>([]);
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
        if (!content || content === "[]") {
            toast.error("Vui lòng nhập nội dung trang");
            return;
        }
        if (visibility === "selected" && selectedUsers.length === 0) {
            toast.error("Vui lòng chọn ít nhất một người để chia sẻ");
            return;
        }

        setIsSubmitting(true);
        try {
            const page = await createWikiPage({
                title,
                content,
                wikiId,
                visibility: visibility as any,
                coverImage,
                shareWithUserIds: visibility === "selected" ? selectedUsers.map(u => u.id) : undefined,
            });
            toast.success("Đã tạo trang Wiki thành công");
            router.push(`/wiki/${wikiSlug}/${page.slug}`);
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
                    <Link href={`/wiki/${wikiSlug}`}>
                        <Button variant="ghost" size="icon" className="rounded-lg">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Tạo trang mới</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            trong wiki: {wikiTitle}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="rounded-lg"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="rounded-lg min-w-[120px] shadow-none"
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
                <div className="space-y-6 min-w-0 overflow-hidden">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground px-1">Tiêu đề trang</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề..."
                            className="text-2xl font-semibold h-14 rounded-lg border-border/40 focus:border-primary/30 px-5 shadow-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground px-1">Nội dung</label>
                        <BlockEditor
                            onChange={setContent}
                            className="min-h-[500px] rounded-lg border-border/40 shadow-none"
                        />
                    </div>
                </div>

                <aside className="space-y-6">
                    <SideCard>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Ảnh bìa (URL)</label>
                            <Input
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                placeholder="https://..."
                                className="rounded-lg border-border/40 bg-background"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-medium text-muted-foreground">Phạm vi chia sẻ</label>
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

                        {/* User picker */}
                        {visibility === "selected" && (
                            <div className="space-y-3">
                                <label className="text-xs font-medium text-muted-foreground">Chọn người nhận</label>

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

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                                    <Input
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder="Tìm theo tên hoặc email..."
                                        className="rounded-lg border-border/40 bg-background pl-8 h-9 text-xs"
                                    />
                                </div>

                                {(searchResults.length > 0 || isSearching) && (
                                    <div className="border border-border/40 rounded-lg bg-background max-h-40 overflow-y-auto">
                                        {isSearching ? (
                                            <div className="p-3 text-center text-xs text-muted-foreground">
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
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/30 transition-colors text-xs"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center text-[10px] font-medium shrink-0">
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
                            </div>
                        )}
                    </SideCard>
                </aside>
            </div>
        </div>
    );
}

function SideCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background border border-border rounded-lg p-6 space-y-6">
            {children}
        </div>
    );
}

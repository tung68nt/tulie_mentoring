"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    ChevronRight, ChevronDown, FileText,
    Search, Plus, PanelLeftClose, PanelLeft,
    FolderOpen, Folder, BookOpen, MoreHorizontal,
    Pencil, Trash2, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    createWikiCategory,
    updateWikiCategory,
    deleteWikiCategory,
    createWiki,
    updateWiki,
    deleteWiki,
} from "@/lib/actions/wiki";
import { toast } from "sonner";

interface WikiPage {
    id: string;
    title: string;
    slug: string;
    order: number;
    wikiId: string | null;
}

interface WikiItem {
    id: string;
    title: string;
    slug: string;
    order: number;
    visibility: string;
    pages: WikiPage[];
}

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    order: number;
    wikis: WikiItem[];
}

interface WikiTreeSidebarProps {
    structure: CategoryItem[];
}

export function WikiTreeSidebar({ structure }: WikiTreeSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [search, setSearch] = useState("");
    const [expandedCats, setExpandedCats] = useState<Set<string>>(() => {
        // Auto-expand categories that contain the current page
        const expanded = new Set<string>();
        structure.forEach(cat => {
            cat.wikis.forEach(wiki => {
                if (pathname.includes(wiki.slug)) {
                    expanded.add(cat.id);
                }
                wiki.pages.forEach(page => {
                    if (pathname.includes(page.slug)) {
                        expanded.add(cat.id);
                    }
                });
            });
        });
        return expanded;
    });
    const [expandedWikis, setExpandedWikis] = useState<Set<string>>(() => {
        const expanded = new Set<string>();
        structure.forEach(cat => {
            cat.wikis.forEach(wiki => {
                wiki.pages.forEach(page => {
                    if (pathname.includes(page.slug)) {
                        expanded.add(wiki.id);
                    }
                });
            });
        });
        return expanded;
    });

    // Inline add states
    const [addingCategory, setAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [addingWikiInCat, setAddingWikiInCat] = useState<string | null>(null);
    const [newWikiName, setNewWikiName] = useState("");
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [editingWiki, setEditingWiki] = useState<string | null>(null);
    const [editWikiName, setEditWikiName] = useState("");
    const [isPending, startTransition] = useTransition();

    // Filter
    const filteredStructure = search.trim()
        ? structure.map(cat => ({
            ...cat,
            wikis: cat.wikis.map(wiki => ({
                ...wiki,
                pages: wiki.pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
            })).filter(wiki =>
                wiki.title.toLowerCase().includes(search.toLowerCase()) ||
                wiki.pages.length > 0
            )
        })).filter(cat =>
            cat.name.toLowerCase().includes(search.toLowerCase()) ||
            cat.wikis.length > 0
        )
        : structure;

    const toggleCat = (catId: string) => {
        setExpandedCats(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    };

    const toggleWiki = (wikiId: string) => {
        setExpandedWikis(prev => {
            const next = new Set(prev);
            if (next.has(wikiId)) next.delete(wikiId);
            else next.add(wikiId);
            return next;
        });
    };

    const isCatExpanded = (catId: string) => search.trim() ? true : expandedCats.has(catId);
    const isWikiExpanded = (wikiId: string) => search.trim() ? true : expandedWikis.has(wikiId);

    // ── Actions ──
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        startTransition(async () => {
            try {
                await createWikiCategory({ name: newCategoryName.trim() });
                toast.success("Đã tạo chuyên mục");
                setNewCategoryName("");
                setAddingCategory(false);
                router.refresh();
            } catch {
                toast.error("Không thể tạo chuyên mục");
            }
        });
    };

    const handleCreateWiki = async (categoryId: string) => {
        if (!newWikiName.trim()) return;
        startTransition(async () => {
            try {
                await createWiki({ title: newWikiName.trim(), categoryId });
                toast.success("Đã tạo Wiki");
                setNewWikiName("");
                setAddingWikiInCat(null);
                router.refresh();
            } catch {
                toast.error("Không thể tạo Wiki");
            }
        });
    };

    const handleUpdateCategory = async (id: string) => {
        if (!editCategoryName.trim()) return;
        startTransition(async () => {
            try {
                await updateWikiCategory(id, { name: editCategoryName.trim() });
                toast.success("Đã cập nhật");
                setEditingCategory(null);
                router.refresh();
            } catch {
                toast.error("Không thể cập nhật");
            }
        });
    };

    const handleDeleteCategory = async (id: string) => {
        startTransition(async () => {
            try {
                await deleteWikiCategory(id);
                toast.success("Đã xóa chuyên mục");
                router.refresh();
            } catch (e: any) {
                toast.error(e.message || "Không thể xóa");
            }
        });
    };

    const handleUpdateWiki = async (id: string) => {
        if (!editWikiName.trim()) return;
        startTransition(async () => {
            try {
                await updateWiki(id, { title: editWikiName.trim() });
                toast.success("Đã cập nhật");
                setEditingWiki(null);
                router.refresh();
            } catch {
                toast.error("Không thể cập nhật");
            }
        });
    };

    const handleDeleteWiki = async (id: string) => {
        startTransition(async () => {
            try {
                await deleteWiki(id);
                toast.success("Đã xóa Wiki");
                router.refresh();
            } catch (e: any) {
                toast.error(e.message || "Không thể xóa");
            }
        });
    };

    // ── Collapsed view ──
    if (collapsed) {
        return (
            <div className="w-12 flex-shrink-0 border-r border-border/40 bg-muted/5 flex flex-col items-center py-4 gap-2 transition-all duration-200">
                <button
                    className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
                    onClick={() => setCollapsed(false)}
                >
                    <PanelLeft className="w-4 h-4" />
                </button>
                <div className="w-6 h-px bg-border/30 my-1" />
                {structure.slice(0, 6).map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => { setCollapsed(false); toggleCat(cat.id); }}
                        title={cat.name}
                        className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <Folder className="w-3.5 h-3.5" />
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="w-64 flex-shrink-0 border-r border-border/40 bg-muted/5 flex flex-col transition-all duration-200 h-full overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between">
                <Link href="/wiki" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <BookOpen className="w-4 h-4 text-primary/60" />
                    <span className="text-sm font-semibold text-foreground tracking-tight">Wiki</span>
                </Link>
                <button
                    className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
                    onClick={() => setCollapsed(true)}
                >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/30" />
                    <Input
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-7 pl-7 text-[11px] bg-muted/30 border-transparent focus:border-primary/20 focus:bg-background shadow-none rounded-md"
                    />
                </div>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4 space-y-0.5">
                {filteredStructure.map(cat => {
                    const catExpanded = isCatExpanded(cat.id);
                    const CatFolderIcon = catExpanded ? FolderOpen : Folder;

                    return (
                        <div key={cat.id}>
                            {/* Category level */}
                            <div className="group flex items-center">
                                {editingCategory === cat.id ? (
                                    <div className="flex-1 px-1 py-1">
                                        <Input
                                            autoFocus
                                            value={editCategoryName}
                                            onChange={e => setEditCategoryName(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") handleUpdateCategory(cat.id);
                                                if (e.key === "Escape") setEditingCategory(null);
                                            }}
                                            onBlur={() => handleUpdateCategory(cat.id)}
                                            className="h-6 text-[11px] px-2 shadow-none"
                                            disabled={isPending}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => toggleCat(cat.id)}
                                        className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left hover:bg-muted/50 transition-colors"
                                    >
                                        {catExpanded
                                            ? <ChevronDown className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                                            : <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                                        }
                                        <CatFolderIcon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                                        <span className="text-xs font-semibold text-foreground/70 truncate flex-1">{cat.name}</span>
                                        <span className="text-[10px] text-muted-foreground/30 font-medium">{cat.wikis.length}</span>
                                    </button>
                                )}

                                {/* Category actions */}
                                {editingCategory !== cat.id && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground/20 opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted transition-all shrink-0">
                                                <MoreHorizontal className="w-3 h-3" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={() => {
                                                setAddingWikiInCat(cat.id);
                                                setExpandedCats(prev => new Set(prev).add(cat.id));
                                            }}>
                                                <Plus className="w-3.5 h-3.5 mr-2" />
                                                Thêm Wiki
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                setEditingCategory(cat.id);
                                                setEditCategoryName(cat.name);
                                            }}>
                                                <Pencil className="w-3.5 h-3.5 mr-2" />
                                                Đổi tên
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDeleteCategory(cat.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                Xóa chuyên mục
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            {/* Wikis inside category */}
                            {catExpanded && (
                                <div className="ml-3 pl-2.5 border-l border-border/30 space-y-0.5 my-0.5">
                                    {cat.wikis.map(wiki => {
                                        const wikiExpanded = isWikiExpanded(wiki.id);
                                        const isWikiActive = pathname.includes(`/wiki/${wiki.slug}`);

                                        return (
                                            <div key={wiki.id}>
                                                {/* Wiki level */}
                                                <div className="group/wiki flex items-center">
                                                    {editingWiki === wiki.id ? (
                                                        <div className="flex-1 px-1 py-1">
                                                            <Input
                                                                autoFocus
                                                                value={editWikiName}
                                                                onChange={e => setEditWikiName(e.target.value)}
                                                                onKeyDown={e => {
                                                                    if (e.key === "Enter") handleUpdateWiki(wiki.id);
                                                                    if (e.key === "Escape") setEditingWiki(null);
                                                                }}
                                                                onBlur={() => handleUpdateWiki(wiki.id)}
                                                                className="h-6 text-[11px] px-2 shadow-none"
                                                                disabled={isPending}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => toggleWiki(wiki.id)}
                                                            className={cn(
                                                                "flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left transition-colors",
                                                                isWikiActive ? "bg-primary/5" : "hover:bg-muted/40"
                                                            )}
                                                        >
                                                            {wikiExpanded
                                                                ? <ChevronDown className="w-2.5 h-2.5 text-muted-foreground/40 shrink-0" />
                                                                : <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/40 shrink-0" />
                                                            }
                                                            <BookOpen className={cn(
                                                                "w-3 h-3 shrink-0",
                                                                isWikiActive ? "text-primary" : "text-muted-foreground/40"
                                                            )} />
                                                            <span className={cn(
                                                                "text-[11px] font-medium truncate flex-1",
                                                                isWikiActive ? "text-primary font-semibold" : "text-foreground/70"
                                                            )}>
                                                                {wiki.title}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground/30">{wiki.pages.length}</span>
                                                        </button>
                                                    )}

                                                    {/* Wiki actions */}
                                                    {editingWiki !== wiki.id && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground/20 opacity-0 group-hover/wiki:opacity-100 hover:text-foreground hover:bg-muted transition-all shrink-0">
                                                                    <MoreHorizontal className="w-3 h-3" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/wiki/${wiki.slug}/new`}>
                                                                        <Plus className="w-3.5 h-3.5 mr-2" />
                                                                        Thêm trang
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => {
                                                                    setEditingWiki(wiki.id);
                                                                    setEditWikiName(wiki.title);
                                                                }}>
                                                                    <Pencil className="w-3.5 h-3.5 mr-2" />
                                                                    Đổi tên
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() => handleDeleteWiki(wiki.id)}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                                    Xóa Wiki
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>

                                                {/* Pages inside wiki */}
                                                {wikiExpanded && (
                                                    <div className="ml-3 pl-2 border-l border-border/20 space-y-0.5 my-0.5">
                                                        {wiki.pages.map(page => {
                                                            const isPageActive = pathname.includes(page.slug);
                                                            return (
                                                                <Link
                                                                    key={page.id}
                                                                    href={`/wiki/${wiki.slug}/${page.slug}`}
                                                                    className={cn(
                                                                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all group/page",
                                                                        isPageActive
                                                                            ? "bg-primary/8 text-primary font-semibold"
                                                                            : "text-muted-foreground/70 hover:bg-muted/40 hover:text-foreground font-medium"
                                                                    )}
                                                                >
                                                                    <FileText className={cn(
                                                                        "w-3 h-3 shrink-0",
                                                                        isPageActive ? "text-primary" : "text-muted-foreground/30 group-hover/page:text-muted-foreground/50"
                                                                    )} />
                                                                    <span className="truncate leading-snug">{page.title}</span>
                                                                </Link>
                                                            );
                                                        })}

                                                        {/* Quick add page link */}
                                                        <Link
                                                            href={`/wiki/${wiki.slug}/new`}
                                                            className="flex items-center gap-2 px-2 py-1 rounded-md text-[10px] text-muted-foreground/30 hover:text-primary hover:bg-primary/5 transition-colors"
                                                        >
                                                            <Plus className="w-2.5 h-2.5" />
                                                            Thêm trang
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Inline add wiki */}
                                    {addingWikiInCat === cat.id && (
                                        <div className="px-1 py-1">
                                            <Input
                                                autoFocus
                                                placeholder="Tên Wiki mới..."
                                                value={newWikiName}
                                                onChange={e => setNewWikiName(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === "Enter") handleCreateWiki(cat.id);
                                                    if (e.key === "Escape") { setAddingWikiInCat(null); setNewWikiName(""); }
                                                }}
                                                onBlur={() => {
                                                    if (newWikiName.trim()) handleCreateWiki(cat.id);
                                                    else { setAddingWikiInCat(null); setNewWikiName(""); }
                                                }}
                                                className="h-6 text-[11px] px-2 shadow-none"
                                                disabled={isPending}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredStructure.length === 0 && (
                    <div className="px-3 py-6 text-center">
                        <p className="text-[10px] text-muted-foreground/40">Không tìm thấy.</p>
                    </div>
                )}
            </div>

            {/* Footer — Add Category */}
            <div className="px-3 py-2.5 border-t border-border/30 space-y-1.5">
                {addingCategory ? (
                    <div className="flex items-center gap-1.5">
                        <Input
                            autoFocus
                            placeholder="Tên chuyên mục..."
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") handleCreateCategory();
                                if (e.key === "Escape") { setAddingCategory(false); setNewCategoryName(""); }
                            }}
                            className="h-7 text-[11px] px-2 shadow-none flex-1"
                            disabled={isPending}
                        />
                        {isPending && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                    </div>
                ) : (
                    <button
                        onClick={() => setAddingCategory(true)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium text-muted-foreground/50 hover:text-primary hover:bg-primary/5 transition-colors w-full"
                    >
                        <Plus className="w-3 h-3" />
                        Thêm chuyên mục
                    </button>
                )}
            </div>
        </div>
    );
}

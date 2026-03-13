"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
    BookOpen, FileText, Clock, Plus, ChevronRight, FolderOpen
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WikiDetailViewProps {
    wiki: any;
    role: string;
}

/* ── Page Card ── */
function PageCard({ page, wikiSlug }: { page: any; wikiSlug: string }) {
    return (
        <Link href={`/wiki/${wikiSlug}/${page.slug}`} className="block group">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card hover:border-foreground/20 hover:bg-accent/30 transition-all duration-200">
                <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {page.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <Avatar
                            firstName={page.author?.firstName || ""}
                            lastName={page.author?.lastName || ""}
                            src={page.author?.avatar}
                            size="xs"
                        />
                        <span className="text-xs text-muted-foreground">
                            {page.author?.firstName} {page.author?.lastName}
                        </span>
                        <span className="text-muted-foreground/20">·</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(page.updatedAt)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function WikiDetailView({ wiki, role }: WikiDetailViewProps) {
    const canCreate = ["admin", "manager", "program_manager", "mentor"].includes(role);

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-muted-foreground/40">
                <Link href="/wiki" className="hover:text-primary transition-colors text-xs font-medium">
                    Wiki
                </Link>
                {wiki.category && (
                    <>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-xs font-medium">{wiki.category.name}</span>
                    </>
                )}
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground/50 text-xs font-medium">{wiki.title}</span>
            </nav>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground leading-none">{wiki.title}</h1>
                        {wiki.description && (
                            <p className="text-sm text-muted-foreground mt-1">{wiki.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            {wiki.pages.length} trang
                        </p>
                    </div>
                </div>
                {canCreate && (
                    <Link href={`/wiki/${wiki.slug}/new`}>
                        <Button className="rounded-lg h-9 px-4 font-medium gap-1.5 text-xs shadow-none">
                            <Plus className="w-3.5 h-3.5" />
                            Tạo trang mới
                        </Button>
                    </Link>
                )}
            </div>

            {/* Pages List */}
            {wiki.pages.length === 0 ? (
                <div className="py-20">
                    <EmptyState
                        icon={<FileText className="w-6 h-6" />}
                        title="Chưa có trang nào"
                        description="Tạo trang mới để bắt đầu xây dựng wiki này."
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    {wiki.pages.map((page: any) => (
                        <PageCard key={page.id} page={page} wikiSlug={wiki.slug} />
                    ))}
                </div>
            )}
        </div>
    );
}

"use server";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWikiPageDetail, getWikiDetail } from "@/lib/actions/wiki";
import { BlockEditor } from "@/components/ui/block-editor";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Clock, Edit, ChevronRight, Globe, Lock, Users, UserCheck } from "lucide-react";
import Link from "next/link";
import { DeleteWikiButton } from "@/components/features/wiki/delete-wiki-button";
import { ShareWikiButton } from "@/components/features/wiki/share-wiki-button";
import Image from "next/image";

const visIcons: Record<string, any> = { private: Lock, mentorship: Users, public: Globe, selected: UserCheck };
const visLabels: Record<string, string> = { private: "Riêng tư", mentorship: "Nhóm", public: "Cộng đồng", selected: "Chọn người" };

export default async function WikiPageDetail({ params }: { params: Promise<{ wikiSlug: string; pageSlug: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const { wikiSlug, pageSlug } = await params;
    let page;
    try {
        page = await getWikiPageDetail(pageSlug);
    } catch (e) {
        return notFound();
    }

    const isAuthor = page.authorId === session.user.id;
    const canEdit = (session.user as any).role === "admin" || (session.user as any).role === "mentor" || isAuthor;
    const VisIcon = visIcons[page.visibility] || Lock;

    return (
        <div className="flex flex-col gap-0 max-w-[780px] animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-muted-foreground/40 mb-5">
                <Link href="/wiki" className="hover:text-primary transition-colors text-xs font-medium">
                    Wiki
                </Link>
                {page.wiki && (
                    <>
                        <ChevronRight className="w-3 h-3" />
                        {page.wiki.category && (
                            <>
                                <span className="text-xs font-medium">{page.wiki.category.name}</span>
                                <ChevronRight className="w-3 h-3" />
                            </>
                        )}
                        <Link
                            href={`/wiki/${page.wiki.slug}`}
                            className="hover:text-primary transition-colors text-xs font-medium"
                        >
                            {page.wiki.title}
                        </Link>
                    </>
                )}
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground/50 truncate max-w-[250px] text-xs font-medium">{page.title}</span>
            </nav>

            {/* Cover Image */}
            {page.coverImage && (
                <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden mb-6">
                    <Image
                        src={page.coverImage}
                        alt="Cover"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-semibold text-foreground tracking-tight leading-tight mb-4">
                {page.title}
            </h1>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-2 border-b border-border/30">
                <div className="flex items-center gap-3">
                    <Avatar
                        firstName={page.author?.firstName}
                        lastName={page.author?.lastName}
                        src={page.author?.avatar}
                        size="sm"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground leading-none">
                            {page.author.firstName} {page.author.lastName}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(new Date(page.updatedAt), "dd/MM/yyyy")}
                            </span>
                            <span className="text-muted-foreground/20">·</span>
                            <span className="text-xs text-muted-foreground/40 flex items-center gap-1">
                                <VisIcon className="w-3 h-3" />
                                {visLabels[page.visibility]}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {page.visibility === 'public' && (
                        <ShareWikiButton slug={page.slug} />
                    )}
                    {canEdit && (
                        <>
                            <Link href={`/wiki/${wikiSlug}/${page.slug}/edit`}>
                                <Button variant="ghost" className="h-7 rounded-md gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground" size="sm">
                                    <Edit className="w-3 h-3" />
                                    Sửa
                                </Button>
                            </Link>
                            <DeleteWikiButton id={page.id} title={page.title} />
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="wiki-content">
                <BlockEditor
                    initialContent={page.content}
                    editable={false}
                    className="border-none shadow-none bg-transparent"
                />
            </div>
        </div>
    );
}

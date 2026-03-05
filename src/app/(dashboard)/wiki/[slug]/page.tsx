"use server";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWikiPageDetail } from "@/lib/actions/wiki";
import { BlockEditor } from "@/components/ui/block-editor";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Clock, Edit, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";
import { DeleteWikiButton } from "@/components/features/wiki/delete-wiki-button";
import { ShareWikiButton } from "@/components/features/wiki/share-wiki-button";
import { TableOfContents } from "@/components/features/wiki/wiki-toc";
import Image from "next/image";

export default async function WikiDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const { slug } = await params;
    let page;
    try {
        page = await getWikiPageDetail(slug);
    } catch (e) {
        return notFound();
    }

    const isAuthor = page.authorId === session.user.id;
    const canEdit = (session.user as any).role === "admin" || (session.user as any).role === "mentor" || isAuthor;

    return (
        <div className="flex flex-col gap-6 max-w-[900px] animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="space-y-4">
                <nav className="flex items-center gap-2 text-muted-foreground/50">
                    <Link href="/wiki" className="hover:text-foreground transition-colors font-medium text-[11px]">Wiki</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground/40 truncate max-w-[200px] text-[11px] font-medium">{page.title}</span>
                </nav>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight">
                        {page.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1 pb-4 border-b border-border/40">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-7 h-7 rounded-md border border-border shadow-none">
                                <AvatarImage src={page.author.avatar} />
                                <AvatarFallback className="text-[10px] font-bold">{page.author.firstName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-foreground leading-none">
                                    {page.author.firstName} {page.author.lastName}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 opacity-50" />
                                    Cập nhật {formatDate(new Date(page.updatedAt), "dd/MM/yyyy")}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {page.visibility === 'public' && (
                                <ShareWikiButton slug={page.slug} />
                            )}
                            {canEdit && (
                                <>
                                    <div className="h-5 w-px bg-border/40 mx-1 hidden sm:block" />
                                    <Link href={`/wiki/${page.slug}/edit`}>
                                        <Button variant="outline" className="h-7 rounded-md gap-1.5 shadow-none border-border/60 text-[10px] font-bold" size="sm">
                                            <Edit className="w-3 h-3" />
                                            Chỉnh sửa
                                        </Button>
                                    </Link>
                                    <DeleteWikiButton id={page.id} title={page.title} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Cover Image if exists */}
            {page.coverImage && (
                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-border/40 shadow-none">
                    <Image
                        src={page.coverImage}
                        alt="Cover"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {/* Editor Content Area */}
            <div className="relative pt-4">
                <BlockEditor
                    initialContent={page.content}
                    editable={false}
                    className="border-none shadow-none bg-transparent"
                />
            </div>
        </div>
    );
}

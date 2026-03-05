"use server";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWikiPageDetail } from "@/lib/actions/wiki";
import { BlockEditor } from "@/components/ui/block-editor";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Clock, Edit, ChevronLeft, Calendar, User } from "lucide-react";
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

    // Default cover image if none exists
    const coverImage = page.coverImage || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070";

    return (
        <div className="min-h-screen bg-background animate-in fade-in duration-500">
            {/* Page Cover Banner */}
            <div className="group relative w-full h-[240px] md:h-[300px] overflow-hidden">
                <Image
                    src={coverImage}
                    alt="Cover"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 -mt-24 relative z-10 flex flex-col md:flex-row gap-12 justify-center">
                {/* Main Content Column - Centered and focused */}
                <div className="w-full max-w-[850px] bg-background rounded-t-3xl border-t border-x border-border/40 shadow-sm min-h-[800px]">

                    {/* Header Section */}
                    <div className="px-8 md:px-20 pt-16 pb-12 space-y-8">
                        <Link
                            href="/wiki"
                            className="inline-flex items-center gap-2 text-[12px] font-bold text-muted-foreground/60 hover:text-foreground transition-colors group mb-4 no-uppercase tracking-wider"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            QUAY LẠI WIKI
                        </Link>

                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.15]">
                                {page.title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-b border-border/40 pb-8">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-10 h-10 ring-2 ring-background shadow-sm">
                                        <AvatarImage src={page.author.avatar} />
                                        <AvatarFallback className="text-[10px] font-bold">{page.author.firstName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <p className="text-[14px] font-semibold text-foreground leading-none">
                                            {page.author.firstName} {page.author.lastName}
                                        </p>
                                        <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 font-medium">
                                            <Calendar className="w-3 h-3" />
                                            Cập nhật {formatDate(page.updatedAt, "dd/MM/yyyy")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {page.visibility === 'public' && (
                                        <ShareWikiButton slug={page.slug} />
                                    )}
                                    {canEdit && (
                                        <>
                                            <div className="h-8 w-px bg-border/40 mx-2 hidden sm:block" />
                                            <Link href={`/wiki/${page.slug}/edit`}>
                                                <Button variant="outline" className="rounded-xl gap-2 shadow-none border-border/60" size="sm">
                                                    <Edit className="w-4 h-4" />
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

                    {/* Editor Content Area */}
                    <div className="pb-24">
                        <BlockEditor
                            initialContent={page.content}
                            editable={false}
                            className="border-none shadow-none bg-transparent"
                        />
                    </div>
                </div>

                {/* Right Sidebar - TOC */}
                <TableOfContents content={page.content} />
            </div>
        </div>
    );
}

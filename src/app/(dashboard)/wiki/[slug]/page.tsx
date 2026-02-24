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

export default async function WikiDetailPage({ params }: { params: { slug: string } }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    let page;
    try {
        page = await getWikiPageDetail(params.slug);
    } catch (e) {
        return notFound();
    }

    const isAuthor = page.authorId === session.user.id;
    const canEdit = (session.user as any).role === "admin" || (session.user as any).role === "mentor" || isAuthor;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10 animate-fade-in">
            <Link
                href="/wiki"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors no-uppercase group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại danh sách
            </Link>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                    <h1 className="text-4xl font-bold text-foreground no-uppercase tracking-tight leading-tight">{page.title}</h1>

                    <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-muted-foreground/50 no-uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5" />
                            <span>Tác giả: {page.author.firstName} {page.author.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Cập nhật: {formatDate(page.updatedAt, "dd/MM/yyyy")}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {canEdit && (
                        <>
                            <DeleteWikiButton id={page.id} title={page.title} />
                            <Link href={`/wiki/${page.slug}/edit`}>
                                <Button className="rounded-xl no-uppercase gap-2 shadow-lg shadow-primary/10" size="sm">
                                    <Edit className="w-4 h-4" />
                                    Chỉnh sửa
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="rounded-3xl border border-border/40 bg-background overflow-hidden shadow-sm">
                <div className="p-1 px-2 pb-2">
                    <BlockEditor
                        initialContent={page.content}
                        editable={false}
                        className="border-none shadow-none"
                    />
                </div>
            </div>

            {/* Footer metadata */}
            <div className="pt-8 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 ring-2 ring-muted/50">
                        <AvatarImage src={page.author.avatar} />
                        <AvatarFallback className="text-[10px] font-bold">{page.author.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-bold no-uppercase">{page.author.firstName} {page.author.lastName}</p>
                        <p className="text-[10px] text-muted-foreground/60 no-uppercase tracking-tight">Biên soạn tài liệu này</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

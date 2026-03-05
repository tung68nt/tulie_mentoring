import { getWikiPageDetail } from "@/lib/actions/wiki";
import { BlockEditor } from "@/components/ui/block-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Calendar, User } from "lucide-react";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const page = await getWikiPageDetail(slug);
        return {
            title: `${page.title} - IMP Mentoring Wiki`,
            description: `Tài liệu chia sẻ bởi ${page.author.firstName} ${page.author.lastName}`,
            openGraph: {
                title: page.title,
                description: `Tài liệu chia sẻ bởi ${page.author.firstName} ${page.author.lastName}`,
            }
        };
    } catch (e) {
        return {
            title: "Không tìm thấy trang - IMP Mentoring",
        };
    }
}

export default async function PublicWikiDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let page;
    try {
        // Using existing action which checks visibility -> public automatically
        page = await getWikiPageDetail(slug, true);
    } catch (e) {
        return notFound();
    }

    if (page.visibility !== "public") {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-background border-t">
            <div className="max-w-4xl mx-auto space-y-8 py-12 px-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <h1 className="text-4xl font-bold text-foreground tracking-tight leading-tight">{page.title}</h1>

                        <div className="flex flex-wrap items-center gap-6 text-[13px] font-medium text-muted-foreground/80 tracking-wide">
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
                </div>

                <div className="rounded-xl border border-border/40 bg-background overflow-hidden shadow-none">
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
                            <p className="text-[14px] font-medium">{page.author.firstName} {page.author.lastName}</p>
                            <p className="text-[12px] text-muted-foreground/80 tracking-tight">Biên soạn tài liệu này</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

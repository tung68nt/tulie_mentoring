import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWikiPages } from "@/lib/actions/wiki";
import { WikiList } from "@/components/features/wiki/wiki-list";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function WikiPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const role = (session.user as any).role;
    let myPages: any[] = [];
    let sharedPages: any[] = [];
    let communityPages: any[] = [];

    try {
        const result = await getWikiPages();
        myPages = result.myPages;
        sharedPages = result.sharedPages;
        communityPages = result.communityPages;
    } catch (error) {
        console.error("Failed to fetch wiki pages:", error);
    }

    const totalPages = myPages.length + sharedPages.length + communityPages.length;

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            {/* Lark-style clean header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-foreground leading-none">Wiki</h1>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            {totalPages} tài liệu
                        </p>
                    </div>
                </div>
                <Link href="/wiki/new">
                    <Button className="rounded-lg h-9 px-4 font-semibold gap-1.5 text-[12px] shadow-none">
                        <Plus className="w-3.5 h-3.5" />
                        Tạo mới
                    </Button>
                </Link>
            </div>

            <WikiList
                myPages={myPages}
                sharedPages={sharedPages}
                communityPages={communityPages}
                role={role}
            />
        </div>
    );
}

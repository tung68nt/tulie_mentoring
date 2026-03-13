import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWikiStructure } from "@/lib/actions/wiki";
import { WikiLanding } from "@/components/features/wiki/wiki-list";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function WikiPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const role = (session.user as any).role;
    let structure: any[] = [];

    try {
        structure = await getWikiStructure();
    } catch (error) {
        console.error("Failed to fetch wiki structure:", error);
    }

    const totalWikis = structure.reduce((acc: number, cat: any) => acc + cat.wikis.length, 0);
    const totalPages = structure.reduce((acc: number, cat: any) =>
        acc + cat.wikis.reduce((wAcc: number, w: any) => wAcc + w.pages.length, 0), 0);

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground leading-none">Wiki</h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalWikis} wiki · {totalPages} trang
                        </p>
                    </div>
                </div>
            </div>

            <WikiLanding structure={structure} role={role} />
        </div>
    );
}

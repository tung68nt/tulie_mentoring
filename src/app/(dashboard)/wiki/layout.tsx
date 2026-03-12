import React from "react";
import { getWikiPages } from "@/lib/actions/wiki";
import { WikiSidebar } from "@/components/features/wiki/wiki-sidebar";

export default async function WikiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let pages: any[] = [];
    try {
        const result = await getWikiPages();
        pages = [...result.myPages, ...result.sharedPages, ...result.communityPages];
    } catch (error) {
        console.error("Failed to fetch wiki pages for sidebar:", error);
    }

    return (
        <div className="flex h-[calc(100vh-var(--header-height))] -mx-6 -mt-8 overflow-hidden bg-background">
            <WikiSidebar pages={pages} />
            <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="px-6 py-8 md:px-12 max-w-[1200px] mx-auto min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
